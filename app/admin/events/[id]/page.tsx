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
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/admin/login");
        return;
      }

      const { data: eventData, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single<EventRow>();

      const { data: restData } = await supabase
        .from("restaurants")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error || !eventData) {
        setError("Esemény nem található.");
      } else {
        setEvent(eventData);
        if (restData) setRestaurants(restData);
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
        starts_at: event.starts_at,
        summary: event.summary,
        is_published: event.is_published,
        restaurant_id: event.restaurant_id,
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

  async function uploadGalleryImages(files: FileList) {
    if (!event) return;
    setGalleryUploading(true);
    setError(null);

    const newPaths: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const uuid = uuidv4();
      const filePath = `events/${event.id}/gallery/${uuid}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("public-media")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        setError(uploadError.message);
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

  async function deleteGalleryImage(imgPath: string) {
    if (!event) return;
    if (!confirm("Biztosan törlöd ezt a galéria képet?")) return;

    setGalleryUploading(true);
    setError(null);

    const { error: storageError } = await supabase.storage
      .from("public-media")
      .remove([imgPath]);

    if (storageError) {
      setError("Kép törlése sikertelen: " + storageError.message);
      setGalleryUploading(false);
      return;
    }

    const newGallery = (event.gallery_paths ?? []).filter(
      (p) => p !== imgPath
    );

    const { error: dbError } = await supabase
      .from("events")
      .update({ gallery_paths: newGallery })
      .eq("id", event.id);

    if (dbError) {
      setError("Adatbázis frissítés sikertelen: " + dbError.message);
      setGalleryUploading(false);
      return;
    }

    setEvent({ ...event, gallery_paths: newGallery });
    setGalleryUploading(false);
  }

  async function uploadCover(file: File) {
    if (!event) return;
    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `events/${event.id}/cover.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("public-media")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("events")
      .update({ cover_path: filePath })
      .eq("id", event.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setEvent({ ...event, cover_path: filePath });
    }

    setUploading(false);
  }

  async function remove() {
    if (!event) return;
    if (!confirm("Biztosan törlöd ezt az eseményt?")) return;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", event.id);

    if (!error) {
      router.replace("/admin/events");
    }
  }

  if (loading) return <div className="p-6 text-sm">Betöltés…</div>;
  if (!event) return <div className="p-6 text-sm text-red-600">{error}</div>;

  return (
    <main className="p-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Esemény szerkesztése</h1>
          <a href="/admin/events" className="text-sm underline">
            Vissza
          </a>
        </div>

        <div className="mt-8 grid gap-4">

          {/* Galéria */}
          <div className="rounded-xl border p-4 bg-neutral-50">
            <div className="text-sm font-medium mb-2">Galéria</div>

            <input
              type="file"
              accept="image/*"
              multiple
              disabled={galleryUploading}
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) uploadGalleryImages(files);
              }}
            />

            {galleryUploading && (
              <div className="mt-2 text-sm text-neutral-600">
                Feltöltés folyamatban…
              </div>
            )}

            {event.gallery_paths && event.gallery_paths.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {event.gallery_paths.map((imgPath, idx) => (
                  <div
                    key={imgPath}
                    className="relative w-full aspect-square rounded-lg overflow-hidden border"
                  >
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${imgPath}`}
                      alt={`Galéria kép ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => deleteGalleryImage(imgPath)}
                      className="absolute top-1 right-1 z-10 bg-white bg-opacity-80 rounded-full w-7 h-7 flex items-center justify-center text-red-600 border border-red-200 shadow hover:bg-red-100 transition"
                      disabled={galleryUploading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
