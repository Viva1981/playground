import { supabase } from "@/app/utils/supabaseClient";
import type { HeaderSettings } from "@/app/lib/types";
import { getHomeSection } from "@/app/lib/getHomeSection";
import MapClient from "./MapClient";

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

  return (
    <main className="min-h-screen bg-white">
      <div className="px-6 py-10 md:py-14 mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Terkep</h1>
          <p className="text-sm text-neutral-600">
            Az etterem koordinatak a restaurants tabla `lat` es `lng` mezoi alapjan.
          </p>
        </div>
        <MapClient headerColor={headerColor} restaurants={restaurants ?? []} />
      </div>
    </main>
  );
}
