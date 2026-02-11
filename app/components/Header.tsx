import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* LOGO - Klikkelhető, a főoldalra visz */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="relative w-10 h-10 overflow-hidden rounded-full border border-gray-200">
            <Image
              src="/logo.jpg"
              alt="Vis Eat Miskolc Logo"
              fill
              className="object-cover"
              sizes="40px"
              priority
            />
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900 hidden sm:block">
            Vis Eat Miskolc
          </span>
        </Link>

        {/* NAVIGÁCIÓ */}
        <nav className="flex items-center gap-4">
          <Link
            href="/#events"
            className="text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 px-3 py-2 rounded-md transition-all"
          >
            Események
          </Link>
          
          <Link
            href="/restaurants"
            className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-colors shadow-sm"
          >
            Éttermek
          </Link>
        </nav>
      </div>
    </header>
  );
}