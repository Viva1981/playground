type EventListItem = {
  id: string;
  title: string;
  slug: string;
  starts_at: string;
  summary: string | null;
  cover_path: string | null; // Ezt hozzáadtam
};

function formatHuDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("hu-HU", {
    year: "numeric",
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
      <div className="mx-auto max-w-4xl">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Események
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Közelgő programok.
            </p>
          </div>

          <a className="text-sm underline underline-offset-4" href="/events">
            Összes
          </a>
        </div>

        <div className="mt-8 grid gap-4">
          {events.map((e) => (
            <a
              key={e.id}
              href={`/events/${e.slug}`}
              className="rounded-2xl border p-5 hover:bg-neutral-50 transition"
            >
              {/* Kép beillesztve ide: */}
              {e.cover_path ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${e.cover_path}`}
                  alt={e.title}
                  className="mb-3 rounded-lg object-cover w-full h-[200px]"
                />
              ) : null}

              <div className="text-sm text-neutral-600">
                {formatHuDate(e.starts_at)}
              </div>
              <div className="mt-1 text-lg font-semibold">{e.title}</div>
              {e.summary ? (
                <div className="mt-2 text-sm text-neutral-700 max-w-2xl">
                  {e.summary}
                </div>
              ) : null}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}