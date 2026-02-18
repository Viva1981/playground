"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import AdminPageHeader from "@/app/components/AdminPageHeader";
import type { FooterSettings } from "@/app/lib/types";

type Section = {
  id: string;
  key: string;
  title: string | null;
  body: string | null;
  is_active: boolean;
  settings: FooterSettings | null;
};

const SECTION_KEY = "home_footer";
const DEFAULT_TITLE = "COMING SOON";
const DEFAULT_SUBTITLE = "";
const DEFAULT_SETTINGS: FooterSettings = {
  animation_interval_ms: 80,
};

export default function AdminFooterPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [sectionId, setSectionId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [subtitle, setSubtitle] = useState(DEFAULT_SUBTITLE);
  const [settings, setSettings] = useState<FooterSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    (async () => {
      const { data: existing } = await supabase
        .from("page_sections")
        .select("*")
        .eq("key", SECTION_KEY)
        .maybeSingle<Section>();

      if (!existing) {
        const { data: created } = await supabase
          .from("page_sections")
          .insert({
            key: SECTION_KEY,
            title: DEFAULT_TITLE,
            body: DEFAULT_SUBTITLE,
            is_active: false,
            settings: DEFAULT_SETTINGS,
          })
          .select("*")
          .single<Section>();

        if (created) {
          setSectionId(created.id);
          setIsActive(created.is_active);
          setTitle(created.title || DEFAULT_TITLE);
          setSubtitle(created.body ?? DEFAULT_SUBTITLE);
          setSettings({
            animation_interval_ms:
              created.settings?.animation_interval_ms ?? DEFAULT_SETTINGS.animation_interval_ms,
          });
        }
      } else {
        setSectionId(existing.id);
        setIsActive(existing.is_active);
        setTitle(existing.title || DEFAULT_TITLE);
        setSubtitle(existing.body ?? DEFAULT_SUBTITLE);
        setSettings({
          animation_interval_ms:
            existing.settings?.animation_interval_ms ?? DEFAULT_SETTINGS.animation_interval_ms,
        });
      }

      setLoading(false);
    })();
  }, []);

  async function save() {
    if (!sectionId) return;
    setSaving(true);

    const { error } = await supabase
      .from("page_sections")
      .update({
        title: title.trim() || DEFAULT_TITLE,
        body: subtitle.trim(),
        is_active: isActive,
        settings,
      })
      .eq("id", sectionId);

    setSaving(false);
    if (error) alert("Hiba menteskor!");
    else alert("Sikeres mentes!");
  }

  if (loading) return <main className="p-6">Betoltes...</main>;

  return (
    <main className="min-h-screen p-6 pb-32">
      <div className="mx-auto max-w-3xl">
        <AdminPageHeader
          title="Home Footer / Coming Soon"
          subtitle="Fooldal aljan megjeleno bevezeto blokk."
        />

        <div className="space-y-6">
          <div className="rounded-2xl border p-5 bg-white flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Aktiv</div>
              <div className="text-sm text-neutral-600">Kikapcsolva nem jelenik meg.</div>
            </div>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5"
            />
          </div>

          <div className="rounded-2xl border p-5 bg-white">
            <label className="block text-sm font-medium mb-1">Focim</label>
            <input
              className="w-full border rounded p-3 text-sm uppercase tracking-[0.2em]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={DEFAULT_TITLE}
            />
          </div>

          <div className="rounded-2xl border p-5 bg-white">
            <label className="block text-sm font-medium mb-1">Alszoveg</label>
            <input
              className="w-full border rounded p-3 text-sm"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder={DEFAULT_SUBTITLE}
            />
          </div>

          <div className="rounded-2xl border p-5 bg-white">
            <label className="block text-sm font-medium mb-1">
              Animacio sebesseg: {settings.animation_interval_ms ?? DEFAULT_SETTINGS.animation_interval_ms} ms
            </label>
            <input
              type="range"
              min="20"
              max="300"
              step="10"
              value={settings.animation_interval_ms ?? DEFAULT_SETTINGS.animation_interval_ms}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  animation_interval_ms: Number(e.target.value),
                })
              }
              className="w-full"
            />
            <p className="text-xs text-neutral-600 mt-2">Kisebb ertek = gyorsabb animacio.</p>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="w-full rounded-2xl bg-black text-white p-4 font-bold disabled:opacity-50 hover:bg-neutral-800 transition"
          >
            {saving ? "Mentes..." : "Modositasok mentese"}
          </button>
        </div>
      </div>
    </main>
  );
}
