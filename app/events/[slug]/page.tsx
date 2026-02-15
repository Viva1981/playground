import { supabase } from "@/app/utils/supabaseClient";
import { notFound } from "next/navigation";
import Image from "next/image";

import RichText from "@/components/RichText";

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

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!event) notFound();

  const coverUrl = event.cover_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${event.cover_path}`
    : null;

  return (
    <main className="min-h-screen pb-20 bg-white">
      <div className="mx-auto max-w-4xl px-6 py-12">

        {/* CÍM */}
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          {event.title}
        </h1>

        {/* DÁTUM */}
        <div className="text-neutral-600 mb-8">
          📅 {formatHuDate(event.starts_at)}
        </div>

        {coverUrl && (
  <div className="mb-10 w-full aspect-[2/1] bg-white relative">
    <Image
      src={coverUrl}
      alt={event.title}
      fill
      className="object-contain bg-white"
    />
  </div>
)}

        {/* LEÍRÁS */}
        {event.body && <RichText html={event.body} />}

        {/* GALÉRIA */}
        {event.gallery_paths && event.gallery_paths.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Galéria</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {event.gallery_paths.map((imgPath: string) => (
                <div
                  key={imgPath}
                  className="relative aspect-square rounded-xl overflow-hidden border bg-neutral-100"
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${imgPath}`}
                    alt="Esemény galéria kép"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
