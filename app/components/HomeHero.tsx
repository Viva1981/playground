"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Segédfüggvény a Supabase Storage URL generáláshoz
const getStorageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${path}`;
};

type HeroSettings = {
  layout: "overlay" | "stack";
  align: string;
  overlay_opacity: number;
};

type Props = {
  title: string | null;
  body: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  ctaLabel2?: string | null;
  ctaUrl2?: string | null;
  mediaPaths?: string[] | null; // Több kép
  settings?: HeroSettings | null; // Beállítások
};

export default function HomeHero({
  title,
  body,
  ctaLabel,
  ctaUrl,
  ctaLabel2,
  ctaUrl2,
  mediaPaths = [],
  settings,
}: Props) {
  // Alapértelmezett beállítások, ha nincs adat
  const layout = settings?.layout || "overlay";
  const align = settings?.align || "center-center";
  const opacity = settings?.overlay_opacity ?? 50;

  // Slideshow logika
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = mediaPaths && mediaPaths.length > 0 ? mediaPaths : [];

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000); // 5 másodperc
    return () => clearInterval(interval);
  }, [images.length]);

  // Pozicionálás feloldása Tailwind osztályokra
  const getAlignClasses = (alignStr: string) => {
    switch (alignStr) {
      case "top-left": return "justify-start items-start text-left";
      case "top-center": return "justify-start items-center text-center";
      case "top-right": return "justify-start items-end text-right";
      case "center-left": return "justify-center items-start text-left";
      case "center-center": return "justify-center items-center text-center";
      case "center-right": return "justify-center items-end text-right";
      case "bottom-left": return "justify-end items-start text-left";
      case "bottom-center": return "justify-end items-center text-center";
      case "bottom-right": return "justify-end items-end text-right";
      default: return "justify-center items-center text-center";
    }
  };

  // Tartalom renderelése (hogy ne duplikáljuk a kódot)
  const Content = ({ isOverlay }: { isOverlay: boolean }) => (
    <div className={`max-w-4xl relative z-10 p-6 ${isOverlay ? 'text-white' : 'text-neutral-900'}`}>
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-sm">
        {title}
      </h1>
      {body && (
        <p className={`mt-6 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed ${isOverlay ? 'text-neutral-100' : 'text-neutral-600'}`}>
          {body}
        </p>
      )}
      <div className={`mt-10 flex flex-wrap gap-4 ${align.includes('center') ? 'justify-center' : align.includes('right') ? 'justify-end' : 'justify-start'}`}>
        {ctaLabel && ctaUrl && (
          <a
            href={ctaUrl}
            className={`rounded-full px-8 py-3 text-sm font-semibold transition ${
              isOverlay 
              ? "bg-white text-black hover:bg-neutral-200" 
              : "bg-black text-white hover:bg-neutral-800"
            }`}
          >
            {ctaLabel}
          </a>
        )}
        {ctaLabel2 && ctaUrl2 && (
          <a
            href={ctaUrl2}
            className={`rounded-full border px-8 py-3 text-sm font-semibold transition ${
              isOverlay
              ? "border-white text-white hover:bg-white hover:text-black"
              : "border-neutral-300 bg-white text-black hover:bg-neutral-50 hover:border-black"
            }`}
          >
            {ctaLabel2}
          </a>
        )}
      </div>
    </div>
  );

  // --- LAYOUT: OVERLAY (Kép háttérben, szöveg rajta) ---
  if (layout === "overlay") {
    return (
      <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden bg-black">
        {/* Háttérképek / Slideshow */}
        {images.length > 0 ? (
          images.map((path, idx) => (
            <div
              key={path}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={getStorageUrl(path)}
                alt="Hero background"
                fill
                className="object-cover"
                priority={idx === 0}
              />
            </div>
          ))
        ) : (
            // Fallback ha nincs kép: szürke háttér
            <div className="absolute inset-0 bg-neutral-900" />
        )}

        {/* Sötétítő réteg */}
        <div 
            className="absolute inset-0 bg-black pointer-events-none" 
            style={{ opacity: opacity / 100 }} 
        />

        {/* Tartalom konténer pozicionálással */}
        <div className={`absolute inset-0 flex flex-col px-6 ${getAlignClasses(align)}`}>
          <Content isOverlay={true} />
        </div>
      </section>
    );
  }

  // --- LAYOUT: STACK (Hagyományos: Kép és Szöveg egymás alatt/felett) ---
  return (
    <section className="bg-white">
        {/* Kép szekció - Slideshow */}
        <div className="relative w-full aspect-[3822/1254] max-h-[600px] overflow-hidden bg-neutral-100">
             {images.length > 0 ? (
                images.map((path, idx) => (
                    <div
                    key={path}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                        idx === currentImageIndex ? "opacity-100" : "opacity-0"
                    }`}
                    >
                    <Image
                        src={getStorageUrl(path)}
                        alt="Hero image"
                        fill
                        className="object-cover"
                    />
                    </div>
                ))
            ) : (
                <div className="flex items-center justify-center h-full text-neutral-400">Nincs kép feltöltve</div>
            )}
        </div>

        {/* Szöveg szekció */}
        <div className={`px-6 py-16 md:py-24 flex flex-col ${getAlignClasses(align)}`}>
             <Content isOverlay={false} />
        </div>
    </section>
  );
}