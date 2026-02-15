"use client";

import SafeHtml from "@/app/components/common/SafeHtml";
import type { CSSProperties } from "react";

type Props = {
  html?: string | null;
  className?: string;
  style?: CSSProperties;
};

export default function RichText({ html, className, style }: Props) {
  if (!html) return null;

  return (
    <SafeHtml
      html={html}
      tag="div"
      className={`prose prose-neutral max-w-none text-neutral-800 [&_p]:mb-4 [&_li]:mb-2 [&_br]:block ${className ?? ""}`}
      style={style}
    />
  );
}
