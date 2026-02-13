// app/components/common/SafeInlineHtml.tsx
"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";

interface SafeInlineHtmlProps {
  html: string | null | undefined;
  className?: string;
  tag?: "span" | "div" | "p";
  style?: React.CSSProperties & {
    color?: string;
    backgroundColor?: string;
    fontSize?: string;
  };
}

export default function SafeInlineHtml({
  html,
  className = "",
  tag: Tag = "span",
  style,
}: SafeInlineHtmlProps) {
  const sanitizedHtml = useMemo(() => {
    if (!html) return "";

    // Custom DOMPurify config: csak inline elemek
    const config = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "b", "strong", "i", "em", "u", "a", "span"
      ],
      ALLOWED_ATTR: ["href", "title", "target"],
      KEEP_CONTENT: true,
    });

    // Extra feldolgozás: a linkekhez rel="noopener noreferrer" hozzáadása
    // Ez egy egyszerű regex alapú megoldás
    return config.replace(
      /<a\s+([^>]*?)href="([^"]*)"([^>]*)>/g,
      (match, before, href, after) => {
        // Ellenőrizz, hogy már van-e rel attribútum
        if (/rel\s*=/.test(match)) {
          return match; // Már van rel, ne módosítsd
        }
        return `<a ${before}href="${href}" rel="noopener noreferrer"${after}>`;
      }
    );
  }, [html]);

  if (!sanitizedHtml) return null;

  return (
    <Tag
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
