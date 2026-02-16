import { supabase } from "@/app/utils/supabaseClient";
import type { HeaderSettings } from "@/app/lib/types";
import { getHomeSection } from "@/app/lib/getHomeSection";
import MapClient from "./MapClient";
import Link from "next/link";

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
  const contentColor = headerSettings.content_color || "#111111";

  const list = (restaurants ?? []).filter(
    (item) =>
      typeof item.lat === "number" &&
      Number.isFinite(item.lat) &&
      typeof item.lng === "number" &&
      Number.isFinite(item.lng)
  );

  return (
    <main className="min-h-screen bg-white">
      <section
        className="border-b"
        style={{ backgroundColor: headerColor, color: contentColor }}
      >
        <div className="px-6 py-10 md:py-14 mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] opacity-70">
                VisEat Miskolc
              </p>
              <h1 className="text-3xl md:text-4xl font-bold">Programterkep</h1>
              <p className="mt-2 text-sm md:text-base opacity-80 max-w-2xl">
                A programban resztvevo etteremek egy helyen, hogy konnyen
                megtalald oket Miskolcon.
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-medium text-neutral-700 shadow">
              {list.length} hely koordinataval
            </div>
          </div>
        </div>
      </section>

      <div className="px-6 py-10 md:py-14 mx-auto max-w-6xl">
        <MapClient headerColor={headerColor} restaurants={restaurants ?? []} />

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-neutral-900">
            Resztvevo etteremek
          </h2>
          <p className="text-sm text-neutral-600">
            Kattints a nevukre a reszletekhez.
          </p>
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
                    <div className="text-xs text-neutral-500">
                      {place.lat?.toFixed(5)}, {place.lng?.toFixed(5)}
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
