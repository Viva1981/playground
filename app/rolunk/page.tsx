// app/rolunk/page.tsx
import { getRolunkSection } from "@/app/lib/getRolunkSection";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rólunk | Vis Eat Miskolc",
  description: "Tudj meg többet a Vis Eat Miskolc projektről és küldetéséről.",
};

export default async function RolunkPage() {
  const data = await getRolunkSection();

  // Fallback értékek, ha még nincs adatbázis rekord
  const title = data?.title || "Rólunk";
  const body = data?.body || "Hamarosan erre az oldalra kerül a közösség bemutatkozása.";
  const settings = data?.settings || {};

  const bgColor = settings.bg_color || "#ffffff";
  const textColor = settings.text_color || "#000000";
  const imageUrl = settings.image_url || null;

  return (
    <main className="min-h-screen" style={{ backgroundColor: bgColor }}>
      {/* FEJLÉC SZEKCIÓ */}
      <div
        className="border-b px-6 py-16 md:py-24"
        style={{ backgroundColor: bgColor }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <h1
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight"
            style={{ color: textColor }}
          >
            {title}
          </h1>
        </div>
      </div>

      {/* TARTALOM SZEKCIÓ */}
      <div className="px-6 py-16 md:py-24" style={{ backgroundColor: bgColor }}>
        <article className="mx-auto max-w-3xl">
          {/* KÉP (HA VAN) */}
          {imageUrl && (
            <div className="mb-12 rounded-2xl overflow-hidden border shadow-sm bg-neutral-100">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-auto object-cover max-h-96"
              />
            </div>
          )}

          {/* SZÖVEG */}
          <div
            className="prose prose-lg max-w-none"
            style={{ color: textColor }}
          >
            <p className="whitespace-pre-wrap text-base md:text-lg leading-relaxed">
              {body}
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
