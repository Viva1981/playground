type Props = {
  title?: string | null;
  body?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
};

export default function HomeHero({
  title,
  body,
  ctaLabel,
  ctaUrl,
}: Props) {
  return (
    <section className="min-h-[80vh] flex items-center px-6">
      <div className="mx-auto max-w-4xl">
        {title ? (
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {title}
          </h1>
        ) : null}

        {body ? (
          <p className="mt-6 text-lg md:text-xl text-neutral-700 max-w-2xl">
            {body}
          </p>
        ) : null}

        {ctaLabel && ctaUrl ? (
          <a
            href={ctaUrl}
            className="inline-block mt-10 rounded-full bg-black text-white px-8 py-4 text-sm font-medium hover:opacity-90"
          >
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </section>
  );
}
