import { supabase } from "@/app/utils/supabaseClient";
import MapClient from "./MapClient";
import Link from "next/link";
import type { HeaderSettings } from "@/app/lib/types";
import { getHomeSection } from "@/app/lib/getHomeSection";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, slug, address, lat, lng")
    .eq("is_active", true)
    .order("name");

  const headerSection = await getHomeSection("global_header");
  const headerSettings = (headerSection?.settings ?? {}) as HeaderSettings;
  const headerColor = headerSettings.background_color || "#f5f5f5";
  const headerLogoPath = headerSection?.media_paths?.[0] || null;
  const headerLogoUrl = headerLogoPath
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${headerLogoPath}`
    : null;
  const list = (restaurants ?? []).filter(
    (item) =>
      typeof item.lat === "number" &&
      Number.isFinite(item.lat) &&
      typeof item.lng === "number" &&
      Number.isFinite(item.lng)
  );

  return (
    <main className="min-h-screen" style={{ backgroundColor: headerColor }}>
      <div className="px-6 py-10 md:py-14 mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">VisEat Térkép</h1>
        </div>

        <div
          className="rounded-2xl p-3 md:p-4"
          style={{ backgroundColor: headerColor }}
        >
          <MapClient
            headerColor={headerColor}
            headerLogoUrl={headerLogoUrl}
            restaurants={restaurants ?? []}
          />
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">VisEat Éttermek</h2>
          {list.length === 0 ? (
            <div className="mt-4 rounded-2xl border bg-white p-6 text-sm text-neutral-600">
              Jelenleg nincs olyan etterem, amelyhez megadott koordinata van.
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {list.map((place) => (
                <Link
                  key={place.id}
                  href={`/restaurants/${place.slug}`}
                  className="group rounded-2xl border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-neutral-900 group-hover:text-black">
                        {place.name}
                      </div>
                      {place.address && (
                        <div className="mt-1 text-sm text-neutral-600">
                          {place.address}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
