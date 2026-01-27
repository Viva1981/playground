import HomeHero from "@/app/components/HomeHero";
import { getHomeHero } from "@/app/lib/getHomeHero";

export const dynamic = "force-dynamic";

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
      ) : (
        <div className="p-12 text-sm text-neutral-500">
          Hero szekció nem aktív vagy nem létezik.
        </div>
      )}
    </main>
  );
}
