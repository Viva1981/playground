// app/lib/getRolunkSection.ts
import { createClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";
import type { RolunkSettings } from "./types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type RolunkData = {
  title: string | null;
  body: string | null;
  settings: RolunkSettings | null;
};

export async function getRolunkSection(): Promise<RolunkData | null> {
  noStore();

  const { data } = await supabase
    .from("page_sections")
    .select("title, body, settings")
    .eq("key", "global_rolunk")
    .eq("is_active", true)
    .single();

  if (!data) return null;

  return {
    title: data.title,
    body: data.body,
    settings: (data.settings as unknown as RolunkSettings) || null,
  };
}
