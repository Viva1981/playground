import { createClient } from "@supabase/supabase-js";

// Megjegyzés: Server Componentekben érdemes lehet a createClient-et minden hívásnál példányosítani
// vagy a globális cache-t kikapcsolni, de a page.tsx force-dynamic-ja ezt megoldja.
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

export async function getUpcomingEvents(
  limit: number = 6
): Promise<EventListItem[]> {
  // 1. LÉPÉS: Nem a "most"-ot vesszük, hanem a mai nap elejét.
  // Így a ma esti buli akkor is látszik, ha már elkezdődött.
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Beállítjuk éjfélre (00:00:00)
  const filterDateIso = today.toISOString();

  const { data, error } = await supabase
    .from("events")
    .select("id, title, slug, starts_at, summary, cover_path")
    .eq("is_published", true)
    .gte("starts_at", filterDateIso) // 2. LÉPÉS: Éjféltől szűrünk
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("getUpcomingEvents error:", error.message);
    return [];
  }

  return data ?? [];
}