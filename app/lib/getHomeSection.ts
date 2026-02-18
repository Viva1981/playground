// app/lib/getHomeSection.ts
import { createClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";
// IMPORTÁLJUK a típusokat a types.ts-ből
import type { AboutSettings, HeaderSettings } from "./types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ITT TÖRÖLTÜK A HELYI AboutSettings és AboutComponentType definíciókat!

// Kibővített típus, hogy a settings bármelyik formátumot felvehesse
export type SectionSettings = AboutSettings | HeaderSettings | Record<string, any>;

export type HomeSectionData = {
  title: string | null;
  body: string | null;
  settings: SectionSettings | null;
  media_paths: string[] | null;
};

export async function getHomeSection(key: string): Promise<HomeSectionData | null> {
  noStore();
  
  const { data } = await supabase
    .from("page_sections")
    .select("title, body, settings, media_paths")
    .eq("key", key)
    .eq("is_active", true)
    .single();

  return data;
}
