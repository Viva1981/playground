import type { AboutSettings, AboutComponentType } from "@/app/lib/getHomeSection";

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

  // --- RENDERELÉS SORREND SZERINT ---
  const components = {
    title: title ? (
      <h2 
        key="title" 
        className={`text-2xl md:text-3xl font-semibold tracking-tight ${!customContentColor ? 'text-black' : ''}`}
        style={{ color: customContentColor }}
      >
        {title}
      </h2>
    ) : null,

    body: body ? (
      <p 
        key="body" 
        className={`text-lg leading-relaxed ${!customContentColor ? 'text-neutral-700' : ''}`}
        style={{ color: customContentColor }}
      >
        {body}
      </p>
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