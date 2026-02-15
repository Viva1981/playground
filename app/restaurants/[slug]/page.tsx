import RichText from "@/components/RichText";
import { supabase } from "@/app/utils/supabaseClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import RestaurantGalleryClient from "@/app/components/RestaurantGalleryClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

type RestaurantDetailRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_path: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  is_active: boolean;
  gallery_paths?: string[] | null;
  gallery_images?: string[] | null;
};

function storageUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${path}`;
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 21s-6-5.7-6-10a6 6 0 1 1 12 0c0 4.3-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.8 3.5h2.4a1 1 0 0 1 1 .8l.7 3a1 1 0 0 1-.3 1l-1.6 1.3a14 14 0 0 0 5.2 5.2l1.3-1.6a1 1 0 0 1 1-.3l3 .7a1 1 0 0 1 .8 1v2.4a2 2 0 0 1-2.2 2A15.8 15.8 0 0 1 5 5.7a2 2 0 0 1 1.8-2.2Z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, description, cover_path")
    .eq("slug", decodedSlug)
    .eq("is_active", true)
    .single<{ name: string; description: string | null; cover_path: string | null }>();

  if (!restaurant) {
    return { title: "Etterem nem talalhato | Vis Eat Miskolc" };
  }

  return {
    title: `${restaurant.name} | Vis Eat Miskolc`,
    description: restaurant.description ?? undefined,
    openGraph: restaurant.cover_path
      ? {
          images: [storageUrl(restaurant.cover_path)],
        }
      : undefined,
  };
}

export default async function RestaurantDetailPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", decodedSlug)
    .eq("is_active", true)
    .single<RestaurantDetailRow>();

  if (!restaurant) {
    notFound();
  }

  const coverUrl = restaurant.cover_path ? storageUrl(restaurant.cover_path) : null;
  const galleryPathsRaw = Array.isArray(restaurant.gallery_paths)
    ? restaurant.gallery_paths
    : Array.isArray(restaurant.gallery_images)
      ? restaurant.gallery_images
      : [];

  const galleryPaths = Array.from(
    new Set(galleryPathsRaw.filter((path): path is string => Boolean(path)))
  ).slice(0, 10);

  const galleryUrls = galleryPaths.map((path) => ({ path, url: storageUrl(path) }));

  return (
    <main className="min-h-screen bg-white pb-20">
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <Link
            href="/restaurants"
            className="text-sm font-medium text-neutral-600 hover:text-black inline-flex items-center gap-2"
          >
            <span aria-hidden="true">←</span>
            <span>Vissza az ettermekhez</span>
          </Link>
        </div>
      </div>

      <article className="mx-auto max-w-5xl px-6 py-8">
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
          <div className="lg:col-span-2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight">
              {restaurant.name}
            </h1>

            <RichText html={restaurant.description ?? ""} className="prose-lg" />

            {galleryUrls.length > 0 && (
              <RestaurantGalleryClient images={galleryUrls} restaurantName={restaurant.name} />
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border bg-neutral-50 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 border-b pb-2">Kapcsolat</h3>

              <ul className="space-y-4">
                {restaurant.address && (
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg border bg-white p-2 text-neutral-500">
                      <MapPinIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-500 uppercase">Cim</div>
                      <div className="text-neutral-900">{restaurant.address}</div>
                    </div>
                  </li>
                )}

                {restaurant.phone && (
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg border bg-white p-2 text-neutral-500">
                      <PhoneIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-500 uppercase">Telefon</div>
                      <a href={`tel:${restaurant.phone}`} className="text-neutral-900 hover:underline">
                        {restaurant.phone}
                      </a>
                    </div>
                  </li>
                )}

                {restaurant.website && (
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg border bg-white p-2 text-neutral-500">
                      <GlobeIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-500 uppercase">Weboldal</div>
                      <a
                        href={restaurant.website.startsWith("http") ? restaurant.website : `https://${restaurant.website}`}
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

              {!restaurant.address && !restaurant.phone && !restaurant.website && (
                <div className="text-sm text-neutral-500 italic">Nincs elerhetoseg megadva.</div>
              )}
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
