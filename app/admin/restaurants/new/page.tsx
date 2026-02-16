"use client";

import { useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { useRouter } from "next/navigation";
import MapPicker from "@/app/components/admin/MapPicker";

export default function NewRestaurantPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [saving, setSaving] = useState(false);

  // Automatikus slug generálás a névből
  function handleNameChange(val: string) {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[áéíóöőúüű]/g, (c) =>
        ({ á: "a", é: "e", í: "i", ó: "o", ö: "o", ő: "o", ú: "u", ü: "u", ű: "u" }[c] || c)
      )
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(generatedSlug);
  }

  async function create() {
    setSaving(true);
    const { error } = await supabase.from("restaurants").insert({
      name,
      slug,
      is_active: true,
      lat: lat.trim() ? Number(lat) : null,
      lng: lng.trim() ? Number(lng) : null,
    });

    if (!error) {
      router.push("/admin/restaurants");
      router.refresh();
    } else {
      alert("Hiba: " + error.message);
      setSaving(false);
    }
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Új étterem felvétele</h1>
      
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Név</label>
          <input
            className="w-full border p-2 rounded-lg"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Pl. Pizza Király"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">URL (Slug)</label>
          <input
            className="w-full border p-2 rounded-lg bg-neutral-50"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Latitude</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="pl. 48.1035"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitude</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="pl. 20.7784"
            />
          </div>
        </div>

        <div className="mt-2">
          <label className="block text-sm font-medium mb-2">Koordinata valaszto</label>
          <MapPicker
            lat={lat.trim() ? Number(lat) : null}
            lng={lng.trim() ? Number(lng) : null}
            onChange={(nextLat, nextLng) => {
              setLat(nextLat.toFixed(7));
              setLng(nextLng.toFixed(7));
            }}
          />
        </div>

        <button
          onClick={create}
          disabled={saving || !name}
          className="bg-black text-white py-3 rounded-lg mt-4 disabled:opacity-50"
        >
          {saving ? "Mentés..." : "Létrehozás"}
        </button>
      </div>
    </main>
  );
}
