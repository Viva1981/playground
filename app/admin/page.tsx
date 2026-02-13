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

      // Admin check (admins táblában benne van-e)
      const { data: adminRow, error } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle<AdminRow>();

      if (error || !adminRow) {
        // be van lépve, de nem admin
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
        <p className="text-sm text-neutral-600">Ellenőrzés...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Bejelentkezve: {email ?? "—"}
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-xl border px-4 py-2 text-sm"
          >
            Kilépés
          </button>
        </div>

        <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2">
          
          {/* --- GLOBÁLIS BEÁLLÍTÁSOK --- */}
          
          <a
            className="rounded-2xl border p-5 hover:bg-neutral-50 transition"
            href="/admin/header"
          >
            <div className="text-sm text-neutral-600">Globális</div>
            <div className="mt-1 text-lg font-semibold">Fejléc (Header)</div>
          </a>

          <a
            className="rounded-2xl border p-5 hover:bg-neutral-50 transition"
            href="/admin/hero"
          >
            <div className="text-sm text-neutral-600">Főoldal</div>
            <div className="mt-1 text-lg font-semibold">Hero Szekció</div>
          </a>

          <a
            className="rounded-2xl border p-5 hover:bg-neutral-50 transition"
            href="/admin/about"
          >
            <div className="text-sm text-neutral-600">Főoldal</div>
            <div className="mt-1 text-lg font-semibold">About / Vision</div>
          </a>

          <a
            className="rounded-2xl border p-5 hover:bg-neutral-50 transition"
            href="/admin/home-events"
          >
            <div className="text-sm text-neutral-600">Főoldal</div>
            <div className="mt-1 text-lg font-semibold">Home Események (Design)</div>
          </a>

          <a
            className="rounded-2xl border p-5 hover:bg-neutral-50 transition"
            href="/admin/rolunk"
          >
            <div className="text-sm text-neutral-600">Globális</div>
            <div className="mt-1 text-lg font-semibold">Rólunk oldal</div>
          </a>

          {/* --- TARTALOM KEZELÉS --- */}

          <a
            className="rounded-2xl border p-5 hover:bg-neutral-50 transition"
            href="/admin/events"
          >
            <div className="text-sm text-neutral-600">Tartalom</div>
            <div className="mt-1 text-lg font-semibold">Események</div>
          </a>

          <a
            href="/admin/restaurants"
            className="rounded-2xl border p-5 hover:bg-neutral-50 transition md:col-span-2 bg-neutral-900 text-white hover:bg-neutral-800"
          >
             <div className="text-sm opacity-80">Adatbázis</div>
             <div className="mt-1 text-lg font-semibold">Éttermek & Partnerek</div>
          </a>
          
        </div>
      </div>
    </main>
  );
}