"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

type EventRow = {
  id: string;
  title: string;
  slug: string;
  starts_at: string;
  summary: string | null;
  is_published: boolean;
  cover_path: string | null;
  restaurant_id: string | null;
  gallery_paths?: string[];
};

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [event, setEvent] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [galleryUploading, setGalleryUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single<EventRow>();

      if (error || !data) {
        setError("Esemény nem található.");
      } else {
        setEvent(data);
      }

      setLoading(false);
    })();
  }, [id, router]);

  async function save() {
    if (!event) return;

    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("events")
      .update({
        title: event.title,
        slug: event.slug,
        summary: event.summary,
        is_published: event.is_published,
        gallery_paths: event.gallery_paths ?? [],
      })
      .eq("id", event.id);

    setSaving(false);

    if (error) {
      setError(error.message);
    } else {
      alert("Sikeres mentés!");
    }
  }

  async function uploadCover(file: File) {
    if (!event) return;

    setCoverUploading(true);

    const ext = file.name.split(".").pop();
    const filePath = `events/${event.id}/cover.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("public-media")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setCoverUploading(false);
      return;
    }

    const { error: dbError } = await supabase
      .from("events")
      .update({ cover_path: filePath })
      .eq("id", event.id);

    if (!dbError) {
      setEvent({ ...event, cover_path: filePath });
    }

    setCoverUploading(false);
  }

  async function uploadGalleryImages(files: FileList) {
    if (!event) return;

    setGalleryUploading(true);
    const newPaths: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const uuid = uuidv4();
      const filePath = `events/${event.id}/gallery/${uuid}.${ext}`;

      const { error } = await supabase.storage
        .from("public-media")
        .upload(filePath, file, { upsert: true });

      if (error) {
        setError(error.message);
        setGalleryUploading(false);
        return;
      }

      newPaths.push(filePath);
    }

    setEvent((prev) =>
      prev
        ? {
            ...prev,
            gallery_paths: [...(prev.gallery_paths ?? []), ...newPaths],
          }
        : prev
    );

    setGalleryUploading(false);
  }

  async function deleteGalleryImage(path: string) {
    if (!event) return;
    if (!confirm("Biztosan törlöd ezt a képet?")) return;

    setGalleryUploading(true);

    await supabase.storage.from("public-media").remove([path]);

    const newGallery = (event.gallery_paths ?? []).filter(
      (p) => p !== path
    );

    await supabase
      .from("events")
      .update({ gallery_paths: newGallery })
      .eq("id", event.id);

    setEvent({ ...event, gallery_paths: newGallery });
    setGalleryUploading(false);
  }

  async function removeEvent() {
    if (!event) return;
    if (!confirm("Biztosan törlöd az eseményt?")) return;

    await supabase.from("events").delete().eq("id", event.id);
    router.replace("/admin/events");
  }

  if (loading) return <div className="p-6">Betöltés…</div>;
  if (!event) return <div className="p-6 text-red-600">{error}</div>;

  const coverUrl = event.cover_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${event.cover_path}`
    : null;

  return (
    <main className="p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">Esemény szerkesztése</h1>

        <input
          className="w-full border rounded p-3"
          value={event.title}
          onChange={(e) => setEvent({ ...event, title: e.target.value })}
          placeholder="Cím"
        />

        <input
          className="w-full border rounded p-3"
          value={event.slug}
          onChange={(e) => setEvent({ ...event, slug: e.target.value })}
          placeholder="Slug"
        />

        <textarea
          className="w-full border rounded p-3"
          value={event.summary ?? ""}
          onChange={(e) =>
            setEvent({ ...event, summary: e.target.value })
          }
          placeholder="Rövid leírás"
        />

        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={event.is_published}
            onChange={(e) =>
              setEvent({ ...event, is_published: e.target.checked })
            }
          />
          Publikus
        </label>

        {/* COVER */}
        <div className="space-y-2">
          <div className="font-medium">Borítókép</div>
          {coverUrl && (
            <div className="relative h-48 w-full border rounded overflow-hidden">
              <Image
                src={coverUrl}
                alt="Cover"
                fill
                className="object-cover"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files && uploadCover(e.target.files[0])
            }
          />
        </div>

        {/* GALÉRIA */}
        <div className="space-y-2">
          <div className="font-medium">Galéria</div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) =>
              e.target.files && uploadGalleryImages(e.target.files)
            }
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {event.gallery_paths?.map((path) => (
              <div
                key={path}
                className="relative aspect-square border rounded overflow-hidden"
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${path}`}
                  alt="Galéria"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => deleteGalleryImage(path)}
                  className="absolute top-1 right-1 bg-white rounded-full w-6 h-6 text-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={save}
            className="bg-black text-white px-6 py-3 rounded"
          >
            Mentés
          </button>

          <button
            onClick={removeEvent}
            className="border px-6 py-3 rounded text-red-600"
          >
            Törlés
          </button>
        </div>
      </div>
    </main>
  );
}
