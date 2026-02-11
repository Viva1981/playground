import { createClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type AboutComponentType = 'title' | 'body';

export type AboutSettings = {
  content_color?: string;
  background_color?: string;
  components_order?: AboutComponentType[];
};

export type HomeSectionData = {
  title: string | null;
  body: string | null;
  settings: AboutSettings | null; // ÚJ MEZŐ
};

export async function getHomeSection(key: string): Promise<HomeSectionData | null> {
  noStore();
  
  const { data } = await supabase
    .from("page_sections")
    .select("title, body, settings") // settings hozzáadva
    .eq("key", key)
    .single();

  return data;
}