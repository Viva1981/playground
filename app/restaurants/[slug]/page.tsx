import { supabase } from "@/app/utils/supabaseClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

// SEO Metadata generálás
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, description, cover_path")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!restaurant) {
    return { title: "Étterem nem található | Vis Eat Miskolc" };
  }

  return {
    title: `${restaurant.name} | Vis Eat Miskolc`,
    description: restaurant.description,
    openGraph: restaurant.cover_path
      ? {
          images: [
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${restaurant.cover_path}`,
          ],
        }
      : undefined,
  };
}

export default async function RestaurantDetailPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  // Csak az étterem adatait kérjük le, eseményeket NEM
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", decodedSlug)
    .eq("is_active", true)
    .single();

  if (!restaurant) {
    notFound();
  }

  const coverUrl = restaurant.cover_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${restaurant.cover_path}`
    : null;

  return (
    <main className="min-h-screen bg-white pb-20">
      {/* Vissza sáv */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <a
            href="/restaurants"
            className="text-sm font-medium text-neutral-600 hover:text-black flex items-center gap-2"
          >
            ← Vissza az éttermekhez
          </a>
        </div>
      </div>

      <article className="mx-auto max-w-5xl px-6 py-8">
        
        {/* Borítókép (Ha van) */}
        {coverUrl ? (
          <div className="mb-10 w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-sm border">
            <div className="relative h-64 md:h-96 w-full">
              <Image
                src={coverUrl}
                alt={restaurant.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        ) : null}

        <div className="grid gap-12 lg:grid-cols-3">
          
          {/* Fő tartalom (Bal oldal) */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight">
              {restaurant.name}
            </h1>

            <div className="prose prose-neutral prose-lg max-w-none text-neutral-800">
              <p className="whitespace-pre-wrap">{restaurant.description}</p>
            </div>
          </div>

          {/* Infó Doboz (Jobb oldal / Sidebar) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border bg-neutral-50 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 border-b pb-2">
                Kapcsolat & Infó
              </h3>
              
              <ul className="space-y-4">
                {/* Cím */}
                {restaurant.address && (
                  <li className="flex items-start gap-3">
                    <span className="text-xl">📍</span>
                    <div>
                      <div className="text-xs font-bold text-neutral-500 uppercase">Cím</div>
                      <div className="text-neutral-900">{restaurant.address}</div>
                    </div>
                  </li>
                )}

                {/* Telefon */}
                {restaurant.phone && (
                  <li className="flex items-start gap-3">
                    <span className="text-xl">📞</span>
                    <div>
                      <div className="text-xs font-bold text-neutral-500 uppercase">Telefon</div>
                      <a href={`tel:${restaurant.phone}`} className="text-neutral-900 hover:underline">
                        {restaurant.phone}
                      </a>
                    </div>
                  </li>
                )}

                {/* Weboldal */}
                {restaurant.website && (
                  <li className="flex items-start gap-3">
                    <span className="text-xl">🌐</span>
                    <div>
                      <div className="text-xs font-bold text-neutral-500 uppercase">Weboldal</div>
                      <a 
                        href={restaurant.website.startsWith('http') ? restaurant.website : `https://${restaurant.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {restaurant.website}
                      </a>
                    </div>
                  </li>
                )}
              </ul>
              
              {/* Ha nincs semmi adat */}
              {!restaurant.address && !restaurant.phone && !restaurant.website && (
                <div className="text-sm text-neutral-500 italic">
                  Nincs elérhetőség megadva.
                </div>
              )}
            </div>
          </div>
          
        </div>
      </article>
    </main>
  );
}