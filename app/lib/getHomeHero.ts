// app/lib/getHomeHero.ts

import { createClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type HeroComponentType = 'title' | 'body' | 'buttons';

export type HeroSettings = {
  layout: 'overlay' | 'stack';
  align: string;
  overlay_opacity: number;
  components_order?: HeroComponentType[];
  // ÚJ SZÍN BEÁLLÍTÁSOK:
  content_color?: string;      // Szöveg és gombok színe (pl. #e43c65)
  background_color?: string;   // Háttérszín (csak Stack nézethez)
};


export type HomeHeroData = {
  title: string | null;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
  cta_label_2: string | null;
  cta_url_2: string | null;
  media_paths: string[] | null;
  settings: HeroSettings | null;
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