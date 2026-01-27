import HomeHero from "@/app/components/HomeHero";
import HomeAbout from "@/app/components/HomeAbout";
import { getHomeHero } from "@/app/lib/getHomeHero";
import { getHomeSection } from "@/app/lib/getHomeSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const hero = await getHomeHero();
  const about = await getHomeSection("home_about");

  return (
    <main>
      {hero ? (
        <HomeHero
          title={hero.title}
          body={hero.body}
          ctaLabel={hero.cta_label}
          ctaUrl={hero.cta_url}
        />
      ) : null}

      {about ? (
        <HomeAbout title={about.title} body={about.body} />
      ) : null}
    </main>
  );
}
