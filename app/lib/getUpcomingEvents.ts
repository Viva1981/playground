import { createClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Bővített típus: benne van az étterem neve és slugja
export type EventListItem = {
  id: string;
  title: string;
  slug: string;
  starts_at: string;
  summary: string | null;
  cover_path: string | null;
  restaurants: {
    name: string;
    slug: string;
  } | null;
};

export async function getUpcomingEvents(
  limit: number = 12
): Promise<EventListItem[]> {
  noStore(); // Cache tiltása, mindig friss adat

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const filterDateIso = today.toISOString();

  // A SELECT-ben a "restaurants(name, slug)" kéri le a kapcsolt adatot
  const { data, error } = await supabase
    .from("events")
    .select("id, title, slug, starts_at, summary, cover_path, restaurants(name, slug)")
    .eq("is_published", true)
    .gte("starts_at", filterDateIso)
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("getUpcomingEvents error:", error.message);
    return [];
  }

  // TypeScript hack: A Supabase visszatérése tömb lehet, de mi tudjuk, hogy 1 étterem van.
  // A fenti típusdefinícióval ez így kompatibilis lesz a komponenssel.
  return (data as any) ?? [];
}