import { createClient } from "@supabase/supabase-js";

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
};

export async function getUpcomingEvents(
  limit: number = 6
): Promise<EventListItem[]> {
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("events")
    .select("id, title, slug, starts_at, summary")
    .eq("is_published", true)
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("getUpcomingEvents error:", error.message);
    return [];
  }

  return data ?? [];
}
