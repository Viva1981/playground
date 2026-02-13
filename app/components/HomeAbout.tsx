import SafeHtml from "./common/SafeHtml";
import type { AboutSettings, AboutComponentType } from "@/app/lib/types";

type Props = {
  title?: string | null;
  body?: string | null;
  settings?: AboutSettings | null; // Beállítások fogadása
};

export default function HomeAbout({ title, body, settings }: Props) {
  if (!title && !body) return null;

  // --- ALAPÉRTELMEZÉSEK ---
  const order: AboutComponentType[] = settings?.components_order || ['title', 'body'];
  const customContentColor = settings?.content_color || undefined;
  const customBgColor = settings?.background_color || undefined;

  // --- KOMPONENSEK RENDERELÉSE ---
  const components = {
    title: title ? (
      <SafeHtml
        key="title" 
        html={title}
        tag="h2"
        className={`text-2xl md:text-3xl font-semibold tracking-tight ${!customContentColor ? 'text-black' : ''}`}
        style={{ color: customContentColor }}
      />
    ) : null,

    body: body ? (
      <SafeHtml
        key="body" 
        html={body}
        tag="div"
        className={`text-lg leading-relaxed prose prose-sm max-w-none ${!customContentColor ? 'text-neutral-700' : ''}`}
        style={{ color: customContentColor }}
      />
    ) : null
  };

  return (
    <section 
      className="px-6 py-24"
      // Háttérszín alkalmazása
      style={{ backgroundColor: customBgColor }} 
    >
      <div className="mx-auto max-w-3xl flex flex-col gap-6">
        {order.map(key => components[key])}
      </div>
    </section>
  );
}