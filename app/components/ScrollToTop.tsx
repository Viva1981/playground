"use client";

import { useEffect, useState } from "react";

type ScrollToTopProps = {
  backgroundColor?: string | null;
  textColor?: string | null;
};

function DoubleChevronUp({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m7 14 5-5 5 5" />
      <path d="m7 19 5-5 5 5" />
    </svg>
  );
}

export default function ScrollToTop({ backgroundColor, textColor }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const scrollable = document.documentElement.scrollHeight > window.innerHeight + 40;
      const scrolled = window.scrollY > 240;
      setVisible(scrollable && scrolled);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Vissza az oldal tetejere"
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition hover:opacity-90"
      style={{
        backgroundColor: backgroundColor || "#000000",
        color: textColor || "#ffffff",
      }}
    >
      <DoubleChevronUp className="h-6 w-6" />
    </button>
  );
}
