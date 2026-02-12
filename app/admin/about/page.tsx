"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { useRouter } from "next/navigation";
import type { AboutSettings, AboutComponentType } from "@/app/lib/types";

export const dynamic = "force-dynamic";
// Segéd a címkékhez
const COMPONENT_LABELS: Record<AboutComponentType, string> = {
    title: "Címsor",
    body: "Szövegtörzs",
};

type Section = {
  id: string;
  key: string;
  title: string | null;
  body: string | null;
  is_active: boolean;
  settings: AboutSettings | null; // Settings hozzáadva
};

const SECTION_KEY = "home_about";

export default function AdminAboutEditorPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);

  const [sectionId, setSectionId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  // ÚJ STATE: Beállítások
  const [settings, setSettings] = useState<AboutSettings>({
      components_order: ['title', 'body'],
      content_color: "",
      background_color: ""
  });

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      // Ellenőrizzük az admin jogosultságot
      const { data: adminRow } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!adminRow) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      // Adatok betöltése
      const { data: existing } = await supabase
        .from("page_sections")
        .select("*")
        .eq("key", SECTION_KEY)
        .maybeSingle<Section>();

      if (!existing) {
        // Ha még nincs, létrehozzuk
        const { data: created, error: createError } = await supabase
          .from("page_sections")
          .insert({
            key: SECTION_KEY,
            title: "Mi az a Miskolci Soho?",
            body: "A Miskolci Soho egy városi kísérlet.",
            is_active: true,
            settings: { components_order: ['title', 'body'] }
          })
          .select("*")
          .single<Section>();

        if (createError || !created) {
          setError(createError?.message ?? "Nem sikerült létrehozni az About szekciót.");
          setChecking(false);
          return;
        }

        setSectionId(created.id);
        setTitle(created.title ?? "");
        setBody(created.body ?? "");
        setIsActive(created.is_active);
        // Settings betöltése
        if (created.settings) setSettings(prev => ({ ...prev, ...created.settings }));

      } else {
        // Ha létezik, betöltjük
        setSectionId(existing.id);
        setTitle(existing.title ?? "");
        setBody(existing.body ?? "");
        setIsActive(existing.is_active);
        // Settings betöltése (összefésülve a defaulttal)
        if (existing.settings) {
            setSettings(prev => ({ 
                ...prev, 
                ...existing.settings,
                components_order: existing.settings?.components_order || ['title', 'body']
            }));
        }
      }

      setChecking(false);
    })();
  }, [router]);

  // --- SORREND MÓDOSÍTÁS ---
  const moveItem = (index: number, direction: 'up' | 'down') => {
      const newOrder = [...(settings.components_order || ['title', 'body'])];
      if (direction === 'up' && index > 0) {
          [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      } else if (direction === 'down' && index < newOrder.length - 1) {
          [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      }
      setSettings({ ...settings, components_order: newOrder });
  };

  async function save() {
    if (!sectionId) return;

    setSaving(true);
    setMessage(null);
    setError(null);

    const { error } = await supabase
      .from("page_sections")
      .update({
        title,
        body,
        is_active: isActive,
        settings: settings // JSON mentése
      })
      .eq("id", sectionId);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Mentve.");
  }

  if (checking) return <main className="min-h-screen flex items-center justify-center p-6"><p>Betöltés...</p></main>;

  return (
    <main className="min-h-screen p-6 pb-32">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Home About / Vision</h1>
            <p className="mt-1 text-sm text-neutral-600">A főoldal bemutatkozó szövege.</p>
          </div>
          <a className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-50" href="/admin">Vissza</a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* BAL OSZLOP: TARTALOM */}
            <div className="space-y-6">
                <div className="rounded-2xl border p-5 bg-white">
                    <label className="block text-sm font-medium">Cím</label>
                    <input className="mt-1 w-full rounded-xl border p-3 outline-none" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div className="rounded-2xl border p-5 bg-white">
                    <label className="block text-sm font-medium">Szöveg</label>
                    <textarea className="mt-1 w-full rounded-xl border p-3 outline-none min-h-[200px]" value={body} onChange={(e) => setBody(e.target.value)} />
                </div>

                <div className="rounded-2xl border p-5 bg-white flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium">Aktív</div>
                        <div className="text-sm text-neutral-600">Kikapcsolva nem jelenik meg.</div>
                    </div>
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-5 w-5" />
                </div>
            </div>

            {/* JOBB OSZLOP: MEGJELENÉS */}
            <div className="space-y-6">
                
                {/* SZÍNEK */}
                <div className="rounded-2xl border p-5 bg-white">
                    <h3 className="text-lg font-semibold mb-4">Színek</h3>
                    <div className="grid gap-4">
                        {/* Tartalom Szín */}
                        <div>
                            <label className="block text-xs font-semibold mb-1 uppercase text-neutral-500">Szövegszín</label>
                            <div className="flex items-center gap-2">
                                <input type="color" value={settings.content_color || '#000000'} onChange={(e) => setSettings({...settings, content_color: e.target.value})} className="w-10 h-10 border rounded cursor-pointer" />
                                <input type="text" placeholder="#000000" value={settings.content_color || ''} onChange={(e) => setSettings({...settings, content_color: e.target.value})} className="w-full border p-2 rounded text-sm" />
                            </div>
                            <button onClick={() => setSettings({...settings, content_color: ""})} className="text-xs text-red-500 mt-1 underline">Alaphelyzet</button>
                        </div>

                        {/* Háttérszín */}
                        <div>
                            <label className="block text-xs font-semibold mb-1 uppercase text-neutral-500">Háttérszín</label>
                            <div className="flex items-center gap-2">
                                <input type="color" value={settings.background_color || '#ffffff'} onChange={(e) => setSettings({...settings, background_color: e.target.value})} className="w-10 h-10 border rounded cursor-pointer" />
                                <input type="text" placeholder="#ffffff" value={settings.background_color || ''} onChange={(e) => setSettings({...settings, background_color: e.target.value})} className="w-full border p-2 rounded text-sm" />
                            </div>
                            <button onClick={() => setSettings({...settings, background_color: ""})} className="text-xs text-red-500 mt-1 underline">Alaphelyzet</button>
                        </div>
                    </div>
                </div>

                {/* SORREND */}
                <div className="rounded-2xl border p-5 bg-white">
                    <h3 className="text-lg font-semibold mb-4">Sorrend</h3>
                    <div className="flex flex-col gap-2">
                        {(settings.components_order || ['title', 'body']).map((item, index) => (
                            <div key={item} className="flex items-center justify-between p-3 bg-neutral-50 border rounded-lg">
                                <span className="font-medium text-sm">{COMPONENT_LABELS[item]}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="p-1 hover:bg-neutral-200 rounded disabled:opacity-30">⬆️</button>
                                    <button onClick={() => moveItem(index, 'down')} disabled={index === 1} className="p-1 hover:bg-neutral-200 rounded disabled:opacity-30">⬇️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ÜZENETEK & GOMB */}
                <div className="space-y-4">
                    {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
                    {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}
                    
                    <button onClick={save} disabled={saving} className="w-full rounded-2xl bg-black text-white p-4 font-bold disabled:opacity-50 hover:bg-neutral-800 transition">
                        {saving ? "Mentés..." : "Módosítások mentése"}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}