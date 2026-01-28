import { createClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache"; // Ezt importáljuk a cache tiltáshoz

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type EventListItem = {
  id: string;
  title: string;
  slug: string;
  starts_at: string;
  summary: string | null;
  cover_path: string | null;
};

// Felemeltem a limit alapértelmezését 6-ról 12-re, hogy biztosan beleférjenek
export async function getUpcomingEvents(
  limit: number = 12
): Promise<EventListItem[]> {
  // 1. LÉPÉS: Ez a parancs közli a Next.js-szel, hogy TILOS cache-elni ennek a függvénynek az eredményét.
  // Minden egyes oldalbetöltéskor friss adatot fog kérni a Supabase-től.
  noStore();

  // Mai nap éjfél meghatározása
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const filterDateIso = today.toISOString();

  const { data, error } = await supabase
    .from("events")
    .select("id, title, slug, starts_at, summary, cover_path")
    .eq("is_published", true)
    .gte("starts_at", filterDateIso)
    .order("starts_at", { ascending: true }) // A legkorábbi esemény van legelöl
    .limit(limit);

  if (error) {
    console.error("getUpcomingEvents error:", error.message);
    return [];
  }

  return data ?? [];
}