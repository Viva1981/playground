import { NextResponse } from "next/server";
import { getHomeSection } from "@/app/lib/getHomeSection";
import type { HeaderSettings } from "@/app/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getHomeSection("global_header");
  const settings = (data?.settings as HeaderSettings) || null;
  const logoPath = data?.media_paths?.[0] || null;

  const logoUrl = logoPath
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${logoPath}`
    : "/logo.jpg";

  const response = NextResponse.redirect(logoUrl, 302);
  response.headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  if (settings?.site_title) {
    response.headers.set("X-Site-Title", settings.site_title);
  }
  return response;
}
