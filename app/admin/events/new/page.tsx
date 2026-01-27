"use client";

import { useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [summary, setSummary] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);

    const { data, error } = await supabase
      .from("events")
      .insert({
        title,
        slug,
        starts_at: new Date(startsAt).toISOString(),
        summary,
        is_published: false,
      })
      .select("id")
      .single();

    setSaving(false);

    if (error || !data) {
      setError(error?.message ?? "Nem sikerült menteni.");
      return;
    }

    router.replace(`/admin/events/${data.id}`);
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold">Új esemény</h1>

        <div className="mt-8 grid gap-4">
          <input
            placeholder="Cím"
            className="rounded-xl border p-3"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "")
              );
            }}
          />

          <input
            placeholder="Slug"
            className="rounded-xl border p-3"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />

          <input
            type="datetime-local"
            className="rounded-xl border p-3"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />

          <textarea
            placeholder="Rövid leírás"
            className="rounded-xl border p-3 min-h-[120px]"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />

          {error && (
            <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-black text-white p-4"
          >
            {saving ? "Mentés…" : "Létrehozás"}
          </button>
        </div>
      </div>
    </main>
  );
}
