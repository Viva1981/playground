import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type PageSection = {
  title: string | null;
  body: string | null;
};

export async function getHomeSection(
  key: string
): Promise<PageSection | null> {
  const { data, error } = await supabase
    .from("page_sections")
    .select("title, body")
    .eq("key", key)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error(`getHomeSection(${key}) error:`, error.message);
    return null;
  }

  return data ?? null;
}
