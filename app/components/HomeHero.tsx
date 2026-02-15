
"use client";
import SafeHtml from "./common/SafeHtml";
import { useEffect, useState } from "react";
import Image from "next/image";
import RichText from "@/components/RichText";
import type { HeroSettings, HeroComponentType } from "@/app/lib/types";

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
  const order: HeroComponentType[] = settings?.components_order || ['title', 'body', 'buttons'];

  // --- SZÍNEK ---
  const customContentColor = settings?.content_color || undefined;
  const customBgColor = settings?.background_color || undefined;

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

  // --- POZÍCIÓ ÉS IGAZÍTÁS LOGIKA ---
  const getPositionClasses = (alignStr: string) => {
    const mobileBase = "flex flex-col justify-center items-center text-center";
    
    let desktopContainer = "";
    let desktopText = "";
    let desktopButtonAlign = "";

    // Függőleges
    if (alignStr.startsWith("top")) desktopContainer += "md:justify-start ";
    else if (alignStr.startsWith("bottom")) desktopContainer += "md:justify-end ";
    else desktopContainer += "md:justify-center ";

    // Vízszintes
    if (alignStr.includes("left")) {
        desktopContainer += "md:items-start ";
        desktopText = "md:text-left";
        desktopButtonAlign = "md:justify-start";
    } else if (alignStr.includes("right")) {
        desktopContainer += "md:items-end ";
        desktopText = "md:text-right";
        desktopButtonAlign = "md:justify-end";
    } else {
        desktopContainer += "md:items-center ";
        desktopText = "md:text-center";
        desktopButtonAlign = "md:justify-center";
    }

    return {
        container: `${mobileBase} ${desktopContainer} ${desktopText}`,
        buttonAlign: `justify-center ${desktopButtonAlign}`
    };
  };

  const { container: containerClasses, buttonAlign: buttonAlignClasses } = getPositionClasses(align);

  // --- KOMPONENSEK RENDERELÉSE ---
  const renderContent = (isOverlayModeOnDesktop: boolean) => {
    const defaultTitleColor = isOverlayModeOnDesktop ? "md:text-white text-neutral-900" : "text-neutral-900";
    const defaultBodyColor = isOverlayModeOnDesktop ? "md:text-neutral-100 text-neutral-600" : "text-neutral-600";
    
    const defaultBtnPrimary = isOverlayModeOnDesktop 
        ? "md:bg-white md:text-black bg-black text-white" 
        : "bg-black text-white";
    
    const defaultBtnSecondary = isOverlayModeOnDesktop
        ? "md:border-white md:text-white border-neutral-300 text-black"
        : "border-neutral-300 bg-white text-black";

    // A kulcsok típusa HeroComponentType kell legyen
    const components: Record<HeroComponentType, React.ReactNode> = {
        title: title ? (
            <SafeHtml
              key="title" 
              html={title}
              tag="h1"
              className={`text-4xl md:text-6xl font-extrabold tracking-tight leading-tight ${isOverlayModeOnDesktop ? 'md:drop-shadow-sm' : ''} ${!customContentColor ? defaultTitleColor : ''}`}
              style={{ color: customContentColor }}
            />
        ) : null,
        
        body: body ? (
            <RichText key="body" html={body} className={`text-lg md:text-xl leading-relaxed ${!customContentColor ? defaultBodyColor : ''}`} />
        ) : null,
        
        buttons: (ctaLabel || ctaLabel2) ? (
            <div key="buttons" className={`flex flex-wrap gap-4 pt-2 w-full ${buttonAlignClasses}`}>
                {ctaLabel && ctaUrl && (
                    <a 
                        href={ctaUrl} 
                        className={`rounded-full px-8 py-3 text-sm font-semibold transition hover:opacity-80 ${!customContentColor ? defaultBtnPrimary : ''}`}
                        style={customContentColor ? { 
                          backgroundColor: customContentColor, 
                          color: settings?.primary_button_text_color || '#000000' 
                        } : undefined}
                    >
                        {ctaLabel}
                    </a>
                )}
                {ctaLabel2 && ctaUrl2 && (
                    <a 
                        href={ctaUrl2} 
                        className={`rounded-full border px-8 py-3 text-sm font-semibold transition hover:opacity-70 ${!customContentColor ? defaultBtnSecondary : ''}`}
                        style={customContentColor ? { borderColor: customContentColor, color: customContentColor } : undefined}
                    >
                        {ctaLabel2}
                    </a>
                )}
            </div>
        ) : null
    };

    return order.map(key => components[key]);
  };

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
  
  if (layout === "overlay") {
    return (
      <section className="flex flex-col md:block md:relative w-full bg-white md:bg-black md:h-[700px]">
        {/* Kép Konténer (Mobil 3:1) */}
        <div className="relative w-full aspect-[3/1] md:absolute md:inset-0 md:aspect-auto md:h-full overflow-hidden bg-neutral-50">
             <ImageSlider isStackMobile={true} />
             <div 
                className="hidden md:block absolute inset-0 bg-black pointer-events-none transition-opacity duration-500" 
                style={{ opacity: opacity / 100 }} 
            />
        </div>

        {/* Tartalom Konténer */}
        <div 
            className={`
                relative md:absolute md:inset-0 
                px-6 py-12 md:p-12 
                h-auto md:h-full 
                pointer-events-none md:pointer-events-none
                flex flex-col
                ${containerClasses}
                md:!bg-transparent 
            `}
            style={{ backgroundColor: customBgColor ? customBgColor : undefined }}
        >
            <div className="pointer-events-auto w-full max-w-3xl flex flex-col gap-6 md:gap-8">
                {renderContent(true)}
            </div>
        </div>
      </section>
    );
  }

  // STACK LAYOUT
  return (
    <section 
        className="bg-white"
        style={{ backgroundColor: customBgColor }} 
    >
      <div className="relative w-full aspect-[3/1] md:aspect-[3822/1254] max-h-[600px] overflow-hidden bg-neutral-50">
        <ImageSlider isStackMobile={true} />
      </div>

      <div className={`px-6 py-16 md:py-24 flex flex-col ${containerClasses}`}>
         <div className="w-full max-w-3xl flex flex-col gap-6">
            {renderContent(false)}
         </div>
      </div>
    </section>
  );
}