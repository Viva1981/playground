// app/admin/header/page.tsx
"use client";
import { useEffect, useState, ChangeEvent } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import RichTextEditor from "@/app/components/admin/RichTextEditor";
import type { HeaderSettings, MenuItem } from "@/app/lib/types";

export default function AdminHeaderPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Logo
  const [logoPath, setLogoPath] = useState<string | null>(null);
  
  // Settings
  const [settings, setSettings] = useState<HeaderSettings>({
      background_color: "#ffffff",
      content_color: "#000000",
      site_title: "", // Kezdeti érték
      menu_items: []
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("page_sections")
        .select("*")
        .eq("key", "global_header")
        .single();

      if (data) {
        if (data.media_paths && data.media_paths.length > 0) {
            setLogoPath(data.media_paths[0]);
        }
        
        if (data.settings) {
            const dbSettings = data.settings as HeaderSettings;
            setSettings(prev => ({ 
                ...prev, 
                ...dbSettings,
                site_title: dbSettings.site_title || "", // Betöltés
                menu_items: dbSettings.menu_items || []
            }));
        }
      }
      setLoading(false);
    })();
  }, []);

  // --- Képfeltöltés ---
  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    
    try {
        const file = e.target.files[0];
        const fileExt = file.name.split(".").pop();
        const fileName = `header-logo-${Date.now()}.${fileExt}`;
        const filePath = `header/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from("public-media").upload(filePath, file);
        if (uploadError) throw uploadError;

        setLogoPath(filePath); 
    } catch (error) {
        console.error(error);
        alert("Hiba a feltöltés során!");
    } finally {
        setUploading(false);
        e.target.value = "";
    }
  };

  const removeLogo = () => setLogoPath(null);

  // --- Menüpontok ---
  const addMenuItem = () => {
      setSettings({
          ...settings,
          menu_items: [...(settings.menu_items || []), { label: "Új menü", url: "/" }]
      });
  };

  const updateMenuItem = (index: number, field: keyof MenuItem, value: string) => {
      const newItems = [...(settings.menu_items || [])];
      newItems[index] = { ...newItems[index], [field]: value };
      setSettings({ ...settings, menu_items: newItems });
  };

  const removeMenuItem = (index: number) => {
      const newItems = settings.menu_items?.filter((_, i) => i !== index);
      setSettings({ ...settings, menu_items: newItems });
  };

  // --- Mentés ---
  async function save() {
    setSaving(true);
    const mediaToSave = logoPath ? [logoPath] : [];

    const { error } = await supabase
      .from("page_sections")
      .update({
        media_paths: mediaToSave,
        settings: settings
      })
      .eq("key", "global_header");
    
    setSaving(false);
    if (error) alert("Hiba mentéskor!");
    else alert("Sikeres mentés!");
  }

  const getStorageUrl = (path: string) => 
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${path}`;

  if (loading) return <div className="p-6">Betöltés...</div>;

  return (
    <main className="p-6 max-w-5xl mx-auto pb-32">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/80 backdrop-blur z-20 py-4 border-b">
        <h1 className="text-2xl font-bold">Header szerkesztése</h1>
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
            
            {/* LOGO & CÍM */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Logó és Cím</h2>
                
                {/* Logo feltöltés */}
                <div className="mb-6">
                    {!logoPath ? (
                        <label className="block w-full p-8 border-2 border-dashed rounded-xl text-center cursor-pointer hover:bg-neutral-50 transition">
                            <span className="text-sm font-medium text-neutral-600">{uploading ? "Feltöltés..." : "+ Logó feltöltése"}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
                        </label>
                    ) : (
                        <div className="relative group w-full max-w-[200px] aspect-square bg-neutral-100 rounded-lg overflow-hidden border mx-auto mb-2">
                            <img src={getStorageUrl(logoPath)} className="w-full h-full object-contain p-2" alt="Logo" />
                            <button onClick={removeLogo} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition text-xs">🗑️</button>
                        </div>
                    )}
                </div>

                {/* Oldal címe (ÚJ RÉSZ) */}
                <div>
                    <label className="block text-sm font-medium mb-1">Oldal Címe (Logó mellett)</label>
                    <RichTextEditor
                        value={settings.site_title || ""}
                        onChange={(val) => setSettings({...settings, site_title: val})}
                        placeholder="pl. Vis Eat Miskolc (Hagyd üresen, ha nem kell)"
                        minHeight="60px"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ha üresen hagyod, csak a logó jelenik meg.</p>
                </div>
            </div>

            {/* SZÍNEK */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Színek</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold mb-1">Háttérszín</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={settings.background_color || '#ffffff'} 
                                onChange={(e) => setSettings({...settings, background_color: e.target.value})}
                                className="w-10 h-10 border rounded cursor-pointer"
                            />
                            <input 
                                type="text"
                                value={settings.background_color || ''}
                                onChange={(e) => setSettings({...settings, background_color: e.target.value})}
                                className="w-full border p-2 rounded text-sm uppercase"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1">Tartalom (Szöveg/Ikon)</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={settings.content_color || '#000000'} 
                                onChange={(e) => setSettings({...settings, content_color: e.target.value})}
                                className="w-10 h-10 border rounded cursor-pointer"
                            />
                            <input 
                                type="text"
                                value={settings.content_color || ''}
                                onChange={(e) => setSettings({...settings, content_color: e.target.value})}
                                className="w-full border p-2 rounded text-sm uppercase"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* JOBB OSZLOP: Menüpontok */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Menüpontok</h2>
                    <button onClick={addMenuItem} className="text-xs bg-black text-white px-3 py-1 rounded hover:bg-neutral-800">+ Új elem</button>
                </div>
                
                <div className="space-y-3">
                    {settings.menu_items && settings.menu_items.length > 0 ? (
                        settings.menu_items.map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-start bg-neutral-50 p-3 rounded-lg border">
                                <div className="flex-1 grid gap-2">
                                    <input 
                                        className="border p-2 rounded text-sm w-full" 
                                        placeholder="Megjelenő név" 
                                        value={item.label} 
                                        onChange={(e) => updateMenuItem(idx, 'label', e.target.value)} 
                                    />
                                    <input 
                                        className="border p-2 rounded text-sm w-full text-gray-600 font-mono" 
                                        placeholder="URL (pl. /restaurants)" 
                                        value={item.url} 
                                        onChange={(e) => updateMenuItem(idx, 'url', e.target.value)} 
                                    />
                                </div>
                                <button onClick={() => removeMenuItem(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded">🗑️</button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 italic text-center py-4">Nincsenek menüpontok.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}