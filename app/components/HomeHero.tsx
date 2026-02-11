type Props = {
  title: string | null;
  body: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  // Új propok
  ctaLabel2?: string | null;
  ctaUrl2?: string | null;
};

export default function HomeHero({
  title,
  body,
  ctaLabel,
  ctaUrl,
  ctaLabel2,
  ctaUrl2,
}: Props) {
  return (
    <section className="px-6 py-24 md:py-32 bg-white">
      <div className="mx-auto max-w-4xl text-center">
        {/* Főcím */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-neutral-900 leading-tight">
          {title}
        </h1>

        {/* Szövegtörzs */}
        {body && (
          <p className="mt-6 text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            {body}
          </p>
        )}

        {/* Gombok Konténer */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          
          {/* Elsődleges Gomb (Fekete) */}
          {ctaLabel && ctaUrl && (
            <a
              href={ctaUrl}
              className="rounded-full bg-black px-8 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              {ctaLabel}
            </a>
          )}

          {/* Másodlagos Gomb (Keretes) */}
          {ctaLabel2 && ctaUrl2 && (
            <a
              href={ctaUrl2}
              className="rounded-full border border-neutral-300 bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-neutral-50 hover:border-black"
            >
              {ctaLabel2}
            </a>
          )}
          
        </div>
      </div>
    </section>
  );
}