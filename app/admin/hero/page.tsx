// app/admin/hero/page.tsx
"use client";
import { useEffect, useState, ChangeEvent } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import RichTextEditor from "@/app/components/admin/RichTextEditor";
// JAVÍTVA: A Hero típusokat importáljuk, nem az About-ot
import type { HeroSettings, HeroComponentType } from "@/app/lib/types";
import { deleteByDiff, deletePaths } from "@/app/utils/adminMediaClient";

const COMPONENT_LABELS: Record<HeroComponentType, string> = {
    title: "Főcím",
    body: "Szöveg",
    buttons: "Gombok"
};

export default function AdminHeroPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Mezők
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [ctaLabel2, setCtaLabel2] = useState("");
  const [ctaUrl2, setCtaUrl2] = useState("");

  const [mediaPaths, setMediaPaths] = useState<string[]>([]);
  const [initialMediaPaths, setInitialMediaPaths] = useState<string[]>([]);
  
  // Kezdeti állapot típushelyesen
  const [settings, setSettings] = useState<HeroSettings>({
      layout: 'overlay',
      align: 'center-center',
      overlay_opacity: 50,
      components_order: ['title', 'body', 'buttons'],
      show_text_content: true,
      show_buttons: true,
      show_media: true,
      seo_title: "",
      seo_description: "",
      seo_image: "",
      content_color: "",
      background_color: "",
      primary_button_text_color: ""
  });

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
        setIsActive(data.is_active ?? true);
        setCtaLabel(data.cta_label || "");
        setCtaUrl(data.cta_url || "");
        setCtaLabel2(data.cta_label_2 || "");
        setCtaUrl2(data.cta_url_2 || "");
        setMediaPaths(data.media_paths || []);
        setInitialMediaPaths(data.media_paths || []);
        
        if (data.settings) {
            // Biztonságos casting és merge
            const dbSettings = data.settings as HeroSettings;
            setSettings(prev => ({ 
                ...prev, 
                ...dbSettings,
                components_order: dbSettings.components_order || ['title', 'body', 'buttons'],
                show_text_content: dbSettings.show_text_content ?? true,
                show_buttons: dbSettings.show_buttons ?? true,
                show_media: dbSettings.show_media ?? true,
                seo_title: dbSettings.seo_title || "",
                seo_description: dbSettings.seo_description || "",
                seo_image: dbSettings.seo_image || "",
                content_color: dbSettings.content_color || "",
                background_color: dbSettings.background_color || "",
                primary_button_text_color: dbSettings.primary_button_text_color || ""
            }));
        }
      }
      setLoading(false);
    })();
  }, []);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (mediaPaths.length + e.target.files.length > 10) {
        alert("Maximum 10 kép tölthető fel!");
        return;
    }
    setUploading(true);
    const newPaths: string[] = [];
    try {
        for (const file of Array.from(e.target.files)) {
            const fileExt = file.name.split(".").pop();
            const fileName = `hero-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `hero/${fileName}`;
            const { error: uploadError } = await supabase.storage.from("public-media").upload(filePath, file);
            if (uploadError) throw uploadError;
            newPaths.push(filePath);
        }
        setMediaPaths(prev => [...prev, ...newPaths]);
    } catch (error) {
        console.error(error);
        alert("Hiba a feltöltés során!");
    } finally {
        setUploading(false);
        e.target.value = "";
    }
  };

  const removeImage = async (indexToRemove: number) => {
      const pathToRemove = mediaPaths[indexToRemove];
      if (!pathToRemove) return;

      if (!initialMediaPaths.includes(pathToRemove)) {
        try {
          await deletePaths([pathToRemove]);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Hiba a képtörlés során.";
          alert(message);
          return;
        }
      }

      setMediaPaths(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
      const newOrder = [...(settings.components_order || ['title', 'body', 'buttons'])];
      if (direction === 'up' && index > 0) {
          [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      } else if (direction === 'down' && index < newOrder.length - 1) {
          [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      }
      setSettings({ ...settings, components_order: newOrder });
  };

  async function save() {
    setSaving(true);
    try {
      await deleteByDiff(initialMediaPaths, mediaPaths);

      const { error } = await supabase
        .from("page_sections")
        .update({
          title, body,
          cta_label: ctaLabel, cta_url: ctaUrl,
          cta_label_2: ctaLabel2, cta_url_2: ctaUrl2,
          media_paths: mediaPaths,
          is_active: isActive,
          settings: settings
        })
        .eq("key", "home_hero");

      if (error) alert("Hiba mentéskor!");
      else {
        setInitialMediaPaths(mediaPaths);
        alert("Sikeres mentés!");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Hiba a képtörlés során.";
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  const getStorageUrl = (path: string) => 
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${path}`;

  // Típusdefiníció az igazításokhoz a mapeléshez
  const alignments: HeroSettings['align'][] = [
    'top-left', 'top-center', 'top-right', 
    'center-left', 'center-center', 'center-right', 
    'bottom-left', 'bottom-center', 'bottom-right'
  ];

  if (loading) return <div className="p-6">Betöltés...</div>;

  return (
    <main className="p-6 max-w-5xl mx-auto pb-32">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/80 backdrop-blur z-20 py-4 border-b">
        <h1 className="text-2xl font-bold">Hero szerkesztése</h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* BAL OSZLOP */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Szöveges tartalom</h2>
                <label className="mb-4 flex items-center justify-between rounded-lg border p-3 text-sm">
                    <span>Blokk látható</span>
                    <input
                        type="checkbox"
                        checked={settings.show_text_content ?? true}
                        onChange={(e) => setSettings({ ...settings, show_text_content: e.target.checked })}
                        className="h-5 w-5"
                    />
                </label>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Főcím</label>
                    <RichTextEditor 
                        value={title} 
                        onChange={setTitle}
                        placeholder="Főcím..."
                        minHeight="80px"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Szöveg</label>
                    <RichTextEditor 
                        value={body} 
                        onChange={setBody}
                        placeholder="Leírás..."
                        minHeight="150px"
                    />
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm">
                 <h2 className="text-lg font-semibold mb-4">Gombok</h2>
                 <label className="mb-4 flex items-center justify-between rounded-lg border p-3 text-sm">
                    <span>Blokk látható</span>
                    <input
                        type="checkbox"
                        checked={settings.show_buttons ?? true}
                        onChange={(e) => setSettings({ ...settings, show_buttons: e.target.checked })}
                        className="h-5 w-5"
                    />
                 </label>
                 <div className="mb-4 pb-4 border-b">
                    <h3 className="text-sm font-bold text-neutral-500 mb-2 uppercase">Elsődleges (Fekete)</h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <input className="border p-2 rounded" placeholder="Felirat" value={ctaLabel} onChange={e => setCtaLabel(e.target.value)} />
                        <input className="border p-2 rounded" placeholder="URL" value={ctaUrl} onChange={e => setCtaUrl(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Gomb szövegszíne</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={settings.primary_button_text_color || '#000000'} 
                          onChange={(e) => setSettings({...settings, primary_button_text_color: e.target.value})}
                          className="w-10 h-10 border rounded cursor-pointer"
                        />
                        <input 
                          type="text"
                          value={settings.primary_button_text_color || ''}
                          onChange={(e) => setSettings({...settings, primary_button_text_color: e.target.value})}
                          className="w-full border p-2 rounded text-sm uppercase"
                        />
                      </div>
                      <button 
                        onClick={() => setSettings({...settings, primary_button_text_color: ""})}
                        className="text-xs text-red-500 mt-1 underline"
                      >
                        Alaphelyzet
                      </button>
                    </div>
                 </div>
                 <div>
                    <h3 className="text-sm font-bold text-neutral-500 mb-2 uppercase">Másodlagos (Keretes)</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <input className="border p-2 rounded" placeholder="Felirat" value={ctaLabel2} onChange={e => setCtaLabel2(e.target.value)} />
                        <input className="border p-2 rounded" placeholder="URL" value={ctaUrl2} onChange={e => setCtaUrl2(e.target.value)} />
                    </div>
                 </div>
            </div>
        </div>

        {/* JOBB OSZLOP */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Képek</h2>
                <label className="mb-4 flex items-center justify-between rounded-lg border p-3 text-sm">
                    <span>Blokk látható</span>
                    <input
                        type="checkbox"
                        checked={settings.show_media ?? true}
                        onChange={(e) => setSettings({ ...settings, show_media: e.target.checked })}
                        className="h-5 w-5"
                    />
                </label>
                <div className="mb-4">
                    <label className="block w-full p-4 border-2 border-dashed rounded-xl text-center cursor-pointer hover:bg-neutral-50 transition">
                        <span className="text-sm font-medium text-neutral-600">{uploading ? "Feltöltés..." : "+ Képek (Max 10)"}</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {mediaPaths.map((path, idx) => (
                        <div key={idx} className="relative group aspect-video bg-neutral-100 rounded overflow-hidden">
                            <img src={getStorageUrl(path)} className="w-full h-full object-cover" alt="" />
                            <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition text-xs">🗑️</button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Megjelenés & Sorrend</h2>

                <div className="mb-6 rounded-xl border p-4 flex items-center justify-between">
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

                {/* SZÍNEK */}
                <div className="mb-6 p-4 bg-neutral-50 rounded-lg border">
                    <h3 className="text-sm font-bold text-neutral-700 mb-3 uppercase">Egyedi Színek</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        {/* Tartalom Szín */}
                        <div>
                            <label className="block text-xs font-semibold mb-1">Tartalom (Szöveg/Gomb)</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color" 
                                    value={settings.content_color || '#000000'} 
                                    onChange={(e) => setSettings({...settings, content_color: e.target.value})}
                                    className="w-10 h-10 border rounded cursor-pointer"
                                />
                                <input 
                                    type="text"
                                    placeholder="#000000"
                                    value={settings.content_color || ''}
                                    onChange={(e) => setSettings({...settings, content_color: e.target.value})}
                                    className="w-full border p-2 rounded text-sm uppercase"
                                />
                            </div>
                            <button 
                                onClick={() => setSettings({...settings, content_color: ""})}
                                className="text-xs text-red-500 mt-1 underline"
                            >
                                Visszaállítás alapra
                            </button>
                        </div>

                        {/* Háttérszín */}
                        <div>
                            <label className="block text-xs font-semibold mb-1">Háttérszín (Kép alatt)</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color" 
                                    value={settings.background_color || '#ffffff'} 
                                    onChange={(e) => setSettings({...settings, background_color: e.target.value})}
                                    className="w-10 h-10 border rounded cursor-pointer"
                                />
                                <input 
                                    type="text"
                                    placeholder="#ffffff"
                                    value={settings.background_color || ''}
                                    onChange={(e) => setSettings({...settings, background_color: e.target.value})}
                                    className="w-full border p-2 rounded text-sm uppercase"
                                />
                            </div>
                            <button 
                                onClick={() => setSettings({...settings, background_color: ""})}
                                className="text-xs text-red-500 mt-1 underline"
                            >
                                Visszaállítás alapra
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Desktop Elrendezés (Mobilon mindig Stack)</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setSettings({...settings, layout: 'overlay'})} className={`p-3 border rounded-lg text-sm ${settings.layout === 'overlay' ? 'bg-black text-white border-black' : 'bg-white'}`}>Háttérkép</button>
                        <button onClick={() => setSettings({...settings, layout: 'stack'})} className={`p-3 border rounded-lg text-sm ${settings.layout === 'stack' ? 'bg-black text-white border-black' : 'bg-white'}`}>Kép alatt/felett</button>
                    </div>
                </div>

                {settings.layout === 'overlay' && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-1">Háttér sötétítés: {settings.overlay_opacity}%</label>
                        <input type="range" min="0" max="90" step="10" value={settings.overlay_opacity} onChange={(e) => setSettings({...settings, overlay_opacity: Number(e.target.value)})} className="w-full" />
                    </div>
                )}

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Tartalom Sorrendje</label>
                    <div className="flex flex-col gap-2">
                        {(settings.components_order || ['title', 'body', 'buttons']).map((item, index) => (
                            <div key={item} className="flex items-center justify-between p-3 bg-neutral-50 border rounded-lg">
                                <span className="font-medium text-sm">{COMPONENT_LABELS[item]}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="p-1 hover:bg-neutral-200 rounded disabled:opacity-30">⬆️</button>
                                    <button onClick={() => moveItem(index, 'down')} disabled={index === 2} className="p-1 hover:bg-neutral-200 rounded disabled:opacity-30">⬇️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Igazítás</label>
                    <div className="w-32 mx-auto grid grid-cols-3 gap-2 p-2 bg-neutral-100 rounded-lg">
                        {alignments.map((pos) => (
                            <button key={pos} onClick={() => setSettings({...settings, align: pos})} className={`w-8 h-8 rounded border ${settings.align === pos ? 'bg-black border-black' : 'bg-white hover:border-black'}`}>
                                <div className={`w-2 h-2 rounded-full mx-auto ${settings.align === pos ? 'bg-white' : 'bg-neutral-300'}`} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-8 rounded-xl border p-4">
                    <h3 className="text-sm font-bold text-neutral-700 mb-3 uppercase">SEO (Home)</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold mb-1">SEO cim</label>
                            <input
                                type="text"
                                value={settings.seo_title || ""}
                                onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })}
                                className="w-full border p-2 rounded text-sm"
                                placeholder="pl. Vis Eat Miskolc | Fooldal"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1">SEO leiras</label>
                            <textarea
                                value={settings.seo_description || ""}
                                onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
                                className="w-full border p-2 rounded text-sm min-h-[90px]"
                                placeholder="Rovid leiras a fooldalhoz."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1">SEO kep (URL vagy storage path)</label>
                            <input
                                type="text"
                                value={settings.seo_image || ""}
                                onChange={(e) => setSettings({ ...settings, seo_image: e.target.value })}
                                className="w-full border p-2 rounded text-sm"
                                placeholder="pl. hero/valami.jpg vagy https://..."
                            />
                            <button
                                type="button"
                                onClick={() => setSettings({ ...settings, seo_image: mediaPaths[0] || "" })}
                                className="text-xs text-neutral-600 mt-2 underline"
                            >
                                Elso hero kep hasznalata
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}
