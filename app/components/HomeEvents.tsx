import { EventListItem } from "@/app/lib/getUpcomingEvents";
import Image from "next/image";

function formatHuDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("hu-HU", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HomeEvents({ events }: { events: EventListItem[] }) {
  if (!events?.length) return null;

  return (
    <section id="events" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Események</h2>
            <p className="mt-2 text-neutral-600">
              A Vis Eat Miskolc partnereinek programjai.
            </p>
          </div>
          <a className="text-sm underline underline-offset-4" href="/events">
            Összes
          </a>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <a
              key={e.id}
              href={`/events/${e.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border bg-white transition hover:shadow-lg"
            >
              {/* Kép konténer */}
              <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
                {e.cover_path ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${e.cover_path}`}
                    alt={e.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-neutral-400">
                    Nincs kép
                  </div>
                )}
                
                {/* Dátum badge a képen */}
                <div className="absolute top-3 left-3 rounded-lg bg-white/90 backdrop-blur px-3 py-1 text-sm font-bold shadow-sm">
                  {formatHuDate(e.starts_at)}
                </div>
              </div>

              {/* Tartalom */}
              <div className="flex flex-1 flex-col p-5">
                {/* ÉTTEREM NEVE (Ha van) */}
                {e.restaurants && (
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-600">
                    📍 {e.restaurants.name}
                  </div>
                )}
                
                <h3 className="text-xl font-bold leading-tight text-neutral-900 mb-2">
                  {e.title}
                </h3>
                
                {e.summary && (
                  <p className="text-sm text-neutral-600 line-clamp-2">
                    {e.summary}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}