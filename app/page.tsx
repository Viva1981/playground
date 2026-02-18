// app/page.tsx
import HomeHero from "@/app/components/HomeHero";
import HomeAbout from "@/app/components/HomeAbout";
import HomeEvents from "@/app/components/HomeEvents"; 
import { getHomeHero } from "@/app/lib/getHomeHero";
import { getHomeSection } from "@/app/lib/getHomeSection";
import type { AboutSettings } from "@/app/lib/types";

// Fontos: mivel adatbázisból dolgozunk, ne cache-eljen agresszívan
export const dynamic = "force-dynamic";

export default async function Home() {
  // Párhuzamos adatlekérés
  // FIGYELEM: Az eseményeket (getUpcomingEvents) INNEN KIVETTÜK,
  // mert a <HomeEvents /> komponens már intézi magának belül!
  const [hero, about] = await Promise.all([
    getHomeHero(),
    getHomeSection("home_about"),
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
      
    </main>
  );
}
