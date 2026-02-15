"use client";

import SafeHtml from "@/app/components/SafeHtml";

type Props = {
  html?: string | null;
  className?: string;
};

export default function RichText({ html, className }: Props) {
  if (!html) return null;

  return (
    <SafeHtml
      html={html}
      tag="div"
      className={`prose prose-neutral max-w-none text-neutral-800 [&_p]:mb-4 [&_br]:block ${className ?? ""}`}
    />
  );
}
