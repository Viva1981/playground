"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { HeroSettings, HeroComponentType } from "@/app/lib/getHomeHero";

// Segédfüggvény a Supabase Storage URL generáláshoz
const getStorageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${path}`;
};

type Props = {
  title: string | null;
  body: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  ctaLabel2?: string | null;
  ctaUrl2?: string | null;
  mediaPaths?: string[] | null;
  settings?: HeroSettings | null;
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
  // --- BEÁLLÍTÁSOK ---
  const layout = settings?.layout || "overlay";
  const align = settings?.align || "center-center";
  const opacity = settings?.overlay_opacity ?? 50;
  // Alapértelmezett sorrend, ha nincs beállítva
  const order: HeroComponentType[] = settings?.components_order || ['title', 'body', 'buttons'];

  // --- SLIDESHOW LOGIKA ---
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = mediaPaths && mediaPaths.length > 0 ? mediaPaths : [];

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  // --- HELPEREK ---
  
  // Szövegigazítás osztályok (Desktopon érvényes, mobilon felülírjuk ha kell)
  const getAlignClasses = (alignStr: string) => {
    // Mobilon mindig balra vagy középre, desktopon a beállítás szerint
    const base = "flex flex-col gap-6 "; // gap-6 a térköz az elemek között
    switch (alignStr) {
      case "top-left": return base + "md:justify-start md:items-start md:text-left items-start text-left";
      case "top-center": return base + "md:justify-start md:items-center md:text-center items-center text-center";
      case "top-right": return base + "md:justify-start md:items-end md:text-right items-end text-right";
      case "center-left": return base + "md:justify-center md:items-start md:text-left items-start text-left";
      case "center-center": return base + "md:justify-center md:items-center md:text-center items-center text-center";
      case "center-right": return base + "md:justify-center md:items-end md:text-right items-end text-right";
      case "bottom-left": return base + "md:justify-end md:items-start md:text-left items-start text-left";
      case "bottom-center": return base + "md:justify-end md:items-center md:text-center items-center text-center";
      case "bottom-right": return base + "md:justify-end md:items-end md:text-right items-end text-right";
      default: return base + "md:justify-center md:items-center md:text-center items-center text-center";
    }
  };

  // --- KOMPONENSEK RENDERELÉSE SORREND SZERINT ---
  const renderContent = (isOverlayModeOnDesktop: boolean) => {
    // Szövegszín: Ha Overlay módban vagyunk DESKTOPON, akkor fehér, egyébként (mobilon vagy stack módban) fekete/szürke
    const textColorTitle = isOverlayModeOnDesktop ? "md:text-white text-neutral-900" : "text-neutral-900";
    const textColorBody = isOverlayModeOnDesktop ? "md:text-neutral-100 text-neutral-600" : "text-neutral-600";
    
    // Gomb stílusok
    const btnPrimaryClass = isOverlayModeOnDesktop 
        ? "md:bg-white md:text-black md:hover:bg-neutral-200 bg-black text-white hover:bg-neutral-800" // Desktopon fehér gomb sötét háttéren, Mobilon fekete
        : "bg-black text-white hover:bg-neutral-800";

    const btnSecondaryClass = isOverlayModeOnDesktop
        ? "md:border-white md:text-white md:hover:bg-white md:hover:text-black border-neutral-300 text-black hover:bg-neutral-50 hover:border-black"
        : "border-neutral-300 bg-white text-black hover:bg-neutral-50 hover:border-black";

    const components = {
        title: title ? (
            <h1 key="title" className={`text-4xl md:text-6xl font-extrabold tracking-tight leading-tight ${isOverlayModeOnDesktop ? 'md:drop-shadow-sm' : ''} ${textColorTitle}`}>
                {title}
            </h1>
        ) : null,
        
        body: body ? (
            <p key="body" className={`text-lg md:text-xl leading-relaxed max-w-2xl ${textColorBody}`}>
                {body}
            </p>
        ) : null,
        
        buttons: (ctaLabel || ctaLabel2) ? (
            <div key="buttons" className="flex flex-wrap gap-4 pt-2">
                {ctaLabel && ctaUrl && (
                    <a href={ctaUrl} className={`rounded-full px-8 py-3 text-sm font-semibold transition ${btnPrimaryClass}`}>
                        {ctaLabel}
                    </a>
                )}
                {ctaLabel2 && ctaUrl2 && (
                    <a href={ctaUrl2} className={`rounded-full border px-8 py-3 text-sm font-semibold transition ${btnSecondaryClass}`}>
                        {ctaLabel2}
                    </a>
                )}
            </div>
        ) : null
    };

    return order.map(key => components[key]);
  };

  // --- KÉP MEGJELENÍTŐ (Közös) ---
  const ImageSlider = () => (
    <>
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
              alt="Hero image"
              fill
              className="object-cover"
              priority={idx === 0}
            />
          </div>
        ))
      ) : (
        <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center text-neutral-400">
            Nincs kép
        </div>
      )}
    </>
  );

  // --- FŐ RENDER LOGIKA ---
  
  // 1. ESET: OVERLAY LAYOUT (Desktopon)
  // Mobilon ez szétválik (Stack), Desktopon egyben marad.
  if (layout === "overlay") {
    return (
      <section className="flex flex-col md:block md:relative w-full bg-white md:bg-black md:h-[700px]">
        
        {/* Kép Konténer */}
        {/* Mobilon: Relatív magasság. Desktopon: Abszolút teljes kitöltés */}
        <div className="relative w-full h-[400px] md:absolute md:inset-0 md:h-full overflow-hidden">
             <ImageSlider />
             {/* Sötétítés CSAK Desktopon */}
             <div 
                className="hidden md:block absolute inset-0 bg-black pointer-events-none transition-opacity duration-500" 
                style={{ opacity: opacity / 100 }} 
            />
        </div>

        {/* Tartalom Konténer */}
        {/* Mobilon: Normál flow, fehér háttér. Desktopon: Abszolút pozíció a kép felett. */}
        <div className={`
            relative md:absolute md:inset-0 
            px-6 py-12 md:p-12 
            bg-white md:bg-transparent 
            h-auto md:h-full 
            pointer-events-none md:pointer-events-none
            ${getAlignClasses(align)}
        `}>
            {/* A belső tartalomnak kell a pointer-events-auto, hogy a gombok kattinthatók legyenek overlay alatt is */}
            <div className="pointer-events-auto max-w-4xl flex flex-col gap-6 md:gap-8">
                {renderContent(true)}
            </div>
        </div>
      </section>
    );
  }

  // 2. ESET: STACK LAYOUT (Hagyományos)
  // Itt nincs különbség mobil/desktop viselkedésben struktúrálisan
  return (
    <section className="bg-white">
      {/* Kép sáv */}
      <div className="relative w-full aspect-[4/3] md:aspect-[3822/1254] max-h-[600px] overflow-hidden bg-neutral-100">
        <ImageSlider />
      </div>

      {/* Tartalom sáv */}
      <div className={`px-6 py-16 md:py-24 ${getAlignClasses(align)}`}>
         <div className="max-w-4xl flex flex-col gap-6">
            {renderContent(false)}
         </div>
      </div>
    </section>
  );
}