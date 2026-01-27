import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      fetch: (url, options) =>
        fetch(url, { ...options, cache: "no-store" }),
    },
  }
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

  if (error || !data) return null;

  return data;
}
