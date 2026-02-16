import { supabase } from "@/app/utils/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { getHomeSection } from "@/app/lib/getHomeSection";
import type { HeaderSettings } from "@/app/lib/types";
import { getHomeHero } from "@/app/lib/getHomeHero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ettermek | Vis Eat Miskolc",
  description: "Miskolc legjobb ettermei, gasztro helyei es partnereink egy helyen.",
};

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 21s-6-5.7-6-10a6 6 0 1 1 12 0c0 4.3-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

export default async function RestaurantsPage() {
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, slug, address, cover_path")
    .eq("is_active", true)
    .order("name");
  const headerSection = await getHomeSection("global_header");
  const headerSettings = (headerSection?.settings ?? {}) as HeaderSettings;
  const headerColor = headerSettings.background_color || "#f5f5f5";
  const hero = await getHomeHero();
  const heroSettings = hero?.settings || null;
  const heroContentColor = heroSettings?.content_color || null;
  const heroPrimaryTextColor = heroSettings?.primary_button_text_color || "#000000";

  return (
    <main className="min-h-screen" style={{ backgroundColor: headerColor }}>
      <div className="px-6 py-10 md:py-14 mx-auto max-w-6xl">
        <div className="mb-6">
          <Link
            href="/"
            className={`inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold transition hover:opacity-80 ${
              heroContentColor ? "" : "bg-black text-white"
            }`}
            style={
              heroContentColor
                ? { backgroundColor: heroContentColor, color: heroPrimaryTextColor }
                : undefined
            }
          >
            ← Vissza a fooldalra
          </Link>
        </div>

        {!restaurants || restaurants.length === 0 ? (
          <div className="text-center text-neutral-500 py-10">Jelenleg nincs megjelenitheto etterem.</div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((place) => (
              <Link
                key={place.id}
                href={`/restaurants/${place.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border bg-white transition hover:shadow-xl hover:-translate-y-1"
              >
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
                      <span className="text-sm">Nincs kep</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-black">{place.name}</h2>

                  {place.address && (
                    <div className="flex items-start gap-2 text-sm text-neutral-500 mb-3">
                      <MapPinIcon className="h-4 w-4 mt-0.5 shrink-0" />
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
