"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [summary, setSummary] = useState("");
  // ÚJ: Étterem választáshoz
  const [restaurantId, setRestaurantId] = useState<string>(""); 
  const [restaurants, setRestaurants] = useState<any[]>([]);

  const [saving, setSaving] = useState(false);

  // Betöltjük az éttermeket, hogy lehessen választani
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("restaurants")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (data) setRestaurants(data);
    })();
  }, []);

  async function create() {
    if (!title || !slug || !startsAt) {
      alert("Töltsd ki a kötelező mezőket!");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("events").insert({
      title,
      slug,
      starts_at: new Date(startsAt).toISOString(),
      summary,
      is_published: false, // Alapból vázlat
      restaurant_id: restaurantId || null, // Itt mentjük el a kapcsolatot!
    });

    if (!error) {
      router.push("/admin/events");
      router.refresh();
    } else {
      alert("Hiba: " + error.message);
      setSaving(false);
    }
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold mb-6">Új esemény</h1>
        
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Esemény címe</label>
            <input
              className="w-full rounded-xl border p-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Pl. Valentin napi vacsora"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL (slug)</label>
            <input
              className="w-full rounded-xl border p-3"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="valentin-nap-2026"
            />
          </div>

          {/* ÚJ: Étterem választó */}
          <div>
            <label className="block text-sm font-medium mb-1">Melyik étterem?</label>
            <select
              className="w-full rounded-xl border p-3 bg-white"
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
            >
              <option value="">-- Válassz éttermet (opcionális) --</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kezdés időpontja</label>
            <input
              type="datetime-local"
              className="w-full rounded-xl border p-3"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Rövid leírás</label>
            <textarea
              className="w-full rounded-xl border p-3 min-h-[100px]"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <button
            onClick={create}
            disabled={saving}
            className="rounded-xl bg-black text-white px-6 py-3 mt-2"
          >
            {saving ? "Mentés..." : "Létrehozás"}
          </button>
        </div>
      </div>
    </main>
  );
}