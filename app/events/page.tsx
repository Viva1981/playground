// app/events/page.tsx
import { getUpcomingEvents } from "@/app/lib/getUpcomingEvents";
import Link from "next/link";
import Image from "next/image";

// Frissítés kényszerítése (hogy mindig lássuk az új eventeket)
export const dynamic = "force-dynamic";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      
      {/* FEJLÉC (Egyszerű, fix) */}
      <div className="bg-white border-b py-16 md:py-24 mb-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Miskolci Gasztro Események</h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Böngészd át partnereink következő eseményeit, és foglalj asztalt időben!
          </p>
        </div>
      </div>

      {/* LISTA */}
      <div className="container mx-auto px-6">
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* KÉP */}
                <div className="relative aspect-video bg-neutral-200">
                  {event.cover_path ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${event.cover_path}`}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                </div>

                {/* INFO */}
                <div className="p-6 flex-1 flex flex-col">
                   <div className="flex justify-between items-start mb-3">
                        {event.restaurants && (
                            <span className="text-xs font-bold text-black bg-neutral-100 px-2 py-1 rounded">
                                {event.restaurants.name}
                            </span>
                        )}
                        <span className="text-xs font-medium text-neutral-500">
                            {formatDate(event.starts_at)}
                        </span>
                   </div>
                  
                  <h2 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h2>
                  
                  {event.summary && (
                    <p className="text-neutral-600 text-sm line-clamp-3 mb-4 flex-1">
                      {event.summary}
                    </p>
                  )}

                  <div className="mt-auto pt-4 border-t border-neutral-100 text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center">
                    Részletek megtekintése &rarr;
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-neutral-300">
            <p className="text-xl text-neutral-500">Jelenleg nincs meghirdetett esemény.</p>
            <p className="text-sm text-neutral-400 mt-2">Nézz vissza később!</p>
          </div>
        )}
      </div>
    </main>
  );
}