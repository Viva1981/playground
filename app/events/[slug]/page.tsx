import { supabase } from "@/app/utils/supabaseClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Force-dynamic, hogy mindig friss adatot mutasson (Supabase cache elkerülése)
export const dynamic = "force-dynamic";

type Props = {
  params: { slug: string };
};

// Segédfüggvény dátumhoz
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

// 1. SEO Metadata generálás (Böngésző fül címe, megosztás kép)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: event } = await supabase
    .from("events")
    .select("title, summary, cover_path")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!event) {
    return { title: "Esemény nem található | Miskolci Soho" };
  }

  return {
    title: `${event.title} | Miskolci Soho`,
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

// 2. Maga az oldal komponens
export default async function EventDetailPage({ params }: Props) {
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!event) {
    notFound();
  }

  const coverUrl = event.cover_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${event.cover_path}`
    : null;

  return (
    <main className="min-h-screen pb-20">
      {/* Fejléc / Navigáció helye - egyelőre egy egyszerű Vissza gomb */}
      <div className="mx-auto max-w-4xl px-6 py-6">
        <a
          href="/#events"
          className="inline-flex items-center text-sm font-medium text-neutral-600 hover:text-black hover:underline underline-offset-4 transition-colors"
        >
          ← Vissza az eseményekhez
        </a>
      </div>

      <article className="mx-auto max-w-3xl px-6">
        {/* Borítókép */}
        {coverUrl ? (
          <div className="mb-8 overflow-hidden rounded-2xl border bg-neutral-100">
            {/* Standard img tag a Next/Image helyett, ahogy kérted a kontextusban */}
            <img
              src={coverUrl}
              alt={event.title}
              className="w-full object-cover"
              style={{ maxHeight: "500px" }}
            />
          </div>
        ) : null}

        {/* Címsor és Dátum */}
        <header className="mb-8">
          <div className="mb-3 text-sm font-medium text-neutral-500 uppercase tracking-wide">
            {formatHuDate(event.starts_at)}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-black leading-tight">
            {event.title}
          </h1>
        </header>

        {/* Tartalom */}
        <div className="prose prose-neutral prose-lg max-w-none text-neutral-800">
          {/* Mivel egyelőre csak summary mezőnk van, azt jelenítjük meg, 
              de sortörésekkel (whitespace-pre-wrap), ha vannak benne enter-ek */}
          <p className="whitespace-pre-wrap">{event.summary}</p>
          
          {/* Ide jöhet később a bővebb leírás (body), ha bővítjük az adatbázist */}
        </div>
      </article>
    </main>
  );
}