"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { useRouter, useParams } from "next/navigation";

type EventRow = {
  id: string;
  title: string;
  slug: string;
  starts_at: string;
  summary: string | null;
  is_published: boolean;
};

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        starts_at: event.starts_at,
        summary: event.summary,
        is_published: event.is_published,
      })
      .eq("id", event.id);

    setSaving(false);

    if (error) {
      setError(error.message);
    }
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

  if (loading) {
    return <div className="p-6 text-sm">Betöltés…</div>;
  }

  if (!event) {
    return <div className="p-6 text-sm text-red-600">{error}</div>;
  }

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
          <input
            className="rounded-xl border p-3"
            value={event.title}
            onChange={(e) =>
              setEvent({ ...event, title: e.target.value })
            }
          />

          <input
            className="rounded-xl border p-3"
            value={event.slug}
            onChange={(e) =>
              setEvent({ ...event, slug: e.target.value })
            }
          />

          <input
            type="datetime-local"
            className="rounded-xl border p-3"
            value={event.starts_at.slice(0, 16)}
            onChange={(e) =>
              setEvent({
                ...event,
                starts_at: new Date(e.target.value).toISOString(),
              })
            }
          />

          <textarea
            className="rounded-xl border p-3 min-h-[120px]"
            value={event.summary ?? ""}
            onChange={(e) =>
              setEvent({ ...event, summary: e.target.value })
            }
          />

          <label className="flex items-center gap-3">
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
            Publikus
          </label>

          {error && (
            <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-xl bg-black text-white px-6 py-3"
            >
              {saving ? "Mentés…" : "Mentés"}
            </button>

            <button
              onClick={remove}
              className="rounded-xl border px-6 py-3 text-red-600"
            >
              Törlés
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
