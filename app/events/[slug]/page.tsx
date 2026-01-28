import { supabase } from "@/app/utils/supabaseClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

// 1. Típus frissítése: A params most már Promise!
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
  // ITT IS várni kell a params-ra!
  const { slug } = await params;
  
  const { data: event } = await supabase
    .from("events")
    .select("title, summary, cover_path")
    .eq("slug", slug)
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

export default async function EventDetailPage({ params }: Props) {
  // 2. KRITIKUS SOR: Itt bontjuk ki a slugot await-tel
  const { slug } = await params;

  // Debuggolás: Nézzük meg a logokban, mit keresünk (opcionális, de hasznos)
  console.log("Keresett slug:", slug);

  // Az URL-ben lehetnek kódolt karakterek (pl. térnyitó -> t%C3%A9rnyit%C3%B3), dekódoljuk:
  const decodedSlug = decodeURIComponent(slug);

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", decodedSlug)
    .eq("is_published", true)
    .single();

  if (error) {
    console.error("Supabase hiba:", error.message);
  }

  if (!event) {
    console.log("Nincs találat erre a slugra:", decodedSlug);
    notFound();
  }

  const coverUrl = event.cover_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${event.cover_path}`
    : null;

  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-4xl px-6 py-6">
        <a
          href="/#events"
          className="inline-flex items-center text-sm font-medium text-neutral-600 hover:text-black hover:underline underline-offset-4 transition-colors"
        >
          ← Vissza az eseményekhez
        </a>
      </div>

      <article className="mx-auto max-w-3xl px-6">
        {coverUrl ? (
          <div className="mb-8 overflow-hidden rounded-2xl border bg-neutral-100">
            <img
              src={coverUrl}
              alt={event.title}
              className="w-full object-cover"
              style={{ maxHeight: "500px" }}
            />
          </div>
        ) : null}

        <header className="mb-8">
          <div className="mb-3 text-sm font-medium text-neutral-500 uppercase tracking-wide">
            {formatHuDate(event.starts_at)}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-black leading-tight">
            {event.title}
          </h1>
        </header>

        <div className="prose prose-neutral prose-lg max-w-none text-neutral-800">
          <p className="whitespace-pre-wrap">{event.summary}</p>
        </div>
      </article>
    </main>
  );
}