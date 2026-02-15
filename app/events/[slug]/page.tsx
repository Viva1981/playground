import { supabase } from "@/app/utils/supabaseClient";
import { notFound } from "next/navigation";
import Image from "next/image";

import RichText from "@/components/RichText";
import RestaurantGalleryClient from "@/app/components/RestaurantGalleryClient";
import { formatEventDateLabel } from "@/app/lib/formatEventDateLabel";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

type EventRow = {
  title: string;
  starts_at: string | null;
  schedule_type?: "datetime" | "date_range" | "undated" | null;
  starts_on?: string | null;
  ends_on?: string | null;
  date_label?: string | null;
  body: string | null;
  cover_path: string | null;
  gallery_paths: string[] | null;
};

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data: event } = await supabase
    .from("events")
    .select("title, starts_at, schedule_type, starts_on, ends_on, date_label, body, cover_path, gallery_paths")
    .eq("slug", decodedSlug)
    .eq("is_published", true)
    .single<EventRow>();

  if (!event) notFound();

  const coverUrl = event.cover_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${event.cover_path}`
    : null;

  const galleryUrls = Array.isArray(event.gallery_paths)
    ? event.gallery_paths
        .filter((imgPath): imgPath is string => Boolean(imgPath))
        .slice(0, 10)
        .map((imgPath) => ({
          path: imgPath,
          url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${imgPath}`,
        }))
    : [];

  return (
    <main className="min-h-screen pb-20 bg-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">{event.title}</h1>

        <div className="text-neutral-600 mb-8">{formatEventDateLabel(event)}</div>

        {coverUrl && (
          <div className="mb-10 w-full aspect-[2/1] bg-white relative">
            <Image src={coverUrl} alt={event.title} fill className="object-contain bg-white" />
          </div>
        )}

        {event.body && <RichText html={event.body} />}

        {galleryUrls.length > 0 && (
          <RestaurantGalleryClient images={galleryUrls} restaurantName={event.title} />
        )}
      </div>
    </main>
  );
}
