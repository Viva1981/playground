"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";

export default function AdminHeroPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Mezők
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  
  // Elsődleges gomb
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");

  // MÁSODLAGOS GOMB (ÚJ)
  const [ctaLabel2, setCtaLabel2] = useState("");
  const [ctaUrl2, setCtaUrl2] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("page_sections")
        .select("*")
        .eq("key", "home_hero")
        .single();

      if (data) {
        setTitle(data.title || "");
        setBody(data.body || "");
        setCtaLabel(data.cta_label || "");
        setCtaUrl(data.cta_url || "");
        // Új mezők betöltése
        setCtaLabel2(data.cta_label_2 || "");
        setCtaUrl2(data.cta_url_2 || "");
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    await supabase
      .from("page_sections")
      .update({
        title,
        body,
        cta_label: ctaLabel,
        cta_url: ctaUrl,
        // Új mezők mentése
        cta_label_2: ctaLabel2,
        cta_url_2: ctaUrl2,
      })
      .eq("key", "home_hero");
    setSaving(false);
    alert("Sikeres mentés!");
  }

  if (loading) return <div className="p-6">Betöltés...</div>;

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Főoldali Hero szerkesztése</h1>

      <div className="grid gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Főcím</label>
          <input
            className="w-full border p-3 rounded-xl"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Szöveg</label>
          <textarea
            className="w-full border p-3 rounded-xl min-h-[120px]"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        {/* ELSŐDLEGES GOMB */}
        <div className="p-4 bg-neutral-50 rounded-xl border">
          <h3 className="font-semibold mb-3">Elsődleges Gomb (Fekete)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Felirat</label>
              <input
                className="w-full border p-2 rounded-lg"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="Pl. Események"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Link</label>
              <input
                className="w-full border p-2 rounded-lg"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="Pl. #events"
              />
            </div>
          </div>
        </div>

        {/* MÁSODLAGOS GOMB */}
        <div className="p-4 bg-neutral-50 rounded-xl border">
          <h3 className="font-semibold mb-3">Másodlagos Gomb (Fehér/Keretes)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Felirat</label>
              <input
                className="w-full border p-2 rounded-lg"
                value={ctaLabel2}
                onChange={(e) => setCtaLabel2(e.target.value)}
                placeholder="Pl. Éttermek"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Link</label>
              <input
                className="w-full border p-2 rounded-lg"
                value={ctaUrl2}
                onChange={(e) => setCtaUrl2(e.target.value)}
                placeholder="Pl. /restaurants"
              />
            </div>
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="bg-black text-white py-3 rounded-xl mt-4"
        >
          {saving ? "Mentés..." : "Mentés"}
        </button>
      </div>
    </main>
  );
}