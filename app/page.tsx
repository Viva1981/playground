import HomeHero from "@/app/components/HomeHero";
import HomeAbout from "@/app/components/HomeAbout";
import HomeEvents from "@/app/components/HomeEvents";

import { getHomeHero } from "@/app/lib/getHomeHero";
import { getHomeSection } from "@/app/lib/getHomeSection";
import { getUpcomingEvents } from "@/app/lib/getUpcomingEvents";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const hero = await getHomeHero();
  const about = await getHomeSection("home_about");
  const events = await getUpcomingEvents(6);

  return (
    <main>
      {hero ? (
        <HomeHero
          title={hero.title}
          body={hero.body}
          ctaLabel={hero.cta_label}
          ctaUrl={hero.cta_url}
          ctaLabel2={hero.cta_label_2}
          ctaUrl2={hero.cta_url_2}
          // Új propok átadása a komponensnek
          mediaPaths={hero.media_paths}
          settings={hero.settings}
        />
      ) : null}

      {about ? <HomeAbout title={about.title} body={about.body} /> : null}

      <HomeEvents events={events} />
    </main>
  );
}