import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type HomeHeroSection = {
  title: string | null;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
};

export async function getHomeHero(): Promise<HomeHeroSection | null> {
  const { data, error } = await supabase
    .from("page_sections")
    .select("title, body, cta_label, cta_url")
    .eq("key", "home_hero")
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("getHomeHero error:", error.message);
    return null;
  }

  return data ?? null;
}
