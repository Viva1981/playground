import { createClient } from "@supabase/supabase-js";

// Cache tiltása a szerver komponenseknél
import { unstable_noStore as noStore } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type HomeHeroData = {
  title: string | null;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
  // ÚJ MEZŐK:
  cta_label_2: string | null;
  cta_url_2: string | null;
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