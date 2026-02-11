"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Frissített típus
type EventRow = {
  id: string;
  title: string;
  slug: string;
  starts_at: string;
  summary: string | null;
  is_published: boolean;
  cover_path: string | null;
  restaurant_id: string | null; // ÚJ MEZŐ
};

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [event, setEvent] = useState<EventRow | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]); // Étterem lista
  
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

      // 1. Lekérjük az eseményt
      const { data: eventData, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single<EventRow>();

      // 2. Lekérjük az éttermeket
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
        restaurant_id: event.restaurant_id, // Mentjük a választott éttermet
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
          <a href="/admin/events" className="text-sm underline">Vissza</a>
        </div>

        <div className="mt-8 grid gap-4">
          <div>
            <label className="text-sm font-medium">Cím</label>
            <input
              className="w-full rounded-xl border p-3 mt-1"
              value={event.title}
              onChange={(e) => setEvent({ ...event, title: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Slug</label>
            <input
              className="w-full rounded-xl border p-3 mt-1"
              value={event.slug}
              onChange={(e) => setEvent({ ...event, slug: e.target.value })}
            />
          </div>

          {/* ÉTTEREM VÁLASZTÓ */}
          <div>
            <label className="text-sm font-medium">Étterem (Szervező)</label>
            <select
              className="w-full rounded-xl border p-3 mt-1 bg-white"
              value={event.restaurant_id || ""}
              onChange={(e) => setEvent({ ...event, restaurant_id: e.target.value || null })}
            >
              <option value="">-- Nincs étterem kiválasztva --</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Időpont</label>
            <input
              type="datetime-local"
              className="w-full rounded-xl border p-3 mt-1"
              value={event.starts_at.slice(0, 16)}
              onChange={(e) =>
                setEvent({
                  ...event,
                  starts_at: new Date(e.target.value).toISOString(),
                })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Leírás</label>
            <textarea
              className="w-full rounded-xl border p-3 mt-1 min-h-[120px]"
              value={event.summary ?? ""}
              onChange={(e) => setEvent({ ...event, summary: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              checked={event.is_published}
              onChange={(e) =>
                setEvent({
                  ...event,
                  is_published: e.target.checked,
                })
              }
            />
            Publikus (megjelenik az oldalon)
          </label>

          {/* Borítókép feltöltés */}
          <div className="rounded-xl border p-4 bg-neutral-50">
            <div className="text-sm font-medium mb-2">Borítókép</div>
            {event.cover_path ? (
              <div className="mb-3 relative w-full h-[200px] rounded-lg overflow-hidden border">
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${event.cover_path}`}
                  alt="Borítókép"
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadCover(file);
              }}
            />
            {uploading && <div className="mt-2 text-sm text-neutral-600">Feltöltés folyamatban…</div>}
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-xl bg-black text-white px-6 py-3"
            >
              {saving ? "Mentés…" : "Mentés"}
            </button>

            <button
              onClick={remove}
              className="rounded-xl border px-6 py-3 text-red-600 hover:bg-red-50"
            >
              Törlés
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}