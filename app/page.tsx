import HomeHero from "@/app/components/HomeHero";
import { getHomeHero } from "@/app/lib/getHomeHero";

export default async function HomePage() {
  const hero = await getHomeHero();

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
    </main>
  );
}
