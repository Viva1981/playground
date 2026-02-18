// app/lib/getHomeHero.ts
import { createClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";
// IMPORTÁLJUK a közös típust!
import type { HeroSettings } from "./types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type HomeHeroData = {
  title: string | null;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
  cta_label_2: string | null;
  cta_url_2: string | null;
  media_paths: string[] | null;
  settings: HeroSettings | null; // Itt már a szigorú típust használjuk
};

export async function getHomeHero(): Promise<HomeHeroData | null> {
  noStore();
  
  const { data } = await supabase
    .from("page_sections")
    .select("*")
    .eq("key", "home_hero")
    .eq("is_active", true)
    .single();

  if (!data) return null;

  return {
    title: data.title,
    body: data.body,
    cta_label: data.cta_label,
    cta_url: data.cta_url,
    cta_label_2: data.cta_label_2,
    cta_url_2: data.cta_url_2,
    media_paths: data.media_paths,
    // Kényszerítjük a típust, mert a DB-ből JSONB (any) jön
    settings: (data.settings as unknown as HeroSettings) || null
  };
}
