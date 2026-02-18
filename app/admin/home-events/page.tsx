// app/admin/home-events/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import RichTextEditor from "@/app/components/admin/RichTextEditor";
import type { EventsSectionSettings } from "@/app/lib/types";

export default function AdminHomeEventsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [settings, setSettings] = useState<EventsSectionSettings>({
    background_color: "#ffffff",
    content_color: "#000000",
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("page_sections")
        .select("*")
        .eq("key", "home_events")
        .single();

      if (data) {
        setTitle(data.title || "");
        setBody(data.body || "");
        setIsActive(data.is_active ?? true);
        if (data.settings) {
          const dbSettings = data.settings as EventsSectionSettings;
          setSettings({
            background_color: dbSettings.background_color || "#ffffff",
            content_color: dbSettings.content_color || "#000000",
          });
        }
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("page_sections")
      .update({
        title,
        body,
        is_active: isActive,
        settings,
      })
      .eq("key", "home_events");

    setSaving(false);
    if (error) alert("Hiba mentéskor!");
    else alert("Sikeres mentés!");
  }

  if (loading) return <div className="p-6">Betöltés...</div>;

  return (
    <main className="p-6 max-w-3xl mx-auto pb-32">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/80 backdrop-blur z-20 py-4 border-b">
        <h1 className="text-2xl font-bold">Főoldali Események Szekció</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-neutral-800 disabled:opacity-50"
          >
            {saving ? "Mentés..." : "Módosítások mentése"}
          </button>
          <a
            href="/admin"
            className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Vissza
          </a>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Aktív</div>
            <div className="text-sm text-neutral-600">Kikapcsolva nem jelenik meg.</div>
          </div>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-5 w-5"
          />
        </div>

        {/* SZÖVEGEK */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Szövegek</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Címsor</label>
            <RichTextEditor
              value={title}
              onChange={setTitle}
              placeholder="pl. Események"
              minHeight="80px"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alcím / Leírás</label>
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder="Rövid leírás a szekció alatt..."
              minHeight="120px"
            />
          </div>
        </div>

        {/* SZÍNEK */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Megjelenés</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold mb-1">Háttérszín</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.background_color}
                  onChange={(e) =>
                    setSettings({ ...settings, background_color: e.target.value })
                  }
                  className="w-10 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.background_color}
                  onChange={(e) =>
                    setSettings({ ...settings, background_color: e.target.value })
                  }
                  className="w-full border p-2 rounded text-sm uppercase"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Szövegszín</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.content_color}
                  onChange={(e) =>
                    setSettings({ ...settings, content_color: e.target.value })
                  }
                  className="w-10 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.content_color}
                  onChange={(e) =>
                    setSettings({ ...settings, content_color: e.target.value })
                  }
                  className="w-full border p-2 rounded text-sm uppercase"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
