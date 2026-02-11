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

        <div className="mt-8 grid gap-4">
          <a
            className="rounded-2xl border p-5 hover:bg-neutral-50"
            href="/admin/hero"
          >
            <div className="text-sm text-neutral-600">Szerkesztő</div>
            <div className="mt-1 text-lg font-semibold">Home Hero</div>
          </a>
          <a
  className="rounded-2xl border p-5 hover:bg-neutral-50"
  href="/admin/about"
>
  <div className="text-sm text-neutral-600">Szerkesztő</div>
  <div className="mt-1 text-lg font-semibold">Home About / Vision</div>
</a>
<a
  className="rounded-2xl border p-5 hover:bg-neutral-50"
  href="/admin/events"
>
  <div className="text-sm text-neutral-600">Kezelés</div>
  <div className="mt-1 text-lg font-semibold">Események</div>
</a>
<a
  href="/admin/restaurants"
  className="block rounded-xl border bg-white p-6 shadow-sm hover:border-black transition"
>
  <div className="text-lg font-semibold">Éttermek</div>
  <div className="text-sm text-neutral-600">
    Partnerek kezelése, adatok, képek.
  </div>
</a>
        </div>
      </div>
    </main>
  );
}
