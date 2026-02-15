import SafeHtml from "./common/SafeHtml";
import Image from "next/image";
import Link from "next/link";

import RichText from "@/components/RichText";
import { getUpcomingEvents } from "@/app/lib/getUpcomingEvents";
import { formatEventDateLabel } from "@/app/lib/formatEventDateLabel";
import { getHomeSection } from "@/app/lib/getHomeSection";
import type { EventsSectionSettings } from "@/app/lib/types";

export default async function HomeEvents() {
  const [sectionData, events] = await Promise.all([
    getHomeSection("home_events"),
    getUpcomingEvents(),
  ]);

  const title = sectionData?.title || "Esemenyek";
  const body = sectionData?.body || "A Vis Eat Miskolc partnereinek programjai.";
  const settings = (sectionData?.settings as EventsSectionSettings) || {};

  const bgColor = settings.background_color || "#ffffff";
  const contentColor = settings.content_color || "#000000";

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-neutral-100"
              >
                <div className="relative aspect-[2/1] overflow-hidden bg-neutral-100">
                  {event.cover_path ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${event.cover_path}`}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-400">Nincs kep</div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    {event.restaurants ? (
                      <span className="text-xs font-bold text-black bg-neutral-100 px-2 py-1 rounded">
                        {event.restaurants.name}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs font-medium text-neutral-500">
                      {formatEventDateLabel(event)}
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
        ) : (
          <div className="text-center py-12 opacity-60">
            <p>Jelenleg nincsenek kozzetett esemenyek.</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/events"
            className="inline-block border-2 px-8 py-3 rounded-full font-semibold transition hover:opacity-70"
            style={{ borderColor: contentColor, color: contentColor }}
          >
            Osszes esemeny megtekintese
          </Link>
        </div>
      </div>
    </section>
  );
}
