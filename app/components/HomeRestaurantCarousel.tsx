"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

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
  const duplicated = useMemo(() => [...items, ...items], [items]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length <= 1) return;

    let rafId = 0;
    let lastTime = 0;
    const speed = 22; // px per second
    let running = false;

    const loop = (time: number) => {
      if (!track) return;
      if (!lastTime) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;

      const half = track.scrollWidth / 2;
      track.scrollLeft += (speed * delta) / 1000;
      if (track.scrollLeft >= half) {
        track.scrollLeft -= half;
      }

      rafId = window.requestAnimationFrame(loop);
    };

    const start = () => {
      if (!track) return;
      if (track.scrollWidth <= track.clientWidth + 10) {
        if (running) {
          window.cancelAnimationFrame(rafId);
          running = false;
        }
        return;
      }
      if (!running) {
        running = true;
        lastTime = 0;
        rafId = window.requestAnimationFrame(loop);
      }
    };

    const resizeObserver = new ResizeObserver(start);
    resizeObserver.observe(track);
    start();

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="mt-10">
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar"
      >
        {duplicated.map((place, index) => (
          <Link
            key={`${place.id}-${index}`}
            href={`/restaurants/${place.slug}`}
            className="group relative w-[70vw] max-w-[320px] shrink-0 overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-[320px] md:max-w-[360px] snap-start"
          >
            <div className="relative w-full aspect-[2/1] overflow-hidden">
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
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
