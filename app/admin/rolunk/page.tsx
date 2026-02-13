// app/admin/rolunk/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import type { RolunkSettings } from "@/app/lib/types";

export default function AdminRolunkPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [settings, setSettings] = useState<RolunkSettings>({
    bg_color: "#ffffff",
    text_color: "#000000",
    image_url: "",
  });

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("page_sections")
        .select("*")
        .eq("key", "global_rolunk")
        .maybeSingle();

      if (data) {
        setTitle(data.title || "");
        setBody(data.body || "");
        if (data.settings) {
          const dbSettings = data.settings as RolunkSettings;
          setSettings({
            bg_color: dbSettings.bg_color || "#ffffff",
            text_color: dbSettings.text_color || "#000000",
            image_url: dbSettings.image_url || "",
          });
        }
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase
      .from("page_sections")
      .upsert(
        {
          key: "global_rolunk",
          title,
          body,
          settings,
        },
        { onConflict: "key" }
      );

    setSaving(false);

    if (error) {
      setError("Hiba mentéskor: " + error.message);
    } else {
      setMessage("Sikeres mentés!");
      setTimeout(() => setMessage(null), 3000);
    }
  }

  if (loading)
    return (
      <main className="p-6 flex items-center justify-center min-h-screen">
        <p className="text-sm text-neutral-600">Betöltés...</p>
      </main>
    );

  return (
    <main className="p-6 max-w-5xl mx-auto pb-32">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/80 backdrop-blur z-20 py-4 border-b">
        <h1 className="text-2xl font-bold">Rólunk oldal szerkesztése</h1>
        <button
          onClick={save}
          disabled={saving}
          className="bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-neutral-800 disabled:opacity-50"
        >
          {saving ? "Mentés..." : "Módosítások mentése"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BAL OSZLOP: SZÖVEGEK */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Szövegek</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Oldal címe</label>
              <input
                className="w-full border p-3 rounded-lg"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="pl. Rólunk"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Másédzs (fő szöveg)
              </label>
              <textarea
                className="w-full border p-3 rounded-lg min-h-[200px]"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Írj ide egy bemutatkozó szöveget..."
              />
              <p className="text-xs text-neutral-500 mt-1">
                Támogatók: több bekezdés, sortörések megmaradnak
              </p>
            </div>
          </div>
        </div>

        {/* JOBB OSZLOP: MEGJELENÉS */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Megjelenés & Beállítások</h2>

            {/* KÉP URL */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                Kép URL (opcionális)
              </label>
              <input
                type="url"
                className="w-full border p-3 rounded-lg"
                value={settings.image_url || ""}
                onChange={(e) =>
                  setSettings({ ...settings, image_url: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Teljes URL szükséges (https://)
              </p>
              {settings.image_url && (
                <div className="mt-3 rounded-lg overflow-hidden border bg-neutral-100">
                  <img
                    src={settings.image_url}
                    alt="Előnézet"
                    className="w-full h-auto max-h-40 object-cover"
                    onError={() =>
                      setError("Nem sikerült a képet betölteni. Ellenőrizd az URL-t!")
                    }
                  />
                </div>
              )}
            </div>

            {/* HÁTTÉRSZÍN */}
            <div className="mb-6 pb-6 border-b">
              <label className="block text-sm font-medium mb-2">
                Háttérszín
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.bg_color || "#ffffff"}
                  onChange={(e) =>
                    setSettings({ ...settings, bg_color: e.target.value })
                  }
                  className="w-10 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.bg_color || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, bg_color: e.target.value })
                  }
                  className="w-full border p-2 rounded text-sm uppercase"
                />
              </div>
            </div>

            {/* SZÖVEGSZÍN */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Szövegszín
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.text_color || "#000000"}
                  onChange={(e) =>
                    setSettings({ ...settings, text_color: e.target.value })
                  }
                  className="w-10 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.text_color || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, text_color: e.target.value })
                  }
                  className="w-full border p-2 rounded text-sm uppercase"
                />
              </div>
            </div>
          </div>

          {/* ÜZENETEK */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700">
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
