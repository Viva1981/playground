"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { useRouter } from "next/navigation";

type Section = {
  id: string;
  key: string;
  title: string | null;
  body: string | null;
  is_active: boolean;
};

const SECTION_KEY = "home_about";

export default function AdminAboutEditorPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);

  const [sectionId, setSectionId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data: adminRow } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!adminRow) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      const { data: existing } = await supabase
        .from("page_sections")
        .select("*")
        .eq("key", SECTION_KEY)
        .maybeSingle<Section>();

      if (!existing) {
        const { data: created } = await supabase
          .from("page_sections")
          .insert({
            key: SECTION_KEY,
            title: "Mi az a Miskolci Soho?",
            body:
              "A Miskolci Soho egy városi kísérlet. Egy tér, ahol meg lehet állni, találkozni, lelassulni.",
            is_active: true,
          })
          .select("*")
          .single<Section>();

        setSectionId(created.id);
        setTitle(created.title ?? "");
        setBody(created.body ?? "");
        setIsActive(created.is_active);
      } else {
        setSectionId(existing.id);
        setTitle(existing.title ?? "");
        setBody(existing.body ?? "");
        setIsActive(existing.is_active);
      }

      setChecking(false);
    })();
  }, [router]);

  async function save() {
    if (!sectionId) return;

    setSaving(true);
    setMessage(null);
    setError(null);

    const { error } = await supabase
      .from("page_sections")
      .update({
        title,
        body,
        is_active: isActive,
      })
      .eq("id", sectionId);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Mentve.");
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-sm text-neutral-600">Betöltés...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Home About / Vision</h1>
            <p className="mt-1 text-sm text-neutral-600">
              A főoldal bemutatkozó szövege.
            </p>
          </div>

          <a className="rounded-xl border px-4 py-2 text-sm" href="/admin">
            Vissza
          </a>
        </div>

        <div className="mt-8 grid gap-4">
          <div className="rounded-2xl border p-5">
            <label className="block text-sm font-medium">Cím</label>
            <input
              className="mt-1 w-full rounded-xl border p-3 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="rounded-2xl border p-5">
            <label className="block text-sm font-medium">Szöveg</label>
            <textarea
              className="mt-1 w-full rounded-xl border p-3 outline-none min-h-[200px]"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="rounded-2xl border p-5 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Aktív</div>
              <div className="text-sm text-neutral-600">
                Kikapcsolva nem jelenik meg a főoldalon.
              </div>
            </div>

            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5"
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}

          <button
            onClick={save}
            disabled={saving}
            className="rounded-2xl bg-black text-white p-4 font-medium disabled:opacity-50"
          >
            {saving ? "Mentés..." : "Mentés"}
          </button>
        </div>
      </div>
    </main>
  );
}
