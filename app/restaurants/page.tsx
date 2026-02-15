import { supabase } from "@/app/utils/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

// Hogy mindig friss adatot mutasson (ha új étterem kerül be)
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Éttermek | Vis Eat Miskolc",
  description: "Miskolc legjobb éttermei, gasztro helyei és partnereink egy helyen.",
};

export default async function RestaurantsPage() {
  // Lekérjük az aktív éttermeket ABC sorrendben
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, slug, address, cover_path")
    .eq("is_active", true)
    .order("name");

  return (
    <main className="min-h-screen bg-white">
      {/* Lista / Grid */}
      <div className="px-6 py-10 md:py-14 mx-auto max-w-6xl">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            ← Vissza a főoldalra
          </Link>
        </div>

        {!restaurants || restaurants.length === 0 ? (
          <div className="text-center text-neutral-500 py-10">
            Jelenleg nincs megjeleníthető étterem.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((place) => (
              <Link
                key={place.id}
                href={`/restaurants/${place.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border bg-white transition hover:shadow-xl hover:-translate-y-1"
              >
                {/* Kép Konténer */}
                <div className="relative w-full aspect-[2/1] overflow-hidden bg-neutral-100">
                  {place.cover_path ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${place.cover_path}`}
                      alt={place.name}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-neutral-400">
                      <span className="text-sm">Nincs kép</span>
                    </div>
                  )}
                </div>

                {/* Szöveges rész */}
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-black">
                    {place.name}
                  </h2>
                  
                  {place.address && (
                    <div className="flex items-start gap-2 text-sm text-neutral-500 mb-3">
                      <span>📍</span>
                      <span>{place.address}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
