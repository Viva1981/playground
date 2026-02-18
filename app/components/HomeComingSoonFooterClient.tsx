"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  title?: string | null;
  subtitle?: string | null;
  backgroundColor?: string;
};

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

export default function HomeComingSoonFooterClient({
  title = "COMING SOON",
  subtitle = "A miskolci vendéglátók közös ügye.",
  backgroundColor = "#768f4d",
}: Props) {
  const finalText = useMemo(() => title.toUpperCase(), [title]);
  const [displayText, setDisplayText] = useState("");
  const [showSubtitle, setShowSubtitle] = useState(false);

  useEffect(() => {
    const target = finalText;
    const display = Array(target.length).fill("");
    const completed = Array(target.length).fill(false);
    let stopped = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let resetId: ReturnType<typeof setTimeout> | null = null;

    const animate = () => {
      if (stopped) return;

      let allDone = true;
      for (let i = 0; i < target.length; i += 1) {
        if (target[i] === " ") {
          display[i] = " ";
          completed[i] = true;
          continue;
        }

        if (!completed[i]) {
          allDone = false;
          if (Math.random() < 0.08) {
            display[i] = target[i];
            completed[i] = true;
          } else {
            display[i] = randomChar();
          }
        }
      }

      setDisplayText(display.join(""));

      if (!allDone) {
        timeoutId = setTimeout(animate, 80);
      } else {
        timeoutId = setTimeout(() => {
          if (!stopped) setShowSubtitle(true);
        }, 800);
      }
    };

    resetId = setTimeout(() => {
      if (stopped) return;
      setDisplayText("");
      setShowSubtitle(false);
      animate();
    }, 0);

    return () => {
      stopped = true;
      if (resetId) clearTimeout(resetId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [finalText]);

  return (
    <section
      className="w-full px-4 py-16 md:py-24 font-[Arial,sans-serif] text-white"
      style={{ backgroundColor }}
    >
      <div className="mx-auto max-w-6xl min-h-[40vh] md:min-h-[50vh] flex flex-col items-center justify-center text-center">
        <h2 className="m-0 font-black tracking-[0.2em] text-[clamp(2rem,10vw,5rem)]">
          {displayText}
        </h2>
        <p
          className={`mt-6 text-[clamp(1rem,3.2vw,1.375rem)] transition-opacity duration-[2000ms] ${
            showSubtitle ? "opacity-100" : "opacity-0"
          }`}
        >
          {subtitle}
        </p>
      </div>
    </section>
  );
}
