"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

type GalleryImage = {
  path: string;
  url: string;
};

type Props = {
  images: GalleryImage[];
  restaurantName: string;
};

export default function RestaurantGalleryClient({ images, restaurantName }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const isOpen = activeIndex !== null;

  function openAt(index: number) {
    setActiveIndex(index);
  }

  const close = useCallback(() => {
    setActiveIndex(null);
    setTouchStartX(null);
  }, []);

  const prev = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return (current - 1 + images.length) % images.length;
    });
  }, [images.length]);

  const next = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return (current + 1) % images.length;
    });
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, close, prev, next]);

  return (
    <section className="mt-10">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-neutral-900">Galeria</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[120px] md:auto-rows-[150px] gap-3">
        {images.map((img, idx) => (
          <button
            key={img.path}
            type="button"
            onClick={() => openAt(idx)}
            className={`group relative overflow-hidden rounded-xl border bg-neutral-100 text-left ${
              idx === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1"
            }`}
            aria-label={`Galeria kep megnyitasa ${idx + 1}`}
          >
            <Image
              src={img.url}
              alt={`${restaurantName} - galeria ${idx + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>

      {isOpen && activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 p-3 md:p-6"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Galeria nezet"
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/15 text-white text-xl hover:bg-white/25"
            aria-label="Bezaras"
          >
            ×
          </button>

          <div className="relative h-full w-full flex items-center justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-2 md:left-6 z-10 h-10 w-10 rounded-full bg-white/15 text-white text-xl hover:bg-white/25"
              aria-label="Elozo kep"
            >
              ‹
            </button>

            <div
              className="relative h-[70vh] md:h-[80vh] w-full max-w-6xl"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => setTouchStartX(e.touches[0]?.clientX ?? null)}
              onTouchEnd={(e) => {
                if (touchStartX === null) return;
                const endX = e.changedTouches[0]?.clientX ?? touchStartX;
                const diff = endX - touchStartX;
                if (Math.abs(diff) > 50) {
                  if (diff > 0) prev();
                  else next();
                }
                setTouchStartX(null);
              }}
            >
              <Image
                src={images[activeIndex].url}
                alt={`${restaurantName} - galeria ${activeIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-2 md:right-6 z-10 h-10 w-10 rounded-full bg-white/15 text-white text-xl hover:bg-white/25"
              aria-label="Kovetkezo kep"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
