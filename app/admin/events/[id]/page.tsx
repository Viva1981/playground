"use client";

import { useEffect, useState, use, useMemo } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import RichTextEditor from "@/app/components/admin/RichTextEditor";
import { deleteEventAssets, deletePaths } from "@/app/utils/adminMediaClient";

type EventRow = {
  id: string;
  title: string;
  slug: string;
  starts_at: string | null;
  is_featured?: boolean | null;
  featured_rank?: number | null;
  event_type?: "program" | "news" | "report" | null;
  schedule_type?: "datetime" | "date_range" | "undated" | null;
  starts_on?: string | null;
  ends_on?: string | null;
  date_label?: string | null;
  summary: string | null;
  body: string | null;
  is_published: boolean;
  cover_path: string | null;
  restaurant_id: string | null;
  gallery_paths?: string[];
};

function toLocalDateTimeInput(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function fromLocalDateTimeInput(local: string) {
  if (!local) return null;
  return new Date(local).toISOString();
}

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

  const supportsAdvancedFields = useMemo(() => {
    if (!event) return false;
    return (
      Object.prototype.hasOwnProperty.call(event, "event_type") &&
      Object.prototype.hasOwnProperty.call(event, "schedule_type") &&
      Object.prototype.hasOwnProperty.call(event, "starts_on") &&
      Object.prototype.hasOwnProperty.call(event, "ends_on") &&
      Object.prototype.hasOwnProperty.call(event, "date_label")
    );
  }, [event]);

  const supportsFeaturedFields = useMemo(() => {
    if (!event) return false;
    return (
      Object.prototype.hasOwnProperty.call(event, "is_featured") &&
      Object.prototype.hasOwnProperty.call(event, "featured_rank")
    );
  }, [event]);

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

    const { error: baseError } = await supabase
      .from("events")
      .update({
        title: event.title,
        slug: event.slug,
        starts_at: event.starts_at,
        summary: event.summary,
        body: event.body,
        is_published: event.is_published,
        gallery_paths: event.gallery_paths ?? [],
      })
      .eq("id", event.id);

    if (baseError) {
      setSaving(false);
      setError(baseError.message);
      return;
    }

    if (supportsAdvancedFields) {
      const { error: advancedError } = await supabase
        .from("events")
        .update({
          event_type: event.event_type ?? "program",
          schedule_type: event.schedule_type ?? "datetime",
          starts_on: event.starts_on ?? null,
          ends_on: event.ends_on ?? null,
          date_label: event.date_label ?? null,
        })
        .eq("id", event.id);

      if (advancedError) {
        setSaving(false);
        setError(advancedError.message);
        return;
      }
    }

    if (supportsFeaturedFields) {
      const { error: featuredError } = await supabase
        .from("events")
        .update({
          is_featured: Boolean(event.is_featured),
          featured_rank: event.is_featured ? Number(event.featured_rank ?? 0) : 0,
        })
        .eq("id", event.id);

      if (featuredError) {
        setSaving(false);
        setError(featuredError.message);
        return;
      }
    }

    setSaving(false);
    alert("Sikeres mentés!");
  }

  async function uploadCover(file: File) {
    if (!event) return;

    setCoverUploading(true);
    setError(null);

    const previousCoverPath = event.cover_path;
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const filePath = `events/${event.id}/cover-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("public-media")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setCoverUploading(false);
      return;
    }

    if (previousCoverPath && previousCoverPath !== filePath) {
      try {
        await deletePaths([previousCoverPath]);
      } catch (deleteErr) {
        await deletePaths([filePath]).catch(() => undefined);
        const message =
          deleteErr instanceof Error ? deleteErr.message : "A korábbi borítókép törlése sikertelen.";
        setError(message);
        setCoverUploading(false);
        return;
      }
    }

    const { error: dbError } = await supabase
      .from("events")
      .update({ cover_path: filePath })
      .eq("id", event.id);

    if (dbError) {
      if (previousCoverPath !== filePath) {
        await deletePaths([filePath]).catch(() => undefined);
      }
      setError(dbError.message);
      setCoverUploading(false);
      return;
    }

    setEvent({ ...event, cover_path: filePath });
    setCoverUploading(false);
  }

  async function deleteCover() {
    if (!event?.cover_path) return;
    if (!confirm("Biztosan törlöd a borítóképet?")) return;

    setCoverUploading(true);
    setError(null);

    try {
      await deletePaths([event.cover_path]);

      const { error: dbError } = await supabase
        .from("events")
        .update({ cover_path: null })
        .eq("id", event.id);

      if (dbError) throw new Error(dbError.message);
      setEvent({ ...event, cover_path: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba a borítókép törlése során.");
    } finally {
      setCoverUploading(false);
    }
  }

  async function uploadGalleryImages(files: FileList) {
    if (!event) return;
    if ((event.gallery_paths?.length ?? 0) + files.length > 25) {
      setError("Maximum 25 kép lehet az esemény galériában.");
      return;
    }

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
    setError(null);

    try {
      await deletePaths([path]);

      const newGallery = (event.gallery_paths ?? []).filter(
        (p) => p !== path
      );

      const { error: dbError } = await supabase
        .from("events")
        .update({ gallery_paths: newGallery })
        .eq("id", event.id);

      if (dbError) throw new Error(dbError.message);
      setEvent({ ...event, gallery_paths: newGallery });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba a galéria törlése során.");
    } finally {
      setGalleryUploading(false);
    }
  }

  async function removeEvent() {
    if (!event) return;
    if (!confirm("Biztosan törlöd az eseményt?")) return;

    setSaving(true);
    setError(null);

    try {
      await deleteEventAssets(event.id);

      const { error: dbError } = await supabase.from("events").delete().eq("id", event.id);
      if (dbError) throw new Error(dbError.message);

      router.replace("/admin/events");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba az esemény törlése során.");
    } finally {
      setSaving(false);
    }
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

        <div>
          <div className="font-medium mb-1">Kezdés időpontja</div>
          <input
            type="datetime-local"
            className="w-full border rounded p-3"
            value={toLocalDateTimeInput(event.starts_at)}
            onChange={(e) =>
              setEvent({
                ...event,
                starts_at: fromLocalDateTimeInput(e.target.value),
              })
            }
          />
        </div>

        {supportsAdvancedFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="font-medium mb-1">Típus</div>
              <select
                className="w-full border rounded p-3 bg-white"
                value={event.event_type ?? "program"}
                onChange={(e) =>
                  setEvent({
                    ...event,
                    event_type: e.target.value as EventRow["event_type"],
                  })
                }
              >
                <option value="program">Program</option>
                <option value="news">Hír</option>
                <option value="report">Beszámoló</option>
              </select>
            </div>
            <div>
              <div className="font-medium mb-1">Időkezelés</div>
              <select
                className="w-full border rounded p-3 bg-white"
                value={event.schedule_type ?? "datetime"}
                onChange={(e) =>
                  setEvent({
                    ...event,
                    schedule_type: e.target.value as EventRow["schedule_type"],
                  })
                }
              >
                <option value="datetime">Dátum + idő</option>
                <option value="date_range">Intervallum</option>
                <option value="undated">Nincs konkrét dátum</option>
              </select>
            </div>
            <div>
              <div className="font-medium mb-1">Kezdő nap (intervallumnál)</div>
              <input
                type="date"
                className="w-full border rounded p-3"
                value={event.starts_on ?? ""}
                onChange={(e) =>
                  setEvent({
                    ...event,
                    starts_on: e.target.value || null,
                  })
                }
              />
            </div>
            <div>
              <div className="font-medium mb-1">Záró nap (intervallumnál)</div>
              <input
                type="date"
                className="w-full border rounded p-3"
                value={event.ends_on ?? ""}
                onChange={(e) =>
                  setEvent({
                    ...event,
                    ends_on: e.target.value || null,
                  })
                }
              />
            </div>
            <div className="md:col-span-2">
              <div className="font-medium mb-1">Megjelenítési dátumszöveg</div>
              <input
                className="w-full border rounded p-3"
                value={event.date_label ?? ""}
                onChange={(e) =>
                  setEvent({
                    ...event,
                    date_label: e.target.value || null,
                  })
                }
                placeholder="pl. Hamarosan, vagy 2026 március"
              />
            </div>
          </div>
        )}

        {supportsFeaturedFields && (
          <div className="rounded-xl border p-4 bg-neutral-50">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(event.is_featured)}
                onChange={(e) =>
                  setEvent({
                    ...event,
                    is_featured: e.target.checked,
                    featured_rank: e.target.checked ? Number(event.featured_rank ?? 0) : 0,
                  })
                }
              />
              <span className="text-sm font-medium">Kiemelt esemény</span>
            </label>

            {event.is_featured && (
              <div className="mt-3">
                <div className="font-medium mb-1 text-sm">Kiemelt sorrend</div>
                <input
                  type="number"
                  min={0}
                  className="w-full border rounded p-3"
                  value={event.featured_rank ?? 0}
                  onChange={(e) =>
                    setEvent({
                      ...event,
                      featured_rank: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
            )}
          </div>
        )}

        <textarea
          className="w-full border rounded p-3"
          value={event.summary ?? ""}
          onChange={(e) =>
            setEvent({ ...event, summary: e.target.value })
          }
          placeholder="Rövid leírás"
        />
        {/* Body RichTextEditor */}
        <div>
          <div className="font-medium mb-1">Részletes leírás</div>
          <RichTextEditor
            value={event.body ?? ""}
            onChange={(value) => setEvent({ ...event, body: value })}
          />
          <p className="text-xs text-neutral-500 mt-2">
            Tipp: a leírásba beszúrhatsz fix galéria képet shortcode-dal, pl. <code>[galeria-1]</code>, <code>[galeria-12]</code>.
          </p>
        </div>

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
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept="image/*"
              disabled={coverUploading || saving}
              onChange={(e) =>
                e.target.files && uploadCover(e.target.files[0])
              }
            />
            {event.cover_path && (
              <button
                type="button"
                onClick={deleteCover}
                disabled={coverUploading || saving}
                className="border px-3 py-1.5 rounded text-red-600 disabled:opacity-50"
              >
                Borítókép törlése
              </button>
            )}
          </div>
        </div>

        {/* GALÉRIA */}
        <div className="space-y-2">
          <div className="font-medium">Galéria (max 25)</div>
          <input
            type="file"
            multiple
            accept="image/*"
            disabled={galleryUploading || saving || (event.gallery_paths?.length ?? 0) >= 25}
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
                  disabled={galleryUploading || saving}
                  className="absolute top-1 right-1 bg-white rounded-full w-6 h-6 text-red-600 disabled:opacity-50"
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
            disabled={saving || galleryUploading || coverUploading}
            className="bg-black text-white px-6 py-3 rounded"
          >
            {saving ? "Mentés..." : "Mentés"}
          </button>

          <button
            onClick={removeEvent}
            disabled={saving || galleryUploading || coverUploading}
            className="border px-6 py-3 rounded text-red-600"
          >
            {saving ? "Folyamatban..." : "Törlés"}
          </button>
        </div>
      </div>
    </main>
  );
}
