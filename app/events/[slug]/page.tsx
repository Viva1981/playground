import { supabase } from "@/app/utils/supabaseClient";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { ReactNode } from "react";

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

function renderBodyWithGalleryShortcodes(
  bodyHtml: string,
  galleryUrls: Array<{ path: string; url: string }>,
  title: string
) {
  const tokenRegex = /\[galeria-(\d+)\]/gi;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;
  let key = 0;

  while ((match = tokenRegex.exec(bodyHtml)) !== null) {
    const tokenStart = match.index;
    const tokenEnd = tokenRegex.lastIndex;
    const rawIndex = Number(match[1]);
    const galleryIndex = rawIndex - 1;

    const htmlPart = bodyHtml.slice(lastIndex, tokenStart);
    if (htmlPart.trim()) {
      nodes.push(<RichText key={`body-${key++}`} html={htmlPart} />);
    }

    const img = galleryUrls[galleryIndex];
    if (img) {
      nodes.push(
        <figure
          key={`gallery-inline-${img.path}-${key++}`}
          className="my-8 w-full overflow-hidden rounded-2xl border bg-neutral-100"
        >
          <div className="relative aspect-[2/1] w-full">
            <Image
              src={img.url}
              alt={`${title} - galeria ${rawIndex}`}
              fill
              className="object-cover"
            />
          </div>
        </figure>
      );
    }

    lastIndex = tokenEnd;
  }

  const tail = bodyHtml.slice(lastIndex);
  if (tail.trim()) {
    nodes.push(<RichText key={`body-tail-${key++}`} html={tail} />);
  }

  return nodes.length > 0 ? nodes : <RichText html={bodyHtml} />;
}

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
        .slice(0, 25)
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

        {event.body && renderBodyWithGalleryShortcodes(event.body, galleryUrls, event.title)}

        {galleryUrls.length > 0 && (
          <RestaurantGalleryClient
            images={galleryUrls}
            restaurantName={event.title}
            featuredIndexes={[0, 11, 24]}
          />
        )}
      </div>
    </main>
  );
}
