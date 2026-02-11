"use client";

import { useEffect, useState, use } from "react"; // Next 15+ miatt use() kell a params-hoz
import { supabase } from "@/app/utils/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function EditRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  // Next.js 16-ban a params Promise, ki kell csomagolni:
  const { id } = use(params);

  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", id)
        .single();
      setRestaurant(data);
      setLoading(false);
    })();
  }, [id]);

  async function save() {
    setSaving(true);
    await supabase
      .from("restaurants")
      .update({
        name: restaurant.name,
        slug: restaurant.slug,
        address: restaurant.address,
        phone: restaurant.phone,
        website: restaurant.website,
        description: restaurant.description,
        is_active: restaurant.is_active,
      })
      .eq("id", id);
    setSaving(false);
    alert("Sikeres mentés!");
  }

  async function uploadCover(file: File) {
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `restaurants/${id}/cover.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("public-media")
      .upload(filePath, file, { upsert: true });

    if (!uploadError) {
      await supabase
        .from("restaurants")
        .update({ cover_path: filePath })
        .eq("id", id);
      setRestaurant({ ...restaurant, cover_path: filePath });
    }
    setUploading(false);
  }

  if (loading) return <div className="p-6">Betöltés...</div>;
  if (!restaurant) return <div className="p-6">Nem található.</div>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Étterem szerkesztése</h1>
        <a href="/admin/restaurants" className="text-sm underline">Vissza</a>
      </div>

      <div className="grid gap-4 bg-white p-6 rounded-xl border shadow-sm">
        {/* Adatok */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Név</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={restaurant.name}
              onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Slug (URL)</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={restaurant.slug}
              onChange={(e) => setRestaurant({ ...restaurant, slug: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Cím</label>
          <input
            className="w-full border p-2 rounded-lg"
            value={restaurant.address || ""}
            onChange={(e) => setRestaurant({ ...restaurant, address: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Telefonszám</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={restaurant.phone || ""}
              onChange={(e) => setRestaurant({ ...restaurant, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Weboldal</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={restaurant.website || ""}
              onChange={(e) => setRestaurant({ ...restaurant, website: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Leírás</label>
          <textarea
            className="w-full border p-2 rounded-lg min-h-[100px]"
            value={restaurant.description || ""}
            onChange={(e) => setRestaurant({ ...restaurant, description: e.target.value })}
          />
        </div>

        {/* Borítókép */}
        <div className="border-t pt-4 mt-2">
          <label className="text-sm font-medium mb-2 block">Borítókép</label>
          {restaurant.cover_path && (
            <div className="mb-3 relative h-40 w-full rounded-lg overflow-hidden border">
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${restaurant.cover_path}`}
                alt="Cover"
                fill
                className="object-cover"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])}
          />
          {uploading && <span className="text-sm text-blue-600 ml-2">Feltöltés...</span>}
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={save}
            disabled={saving}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-neutral-800"
          >
            {saving ? "Mentés..." : "Mentés"}
          </button>
        </div>
      </div>
    </main>
  );
}