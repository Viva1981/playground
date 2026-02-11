"use client";

import { useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { useRouter } from "next/navigation";

export default function NewRestaurantPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
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