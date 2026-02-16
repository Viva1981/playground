"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

type RestaurantItem = {
  id: string;
  name: string;
  slug: string;
  cover_path: string | null;
};

type Props = {
  items: RestaurantItem[];
};

const getStorageUrl = (path: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${path}`;
};

export default function HomeRestaurantCarousel({ items }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length <= 1) return;

    const getStep = () => {
      const first = track.firstElementChild as HTMLElement | null;
      return first ? first.offsetWidth + 16 : 280;
    };

    const tick = () => {
      if (!track) return;
      const step = getStep();
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft + step >= maxScroll - 4) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: step, behavior: "smooth" });
      }
    };

    const interval = window.setInterval(tick, 3500);
    return () => window.clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="mt-10">
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
      >
        {items.map((place) => (
          <Link
            key={place.id}
            href={`/restaurants/${place.slug}`}
            className="group relative h-48 w-[70vw] max-w-[320px] shrink-0 overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:h-56 sm:w-[320px] md:h-60 md:w-[360px]"
          >
            {place.cover_path ? (
              <Image
                src={getStorageUrl(place.cover_path)}
                alt={place.name}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400">
                Nincs kép
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="text-base font-semibold text-white drop-shadow-sm md:text-lg">
                {place.name}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
