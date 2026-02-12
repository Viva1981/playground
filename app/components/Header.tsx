// app/components/Header.tsx
import { getHomeSection } from "@/app/lib/getHomeSection";
import HeaderClient from "./HeaderClient";
import type { HeaderSettings } from "@/app/lib/types";

export default async function Header() {
  const data = await getHomeSection("global_header");
  
  // Típus kényszerítés, mert a getHomeSection generic
  const settings = (data?.settings as HeaderSettings) || null;
  
  // Logo URL összeállítása
  let logoUrl = null;
  if (data?.media_paths && data.media_paths.length > 0) {
      logoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${data.media_paths[0]}`;
  } else {
      // Fallback logo, ha nincs feltöltve semmi (pl. a public mappából)
      // Ha szeretnéd, hogy üres legyen, akkor null.
      logoUrl = "/logo.jpg"; 
  }

  return <HeaderClient settings={settings} logoUrl={logoUrl} />;
}