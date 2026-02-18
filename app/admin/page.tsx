// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { useRouter } from "next/navigation";

type AdminRow = { user_id: string };

export default function AdminDashboardPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      setEmail(session.user.email ?? null);

      const { data: adminRow, error } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle<AdminRow>();

      if (error || !adminRow) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      setChecking(false);
    })();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-sm text-neutral-600">Ellenorzes...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin</h1>
            <p className="mt-1 text-sm text-neutral-600">Bejelentkezve: {email ?? "-"}</p>
          </div>

          <button onClick={logout} className="rounded-xl border px-4 py-2 text-sm">
            Kilepes
          </button>
        </div>

        <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2">
          <a className="rounded-2xl border p-5 hover:bg-neutral-50 transition" href="/admin/header">
            <div className="text-sm text-neutral-600">Globalis</div>
            <div className="mt-1 text-lg font-semibold">Fejlec (Header)</div>
          </a>

          <a className="rounded-2xl border p-5 hover:bg-neutral-50 transition" href="/admin/hero">
            <div className="text-sm text-neutral-600">Fooldal</div>
            <div className="mt-1 text-lg font-semibold">Hero szekcio</div>
          </a>

          <a className="rounded-2xl border p-5 hover:bg-neutral-50 transition" href="/admin/about">
            <div className="text-sm text-neutral-600">Fooldal</div>
            <div className="mt-1 text-lg font-semibold">About / Vision</div>
          </a>

          <a className="rounded-2xl border p-5 hover:bg-neutral-50 transition" href="/admin/home-events">
            <div className="text-sm text-neutral-600">Fooldal</div>
            <div className="mt-1 text-lg font-semibold">Home esemenyek (design)</div>
          </a>

          <a className="rounded-2xl border p-5 hover:bg-neutral-50 transition" href="/admin/footer">
            <div className="text-sm text-neutral-600">Fooldal</div>
            <div className="mt-1 text-lg font-semibold">Footer / Coming Soon</div>
          </a>

          <a className="rounded-2xl border p-5 hover:bg-neutral-50 transition" href="/admin/rolunk">
            <div className="text-sm text-neutral-600">Globalis</div>
            <div className="mt-1 text-lg font-semibold">Rolunk oldal</div>
          </a>

          <a className="rounded-2xl border p-5 hover:bg-neutral-50 transition" href="/admin/events">
            <div className="text-sm text-neutral-600">Tartalom</div>
            <div className="mt-1 text-lg font-semibold">Esemenyek</div>
          </a>

          <a
            href="/admin/restaurants"
            className="rounded-2xl border p-5 hover:bg-neutral-50 transition md:col-span-2 bg-neutral-900 text-white hover:bg-neutral-800"
          >
            <div className="text-sm opacity-80">Adatbazis</div>
            <div className="mt-1 text-lg font-semibold">Ettermek es partnerek</div>
          </a>
        </div>
      </div>
    </main>
  );
}
