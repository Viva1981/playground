import { createClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type EventListItem = {
  id: string;
  title: string;
  slug: string;
  starts_at: string | null;
  summary: string | null;
  cover_path: string | null;
  event_type?: "program" | "news" | "report" | null;
  schedule_type?: "datetime" | "date_range" | "undated" | null;
  starts_on?: string | null;
  ends_on?: string | null;
  date_label?: string | null;
  restaurants: {
    name: string;
    slug: string;
  } | null;
};

export async function getUpcomingEvents(limit: number = 12): Promise<EventListItem[]> {
  noStore();

  const advancedSelect =
    "id, title, slug, starts_at, summary, cover_path, event_type, schedule_type, starts_on, ends_on, date_label, restaurants(name, slug)";
  const legacySelect =
    "id, title, slug, starts_at, summary, cover_path, restaurants(name, slug)";

  // Nincs múltbeli szűrés: minden publikált esemény/hír jöhet.
  const { data: advancedData, error: advancedError } = await supabase
    .from("events")
    .select(advancedSelect)
    .eq("is_published", true)
    .order("starts_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (!advancedError) {
    return (advancedData as EventListItem[]) ?? [];
  }

  // Fallback régi sémára
  const { data: legacyData, error: legacyError } = await supabase
    .from("events")
    .select(legacySelect)
    .eq("is_published", true)
    .order("starts_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (legacyError) {
    console.error("getUpcomingEvents error:", legacyError.message);
    return [];
  }

  return (legacyData as EventListItem[]) ?? [];
}
