"use client";

import SafeHtml from "@/app/components/common/SafeHtml";
import type { CSSProperties } from "react";

type Props = {
  html?: string | null;
  className?: string;
  style?: CSSProperties;
};

function fixListHtml(html: string): string {
  // Regex: keresd meg azokat a <li> elemeket, amelyekben több <br> van
  return html.replace(/<li>([\s\S]*?<br>[\s\S]*?)<\/li>/g, (match, content) => {
    // Szétbontjuk <br> alapján
    const items = content.split(/<br\s*\/?\s*>/).map(item => item.trim()).filter(Boolean);
    // Új <li> elemeket készítünk
    return items.map(item => `<li>${item}</li>`).join('');
  });
}

export default function RichText({ html, className, style }: Props) {
  if (!html) return null;
  // Hibás listák javítása
  const fixedHtml = fixListHtml(html);
  return (
    <SafeHtml
      html={fixedHtml}
      tag="div"
      className={`prose prose-neutral max-w-none text-neutral-800 [&_p]:mb-4 [&_li]:mb-2 [&_br]:block ${className ?? ""}`}
      style={style}
    />
  );
}
