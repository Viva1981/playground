// app/components/AdminPageHeader.tsx
"use client";

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export default function AdminPageHeader({
  title,
  subtitle,
  showBackButton = true,
}: AdminPageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
        )}
      </div>
      {showBackButton && (
        <a
          className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-50"
          href="/admin"
        >
          Vissza
        </a>
      )}
    </div>
  );
}
