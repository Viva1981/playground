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
  // Alapértelmezett sorrend
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
  
  // Szövegigazítás osztályok (A konténerre vonatkozik)
  const getAlignClasses = (alignStr: string) => {
    const base = "flex flex-col gap-6 "; 
    switch (alignStr) {
      case "top-left": return base + "md:justify-start md:items-start md:text-left items-center text-center";
      case "top-center": return base + "md:justify-start md:items-center md:text-center items-center text-center";
      case "top-right": return base + "md:justify-start md:items-end md:text-right items-center text-center";
      case "center-left": return base + "md:justify-center md:items-start md:text-left items-center text-center";
      case "center-center": return base + "md:justify-center md:items-center md:text-center items-center text-center";
      case "center-right": return base + "md:justify-center md:items-end md:text-right items-center text-center";
      case "bottom-left": return base + "md:justify-end md:items-start md:text-left items-center text-center";
      case "bottom-center": return base + "md:justify-end md:items-center md:text-center items-center text-center";
      case "bottom-right": return base + "md:justify-end md:items-end md:text-right items-center text-center";
      default: return base + "md:justify-center md:items-center md:text-center items-center text-center";
    }
  };

  // --- KOMPONENSEK RENDERELÉSE SORREND SZERINT ---
  const renderContent = (isOverlayModeOnDesktop: boolean) => {
    const textColorTitle = isOverlayModeOnDesktop ? "md:text-white text-neutral-900" : "text-neutral-900";
    const textColorBody = isOverlayModeOnDesktop ? "md:text-neutral-100 text-neutral-600" : "text-neutral-600";
    
    const btnPrimaryClass = isOverlayModeOnDesktop 
        ? "md:bg-white md:text-black md:hover:bg-neutral-200 bg-black text-white hover:bg-neutral-800"
        : "bg-black text-white hover:bg-neutral-800";

    const btnSecondaryClass = isOverlayModeOnDesktop
        ? "md:border-white md:text-white md:hover:bg-white md:hover:text-black border-neutral-300 text-black hover:bg-neutral-50 hover:border-black"
        : "border-neutral-300 bg-white text-black hover:bg-neutral-50 hover:border-black";

    // JAVÍTÁS 1: Gombok igazítása
    // Mobilon mindig 'justify-center'. Desktopon az 'align' beállítástól függ.
    let buttonJustifyClass = "justify-center"; // Default mobil (center)
    
    if (isOverlayModeOnDesktop) {
        // Desktop nézetben figyeljük az align beállítást
        if (align.includes('left')) buttonJustifyClass = "md:justify-start justify-center";
        else if (align.includes('right')) buttonJustifyClass = "md:justify-end justify-center";
        else buttonJustifyClass = "md:justify-center justify-center";
    }

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
            <div key="buttons" className={`flex flex-wrap gap-4 pt-2 w-full ${buttonJustifyClass}`}>
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

  // --- KÉP MEGJELENÍTŐ ---
  // JAVÍTÁS 2: Object-fit kezelés
  // isStackMobile: Ha true, akkor mobilon vagyunk és a kép külön van (nem overlay).
  // Ilyenkor object-contain-t használunk, hogy ne vágja le a szélét.
  const ImageSlider = ({ isStackMobile = false }: { isStackMobile?: boolean }) => (
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
              // Mobilon (isStackMobile) 'contain', hogy kiférjen a felirat. Desktopon 'cover' a teljes kitöltésért.
              className={isStackMobile ? "object-contain md:object-cover" : "object-cover"}
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
  if (layout === "overlay") {
    return (
      <section className="flex flex-col md:block md:relative w-full bg-white md:bg-black md:h-[700px]">
        
        {/* Kép Konténer */}
        {/* JAVÍTÁS 2: aspect-[4/3] helyett aspect-video (szélesebb), így kevésbé kell kicsinyíteni a széles képet */}
        <div className="relative w-full aspect-video md:absolute md:inset-0 md:aspect-auto md:h-full overflow-hidden bg-neutral-50">
             <ImageSlider isStackMobile={true} />
             {/* Sötétítés CSAK Desktopon */}
             <div 
                className="hidden md:block absolute inset-0 bg-black pointer-events-none transition-opacity duration-500" 
                style={{ opacity: opacity / 100 }} 
            />
        </div>

        {/* Tartalom Konténer */}
        <div className={`
            relative md:absolute md:inset-0 
            px-6 py-12 md:p-12 
            bg-white md:bg-transparent 
            h-auto md:h-full 
            pointer-events-none md:pointer-events-none
            ${getAlignClasses(align)}
        `}>
            <div className="pointer-events-auto max-w-4xl flex flex-col gap-6 md:gap-8 w-full">
                {renderContent(true)}
            </div>
        </div>
      </section>
    );
  }

  // 2. ESET: STACK LAYOUT (Hagyományos)
  return (
    <section className="bg-white">
      {/* Kép sáv */}
      {/* JAVÍTÁS 2: Itt is aspect-video a mobilhoz és object-contain a sliderben */}
      <div className="relative w-full aspect-video md:aspect-[3822/1254] max-h-[600px] overflow-hidden bg-neutral-50">
        <ImageSlider isStackMobile={true} />
      </div>

      {/* Tartalom sáv */}
      <div className={`px-6 py-16 md:py-24 ${getAlignClasses(align)}`}>
         <div className="max-w-4xl flex flex-col gap-6 w-full">
            {renderContent(false)}
         </div>
      </div>
    </section>
  );
}