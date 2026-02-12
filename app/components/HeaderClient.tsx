// app/components/HeaderClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { HeaderSettings } from "@/app/lib/types";

type Props = {
  settings: HeaderSettings | null;
  logoUrl: string | null;
};

export default function HeaderClient({ settings, logoUrl }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const bgColor = settings?.background_color || "#ffffff";
  const contentColor = settings?.content_color || "#000000";
  const menuItems = settings?.menu_items || [];

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <header 
        className="sticky top-0 z-50 w-full shadow-sm transition-colors duration-300"
        style={{ backgroundColor: bgColor }}
      >
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={closeMenu}>
            {logoUrl ? (
              <div className="relative w-12 h-12 overflow-hidden rounded-full border border-gray-100">
                <Image
                  src={logoUrl}
                  alt="Logo"
                  fill
                  className="object-cover"
                  sizes="48px"
                  priority
                />
              </div>
            ) : null}
            <span 
                className="font-bold text-lg tracking-tight hidden sm:block"
                style={{ color: contentColor }}
            >
              Vis Eat Miskolc
            </span>
          </Link>

          {/* HAMBURGER ICON (Desktopon is ez lesz a kérésed szerint, de általában desktopon ki szokták írni a menüt. 
              Ha szeretnéd, hogy desktopon látszódjanak a linkek, szólj. Most "Mobile-first" mindenhol hamburger lesz a kérés alapján.) */}
          <button 
            onClick={toggleMenu}
            className="p-2 -mr-2 focus:outline-none"
            aria-label="Menü nyitása"
          >
            <div className="flex flex-col gap-[6px] w-8">
              <span className={`block h-[3px] w-full rounded-full transition-all duration-300 origin-center ${isOpen ? 'rotate-45 translate-y-[9px]' : ''}`} style={{ backgroundColor: contentColor }}></span>
              <span className={`block h-[3px] w-full rounded-full transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} style={{ backgroundColor: contentColor }}></span>
              <span className={`block h-[3px] w-full rounded-full transition-all duration-300 origin-center ${isOpen ? '-rotate-45 -translate-y-[9px]' : ''}`} style={{ backgroundColor: contentColor }}></span>
            </div>
          </button>
        </div>
      </header>

      {/* OVERLAY MENU */}
      <div 
        className={`fixed inset-0 z-40 bg-white/95 backdrop-blur-md transition-transform duration-500 ease-in-out flex flex-col items-center justify-center ${
            isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ backgroundColor: bgColor }} // Az overlay is örökli a háttérszínt, vagy legyen fix? Most örökli.
      >
        <nav className="flex flex-col items-center gap-8 text-center">
            {menuItems.map((item, idx) => (
                <Link
                    key={idx}
                    href={item.url}
                    onClick={closeMenu}
                    className="text-2xl font-bold hover:scale-110 transition-transform"
                    style={{ color: contentColor }}
                >
                    {item.label}
                </Link>
            ))}

            {/* Admin által nem szerkeszthető, fix extra gombok (opcionális) */}
            {/* Pl. ha be van jelentkezve admin, itt megjelenhetne egy link az admin felületre */}
        </nav>
      </div>
    </>
  );
}