import { supabase } from "@/app/utils/supabaseClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: event } = await supabase
    .from("events")
    .select("title, summary, cover_path")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!event) return { title: "Esemény nem található" };

  return {
    title: `${event.title} | Vis Eat Miskolc`,
    description: event.summary,
    openGraph: event.cover_path
      ? {
          images: [
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${event.cover_path}`,
          ],
        }
      : undefined,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  // ITT a módosítás: lekérjük a restaurants táblát is
  const { data: event } = await supabase
    .from("events")
    .select("*, restaurants(name, slug, cover_path, address)") 
    .eq("slug", decodedSlug)
    .eq("is_published", true)
    .single();

  if (!event) notFound();

  // TypeScript castolás a biztonság kedvéért, ha szükséges
  const restaurant = event.restaurants as any;

  const coverUrl = event.cover_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${event.cover_path}`
    : null;

  return (
    <main className="min-h-screen pb-20 bg-white">
      {/* Vissza gomb sáv */}
      <div className="border-b">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <a
            href="/#events"
            className="text-sm font-medium text-neutral-600 hover:text-black"
          >
            ← Vissza az eseményekhez
          </a>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-6 py-10">
        
        {/* ÉTTEREM INFO (Ha van) */}
        {restaurant && (
          <div className="mb-6 flex items-center gap-3">
            {/* Ha lenne logója, ide tehetnénk, most csak a név */}
            <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
              Szervező: {restaurant.name}
            </div>
            {restaurant.address && (
              <span className="text-sm text-neutral-500">📍 {restaurant.address}</span>
            )}
          </div>
        )}

        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-black mb-4 leading-tight">
          {event.title}
        </h1>

        <div className="mb-8 flex items-center gap-2 text-lg text-neutral-600 font-medium">
          📅 {formatHuDate(event.starts_at)}
        </div>

        {coverUrl && (
          <div className="mb-10 overflow-hidden rounded-2xl border bg-neutral-100 shadow-sm">
            <img
              src={coverUrl}
              alt={event.title}
              className="w-full object-cover max-h-[500px]"
            />
          </div>
        )}

        <div className="prose prose-neutral prose-lg max-w-none text-neutral-800">
          <p className="whitespace-pre-wrap">{event.summary}</p>
        </div>

        {/* Call to action az étterem oldalára (majd ha kész lesz a profil oldal) */}
        {restaurant && (
          <div className="mt-12 border-t pt-8">
            <div className="rounded-2xl bg-neutral-50 p-6 border">
              <h3 className="font-bold text-lg mb-2">Tudj meg többet a szervezőről</h3>
              <p className="text-neutral-600 mb-4">
                Ez az esemény a(z) <strong>{restaurant.name}</strong> szervezésében valósul meg.
                Nézd meg az étlapot és a többi programjukat!
              </p>
              {/* Később ide jön a Link: /restaurants/${restaurant.slug} */}
              <button disabled className="bg-black text-white px-5 py-2 rounded-lg opacity-50 cursor-not-allowed">
                Étterem adatlapja (Hamarosan)
              </button>
            </div>
          </div>
        )}
      </article>
    </main>
  );
}