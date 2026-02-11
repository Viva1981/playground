"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import Link from "next/link";

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("restaurants")
        .select("*")
        .order("name");
      if (data) setRestaurants(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-6">Betöltés...</div>;

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Éttermek</h1>
        <div className="flex gap-4">
          <Link href="/admin" className="text-sm underline py-2">Vissza</Link>
          <Link
            href="/admin/restaurants/new"
            className="bg-black text-white px-4 py-2 rounded-lg text-sm"
          >
            + Új étterem
          </Link>
        </div>
      </div>

      <div className="grid gap-3">
        {restaurants.map((r) => (
          <Link
            key={r.id}
            href={`/admin/restaurants/${r.id}`}
            className="flex items-center justify-between border p-4 rounded-xl hover:bg-neutral-50"
          >
            <div>
              <div className="font-semibold">{r.name}</div>
              <div className="text-sm text-neutral-500">{r.address || "Nincs cím megadva"}</div>
            </div>
            <div className="text-sm text-neutral-400">Szerkesztés →</div>
          </Link>
        ))}
        {restaurants.length === 0 && (
          <div className="text-neutral-500">Még nincs felvéve étterem.</div>
        )}
      </div>
    </main>
  );
}