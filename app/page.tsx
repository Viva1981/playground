// app/page.tsx
import HomeHero from "@/app/components/HomeHero";
import HomeAbout from "@/app/components/HomeAbout";
import HomeEvents from "@/app/components/HomeEvents"; 
import HomeComingSoonFooterClient from "@/app/components/HomeComingSoonFooterClient";
import { getHomeHero, getHomeHeroMetadataData } from "@/app/lib/getHomeHero";
import { getHomeSection } from "@/app/lib/getHomeSection";
import type { AboutSettings, FooterSettings } from "@/app/lib/types";
import type { Metadata } from "next";

// Fontos: mivel adatbázisból dolgozunk, ne cache-eljen agresszívan
export const dynamic = "force-dynamic";

function stripHtml(input: string | null | undefined): string {
  if (!input) return "";
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function buildSeoImageUrl(seoImage: string | null | undefined, fallbackMediaPath: string | null | undefined): string | null {
  const value = seoImage?.trim() || fallbackMediaPath?.trim() || "";
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${value}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const heroMeta = await getHomeHeroMetadataData();
  const settings = heroMeta?.settings;

  const title = settings?.seo_title?.trim() || "Vis Eat Miskolc";
  const description =
    settings?.seo_description?.trim() ||
    stripHtml(heroMeta?.body) ||
    "Fedezd fel Miskolc éttermeit és eseményeit a Vis Eat Miskolc oldalán.";
  const image = buildSeoImageUrl(settings?.seo_image, heroMeta?.media_paths?.[0]);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
      type: "website",
      locale: "hu_HU",
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function Home() {
  // Párhuzamos adatlekérés
  // FIGYELEM: Az eseményeket (getUpcomingEvents) INNEN KIVETTÜK,
  // mert a <HomeEvents /> komponens már intézi magának belül!
  const [hero, about, footer] = await Promise.all([
    getHomeHero(),
    getHomeSection("home_about"),
    getHomeSection("home_footer"),
  ]);

  return (
    <main>
      {/* HERO SZEKCIÓ */}
      {hero ? (
        <HomeHero
          title={hero.title ?? null}
          body={hero.body ?? null}
          ctaLabel={hero.cta_label ?? null}
          ctaUrl={hero.cta_url ?? null}
          ctaLabel2={hero.cta_label_2 ?? null}
          ctaUrl2={hero.cta_url_2 ?? null}
          mediaPaths={hero.media_paths ?? []}
          settings={hero.settings}
        />
      ) : null}

      {/* ABOUT SZEKCIÓ */}
      {about ? (
        <HomeAbout
          title={about.title}
          body={about.body}
          // Típus kényszerítés, ha szükséges, de a types.ts közösítése miatt jónak kell lennie
          settings={about.settings as AboutSettings}
        />
      ) : null}

      {/* EVENTS SZEKCIÓ - JAVÍTVA: Nincs prop átadás! */}
      <HomeEvents />

      {/* FOOTER / COMING SOON SZEKCIÓ */}
      {footer ? (
        <HomeComingSoonFooterClient
          title={footer.title || "COMING SOON"}
          subtitle={footer.body || "A miskolci vendéglátók közös ügye."}
          animationIntervalMs={(footer.settings as FooterSettings | null)?.animation_interval_ms ?? 80}
        />
      ) : null}
      
    </main>
  );
}
