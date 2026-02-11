"use client";
import { useEffect, useState, ChangeEvent } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import Image from "next/image";

// Típusok (lokálisan, hogy egyszerű legyen másolni)
type HeroSettings = {
    layout: 'overlay' | 'stack';
    align: string;
    overlay_opacity: number;
};

export default function AdminHeroPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Szöveges adatok
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [ctaLabel2, setCtaLabel2] = useState("");
  const [ctaUrl2, setCtaUrl2] = useState("");

  // Képek és Beállítások
  const [mediaPaths, setMediaPaths] = useState<string[]>([]);
  const [settings, setSettings] = useState<HeroSettings>({
      layout: 'overlay',
      align: 'center-center',
      overlay_opacity: 50
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
        setCtaLabel(data.cta_label || "");
        setCtaUrl(data.cta_url || "");
        setCtaLabel2(data.cta_label_2 || "");
        setCtaUrl2(data.cta_url_2 || "");
        
        // Képek betöltése (array)
        setMediaPaths(data.media_paths || []);
        
        // Beállítások betöltése (JSONB)
        if (data.settings) {
            setSettings(prev => ({ ...prev, ...data.settings }));
        }
      }
      setLoading(false);
    })();
  }, []);

  // --- KÉPFELTÖLTÉS LOGIKA ---
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // Max 10 kép ellenőrzés
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

            const { error: uploadError } = await supabase.storage
                .from("public-media")
                .upload(filePath, file);

            if (uploadError) throw uploadError;
            newPaths.push(filePath);
        }
        
        // Hozzáadjuk a meglévőkhöz
        setMediaPaths(prev => [...prev, ...newPaths]);

    } catch (error) {
        console.error("Upload error:", error);
        alert("Hiba a feltöltés során!");
    } finally {
        setUploading(false);
        // Reset input value
        e.target.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
      setMediaPaths(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // --- MENTÉS ---
  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("page_sections")
      .update({
        title,
        body,
        cta_label: ctaLabel,
        cta_url: ctaUrl,
        cta_label_2: ctaLabel2,
        cta_url_2: ctaUrl2,
        media_paths: mediaPaths, // Array mentése
        settings: settings // JSONB mentése
      })
      .eq("key", "home_hero");
    
    setSaving(false);
    if (error) {
        console.error(error);
        alert("Hiba mentéskor!");
    } else {
        alert("Sikeres mentés!");
    }
  }

  // --- HELPER A STORAGE URL-HEZ ---
  const getStorageUrl = (path: string) => 
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${path}`;

  if (loading) return <div className="p-6">Betöltés...</div>;

  return (
    <main className="p-6 max-w-4xl mx-auto pb-32">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hero szekció szerkesztése</h1>
        <button
          onClick={save}
          disabled={saving}
          className="bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-neutral-800 disabled:opacity-50"
        >
          {saving ? "Mentés..." : "Módosítások mentése"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* BAL OSZLOP: TARTALOM */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Szöveges tartalom</h2>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Főcím</label>
                    <input
                        className="w-full border p-3 rounded-lg"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Szöveg</label>
                    <textarea
                        className="w-full border p-3 rounded-lg min-h-[100px]"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm">
                 <h2 className="text-lg font-semibold mb-4">Gombok</h2>
                 {/* ELSŐDLEGES GOMB */}
                 <div className="mb-4 pb-4 border-b">
                    <h3 className="text-sm font-bold text-neutral-500 mb-2 uppercase">Elsődleges (Fekete)</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <input className="border p-2 rounded" placeholder="Felirat" value={ctaLabel} onChange={e => setCtaLabel(e.target.value)} />
                        <input className="border p-2 rounded" placeholder="URL" value={ctaUrl} onChange={e => setCtaUrl(e.target.value)} />
                    </div>
                 </div>
                 {/* MÁSODLAGOS GOMB */}
                 <div>
                    <h3 className="text-sm font-bold text-neutral-500 mb-2 uppercase">Másodlagos (Keretes)</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <input className="border p-2 rounded" placeholder="Felirat" value={ctaLabel2} onChange={e => setCtaLabel2(e.target.value)} />
                        <input className="border p-2 rounded" placeholder="URL" value={ctaUrl2} onChange={e => setCtaUrl2(e.target.value)} />
                    </div>
                 </div>
            </div>
        </div>

        {/* JOBB OSZLOP: MÉDIA ÉS MEGJELENÉS */}
        <div className="space-y-6">
            
            {/* KÉPKEZELŐ */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Képek / Slideshow</h2>
                <div className="mb-4">
                    <label className="block w-full p-4 border-2 border-dashed rounded-xl text-center cursor-pointer hover:bg-neutral-50 transition">
                        <span className="text-sm font-medium text-neutral-600">
                            {uploading ? "Feltöltés..." : "+ Képek hozzáadása (Max 10)"}
                        </span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                </div>

                {/* Kép lista */}
                <div className="grid grid-cols-3 gap-2">
                    {mediaPaths.map((path, idx) => (
                        <div key={idx} className="relative group aspect-video bg-neutral-100 rounded overflow-hidden">
                            <img src={getStorageUrl(path)} className="w-full h-full object-cover" alt="" />
                            <button 
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition text-xs"
                            >
                                🗑️
                            </button>
                            <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1 rounded">{idx + 1}</span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-neutral-500 mt-2">Több kép esetén 5mp-es slideshow indul.</p>
            </div>

            {/* MEGJELENÉS BEÁLLÍTÁSOK */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Megjelenés</h2>

                {/* Layout Választó */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Elrendezés Típusa</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => setSettings({...settings, layout: 'overlay'})}
                            className={`p-3 border rounded-lg text-sm text-center ${settings.layout === 'overlay' ? 'bg-black text-white border-black' : 'bg-white hover:bg-neutral-50'}`}
                        >
                            Háttérkép (Overlay)
                        </button>
                        <button 
                            onClick={() => setSettings({...settings, layout: 'stack'})}
                            className={`p-3 border rounded-lg text-sm text-center ${settings.layout === 'stack' ? 'bg-black text-white border-black' : 'bg-white hover:bg-neutral-50'}`}
                        >
                            Kép a tartalom felett
                        </button>
                    </div>
                </div>

                {/* Sötétítés csúszka (Csak Overlay esetén releváns) */}
                {settings.layout === 'overlay' && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-1">Háttér sötétítés: {settings.overlay_opacity}%</label>
                        <input 
                            type="range" min="0" max="90" step="10"
                            value={settings.overlay_opacity}
                            onChange={(e) => setSettings({...settings, overlay_opacity: Number(e.target.value)})}
                            className="w-full"
                        />
                    </div>
                )}

                {/* Pozíció Mátrix (9 pont) */}
                <div>
                    <label className="block text-sm font-medium mb-2">Tartalom Igazítása</label>
                    <div className="w-32 mx-auto grid grid-cols-3 gap-2 p-2 bg-neutral-100 rounded-lg">
                        {['top-left', 'top-center', 'top-right', 
                          'center-left', 'center-center', 'center-right', 
                          'bottom-left', 'bottom-center', 'bottom-right'].map((pos) => (
                            <button
                                key={pos}
                                onClick={() => setSettings({...settings, align: pos})}
                                className={`w-8 h-8 rounded border ${
                                    settings.align === pos 
                                    ? 'bg-black border-black' 
                                    : 'bg-white border-neutral-300 hover:border-black'
                                }`}
                                title={pos}
                            >
                                <div className={`w-2 h-2 rounded-full mx-auto ${settings.align === pos ? 'bg-white' : 'bg-neutral-300'}`} />
                            </button>
                        ))}
                    </div>
                    <div className="text-center text-xs text-neutral-500 mt-2">
                        {settings.align}
                    </div>
                </div>

            </div>

        </div>
      </div>
    </main>
  );
}