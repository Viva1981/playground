type Props = {
  title?: string | null;
  body?: string | null;
};

export default function HomeAbout({ title, body }: Props) {
  if (!title && !body) return null;

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        {title ? (
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {title}
          </h2>
        ) : null}

        {body ? (
          <p className="mt-6 text-lg text-neutral-700 leading-relaxed">
            {body}
          </p>
        ) : null}
      </div>
    </section>
  );
}
