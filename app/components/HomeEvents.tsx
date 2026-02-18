import SafeHtml from "./common/SafeHtml";
import Image from "next/image";
import Link from "next/link";

import RichText from "@/components/RichText";
import { getUpcomingEvents } from "@/app/lib/getUpcomingEvents";
import { formatEventDateLabel } from "@/app/lib/formatEventDateLabel";
import { getHomeSection } from "@/app/lib/getHomeSection";
import type { EventsSectionSettings } from "@/app/lib/types";
import { supabase } from "@/app/utils/supabaseClient";
import HomeRestaurantCarousel from "@/app/components/HomeRestaurantCarousel";

export default async function HomeEvents() {
  const [sectionData, events, restaurantsResult] = await Promise.all([
    getHomeSection("home_events"),
    getUpcomingEvents(),
    supabase
      .from("restaurants")
      .select("id, name, slug, cover_path")
      .eq("is_active", true)
      .order("name"),
  ]);
  const restaurants = restaurantsResult.data ?? [];
  if (!sectionData) return null;

  const title = sectionData.title || "Esemenyek";
  const body = sectionData.body || "A Vis Eat Miskolc partnereinek programjai.";
  const settings = (sectionData.settings as EventsSectionSettings) || {};

  const bgColor = settings.background_color || "#ffffff";
  const contentColor = settings.content_color || "#000000";

  const sortedEvents = [...events].sort((a, b) => {
    const aFeatured = a.is_featured ? 1 : 0;
    const bFeatured = b.is_featured ? 1 : 0;
    if (aFeatured !== bFeatured) return bFeatured - aFeatured;

    const aRank = a.featured_rank ?? Number.MAX_SAFE_INTEGER;
    const bRank = b.featured_rank ?? Number.MAX_SAFE_INTEGER;
    if (aRank !== bRank) return aRank - bRank;

    const aTime = a.starts_at ? new Date(a.starts_at).getTime() : 0;
    const bTime = b.starts_at ? new Date(b.starts_at).getTime() : 0;
    return bTime - aTime;
  });

  const featuredEvent = sortedEvents.find((e) => e.is_featured) ?? null;
  const reportEvents = sortedEvents
    .filter((e) => e.event_type === "report" && e.id !== featuredEvent?.id)
    .slice(0, 2);
  const excludedIds = new Set<string>([
    ...(featuredEvent ? [featuredEvent.id] : []),
    ...reportEvents.map((e) => e.id),
  ]);
  const regularEvents = sortedEvents.filter((e) => !excludedIds.has(e.id));

  const typeLabel = (type: string | null | undefined) => {
    if (type === "report") return "Beszámoló";
    if (type === "news") return "Hír";
    return "Program";
  };

  const shouldShowDate = (event: (typeof sortedEvents)[number]) => {
    return formatEventDateLabel(event).toLowerCase() !== "idopont hamarosan";
  };
  const getDateLabel = (event: (typeof sortedEvents)[number]) => {
    return shouldShowDate(event) ? formatEventDateLabel(event) : null;
  };

  return (
    <section className="py-10 md:py-14" style={{ backgroundColor: bgColor, color: contentColor }}>
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <SafeHtml
            html={title}
            tag="h2"
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: contentColor }}
          />
          <RichText html={body} className="text-lg opacity-80" style={{ color: contentColor }} />
        </div>

        {events.length > 0 ? (
          <div className="space-y-10">
            {featuredEvent && (
              <Link
                href={`/events/${featuredEvent.slug}`}
                className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`grid grid-cols-1 ${featuredEvent.cover_path ? "md:grid-cols-2" : ""}`}>
                  {featuredEvent.cover_path && (
                    <div className="relative w-full aspect-[2/1] bg-neutral-100">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${featuredEvent.cover_path}`}
                        alt={featuredEvent.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold bg-black text-white px-2.5 py-1 rounded-full">
                          Kiemelt
                        </span>
                        <span className="text-xs font-medium text-neutral-500">
                          {getDateLabel(featuredEvent)}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3">
                        {featuredEvent.title}
                      </h3>
                      {featuredEvent.summary && (
                        <p className="text-neutral-600 line-clamp-3">{featuredEvent.summary}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {reportEvents.length > 0 && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reportEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.slug}`}
                      className="group block rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      {event.cover_path && (
                        <div className="relative aspect-[2/1] bg-neutral-100">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${event.cover_path}`}
                            alt={event.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full">
                            Beszámoló
                          </span>
                          <span className="text-xs text-neutral-500">{getDateLabel(event)}</span>
                        </div>
                        <h4 className="text-lg font-bold text-neutral-900 mb-2">{event.title}</h4>
                        {event.summary && (
                          <p className="text-sm text-neutral-600 line-clamp-2">{event.summary}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {regularEvents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}`}
                    className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-neutral-100"
                  >
                    {event.cover_path && (
                      <div className="relative aspect-[2/1] overflow-hidden bg-neutral-100">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${event.cover_path}`}
                          alt={event.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3 gap-3">
                        <div className="flex gap-2 items-center min-h-[24px]">
                          {event.restaurants ? (
                            <span className="text-xs font-bold text-black bg-neutral-100 px-2 py-1 rounded">
                              {event.restaurants.name}
                            </span>
                          ) : null}
                          <span className="text-xs font-medium text-neutral-600 bg-neutral-50 px-2 py-1 rounded">
                            {typeLabel(event.event_type)}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-neutral-500 whitespace-nowrap">
                          {getDateLabel(event)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-neutral-700 transition-colors">
                        {event.title}
                      </h3>
                      {event.summary && <p className="text-neutral-600 text-sm line-clamp-2">{event.summary}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 opacity-60">
            <p>Jelenleg nincsenek kozzetett esemenyek.</p>
          </div>
        )}

        <HomeRestaurantCarousel items={restaurants} />
      </div>
    </section>
  );
}
