"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { useRouter } from "next/navigation";

type EventRow = {
  id: string;
  title: string;
  starts_at: string;
  is_published: boolean;
};

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/admin/login");
        return;
      }

      const { data } = await supabase
        .from("events")
        .select("id, title, starts_at, is_published")
        .order("starts_at", { ascending: false });

      setEvents(data ?? []);
      setLoading(false);
    })();
  }, [router]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("hu-HU");
  }

  if (loading) {
    return <div className="p-6 text-sm">Betöltés…</div>;
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Események</h1>
          <a
            href="/admin/events/new"
            className="rounded-xl bg-black text-white px-4 py-2 text-sm"
          >
            Új esemény
          </a>
        </div>

        <div className="mt-8 grid gap-3">
          {events.map((e) => (
            <a
              key={e.id}
              href={`/admin/events/${e.id}`}
              className="rounded-xl border p-4 hover:bg-neutral-50"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{e.title}</div>
                  <div className="text-sm text-neutral-600">
                    {formatDate(e.starts_at)}
                  </div>
                </div>

                <div
                  className={`text-xs rounded-full px-3 py-1 ${
                    e.is_published
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {e.is_published ? "Publikus" : "Vázlat"}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
