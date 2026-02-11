import { createClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Ez a típus felel meg a DB-ben tárolt JSON settings szerkezetnek
export type HeroSettings = {
  layout: 'overlay' | 'stack';
  align: string;
  overlay_opacity: number;
};

export type HomeHeroData = {
  title: string | null;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
  cta_label_2: string | null;
  cta_url_2: string | null;
  // ÚJ MEZŐK:
  media_paths: string[] | null; // DB-ben media_paths, tömb
  settings: HeroSettings | null; // DB-ben settings, jsonb
};

export async function getHomeHero(): Promise<HomeHeroData | null> {
  noStore();
  
  const { data } = await supabase
    .from("page_sections")
    .select("*")
    .eq("key", "home_hero")
    .single();

  return data;
}