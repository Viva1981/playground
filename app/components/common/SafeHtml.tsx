// app/components/common/SafeHtml.tsx
"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";

interface SafeHtmlProps {
  html: string | null | undefined;
  className?: string;
  tag?: "div" | "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  style?: React.CSSProperties;
}

export default function SafeHtml({
  html,
  className = "",
  tag: Tag = "div",
  style,
}: SafeHtmlProps) {
  const sanitizedHtml = useMemo(() => {
    if (!html) return "";
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "b", "i", "u", "em", "strong", "p", "br", "h1", "h2", "h3", "h4", "h5", "h6",
        "ul", "ol", "li", "a", "span", "div", "blockquote", "code", "pre"
      ],
      ALLOWED_ATTR: ["href", "title", "target", "rel", "class"],
      KEEP_CONTENT: true,
    });
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
