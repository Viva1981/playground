"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/app/components/admin/RichTextEditor";

type EventType = "program" | "news" | "report";
type ScheduleType = "datetime" | "date_range" | "undated";

type RestaurantOption = {
  id: string;
  name: string;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function toIsoFromLocalDateTime(localDateTime: string) {
  return new Date(localDateTime).toISOString();
}

function toIsoFromDateOnly(dateValue: string) {
  return new Date(`${dateValue}T00:00:00`).toISOString();
}

export default function NewEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEditedManually, setSlugEditedManually] = useState(false);

  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [restaurantId, setRestaurantId] = useState<string>("");
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);

  const [eventType, setEventType] = useState<EventType>("program");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("datetime");

  const [startsAt, setStartsAt] = useState("");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [dateLabel, setDateLabel] = useState("");

  const [saving, setSaving] = useState(false);
  const [schemaSupportsAdvanced, setSchemaSupportsAdvanced] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: restaurantsData }, { error: schemaError }] = await Promise.all([
        supabase
          .from("restaurants")
          .select("id, name")
          .eq("is_active", true)
          .order("name"),
        supabase
          .from("events")
          .select("id, event_type, schedule_type, starts_on, ends_on, date_label")
          .limit(1),
      ]);

      if (restaurantsData) {
        setRestaurants(restaurantsData as RestaurantOption[]);
      }

      if (!schemaError) {
        setSchemaSupportsAdvanced(true);
      } else if (/column .* does not exist/i.test(schemaError.message)) {
        setSchemaSupportsAdvanced(false);
      } else {
        // Unknown DB error: keep old flow available, but warn the user at create time.
        setSchemaSupportsAdvanced(false);
      }
    })();
  }, []);

  const needsAdvancedSchema = useMemo(() => {
    return eventType !== "program" || scheduleType !== "datetime" || Boolean(dateLabel.trim()) || Boolean(body.trim());
  }, [eventType, scheduleType, dateLabel, body]);

  async function create() {
    if (!title.trim() || !slug.trim()) {
      alert("Toltsd ki a kotelezo mezoket (cim, slug)!");
      return;
    }

    if (!schemaSupportsAdvanced && needsAdvancedSchema) {
      alert(
        "Ehhez az uj esemenykezeleshez SQL modositas kell (events tabla uj oszlopok + starts_at nullable). Lent megtalalod a pontos SQL-t."
      );
      return;
    }

    let startsAtIso: string | null = null;

    if (scheduleType === "datetime") {
      if (!startsAt) {
        alert("Datetime tipusnal a kezdes idopont kotelezo.");
        return;
      }
      startsAtIso = toIsoFromLocalDateTime(startsAt);
    }

    if (scheduleType === "date_range") {
      if (!startsOn) {
        alert("Idointervallum tipusnal a kezdo nap kotelezo.");
        return;
      }
      if (endsOn && endsOn < startsOn) {
        alert("A zaro nap nem lehet korabbi a kezdo napnal.");
        return;
      }
      startsAtIso = toIsoFromDateOnly(startsOn);
    }

    if (!schemaSupportsAdvanced && !startsAtIso) {
      alert("A jelenlegi adatmodellnel a starts_at kotelezo. Futtasd le az SQL modositast.");
      return;
    }

    setSaving(true);

    const insertPayload: Record<string, unknown> = {
      title: title.trim(),
      slug: slug.trim(),
      starts_at: startsAtIso,
      summary: summary.trim() || null,
      is_published: false,
      restaurant_id: restaurantId || null,
    };

    if (schemaSupportsAdvanced) {
      insertPayload.event_type = eventType;
      insertPayload.schedule_type = scheduleType;
      insertPayload.starts_on = startsOn || null;
      insertPayload.ends_on = endsOn || null;
      insertPayload.date_label = dateLabel.trim() || null;
      insertPayload.body = body.trim() || null;
    }

    const { error } = await supabase.from("events").insert(insertPayload);

    if (!error) {
      router.push("/admin/events");
      router.refresh();
      return;
    }

    alert("Hiba: " + error.message);
    setSaving(false);
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Uj esemeny</h1>

        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Esemeny cime</label>
            <input
              className="w-full rounded-xl border p-3"
              value={title}
              onChange={(e) => {
                const nextTitle = e.target.value;
                setTitle(nextTitle);
                if (!slugEditedManually) {
                  setSlug(slugify(nextTitle));
                }
              }}
              placeholder="Pl. Valentin napi vacsora"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL (slug)</label>
            <input
              className="w-full rounded-xl border p-3"
              value={slug}
              onChange={(e) => {
                setSlugEditedManually(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="valentin-nap-2026"
            />
            <p className="text-xs text-neutral-500 mt-1">
              A slug automatikusan generalodik a cimbol, de kezzel modosithato.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipus</label>
            <select
              className="w-full rounded-xl border p-3 bg-white"
              value={eventType}
              onChange={(e) => {
                const nextType = e.target.value as EventType;
                setEventType(nextType);
                if (nextType === "news" || nextType === "report") {
                  setScheduleType("undated");
                }
              }}
            >
              <option value="program">Program</option>
              <option value="news">Hir</option>
              <option value="report">Beszamolo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Melyik etterem?</label>
            <select
              className="w-full rounded-xl border p-3 bg-white"
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
            >
              <option value="">-- Valassz ettermet (opcionalis) --</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Idokezeles</label>
            <select
              className="w-full rounded-xl border p-3 bg-white"
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
              disabled={eventType !== "program"}
            >
              <option value="datetime">Konkret datum + ido</option>
              <option value="date_range">Naptol-napig (intervallum)</option>
              <option value="undated">Nincs konkret idoponthoz kotve</option>
            </select>
            {eventType !== "program" && (
              <p className="text-xs text-neutral-500 mt-1">
                Hir/Beszamolo tipusnal automatikusan &quot;nincs konkret idopont&quot; beallitas aktiv.
              </p>
            )}
          </div>

          {scheduleType === "datetime" && (
            <div>
              <label className="block text-sm font-medium mb-1">Kezdes idopontja</label>
              <input
                type="datetime-local"
                className="w-full rounded-xl border p-3"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
          )}

          {scheduleType === "date_range" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Kezdo nap</label>
                <input
                  type="date"
                  className="w-full rounded-xl border p-3"
                  value={startsOn}
                  onChange={(e) => setStartsOn(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Zaro nap (opcionalis)</label>
                <input
                  type="date"
                  className="w-full rounded-xl border p-3"
                  value={endsOn}
                  onChange={(e) => setEndsOn(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Megjelenitesi datum szoveg (opcionalis)</label>
            <input
              className="w-full rounded-xl border p-3"
              value={dateLabel}
              onChange={(e) => setDateLabel(e.target.value)}
              placeholder="pl. 2026 marcius teljes honap, vagy hamarosan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Rovid leiras</label>
            <textarea
              className="w-full rounded-xl border p-3 min-h-[100px]"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reszletes tartalom (opcionalis)</label>
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder="Hir vagy beszamolo tartalma..."
              minHeight="180px"
            />
          </div>

          {schemaSupportsAdvanced === false && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold mb-2">SQL modositas szukseges az uj esemenykezeleshez:</p>
              <pre className="whitespace-pre-wrap text-xs bg-amber-100 rounded p-3 overflow-x-auto">
{`ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT 'program',
  ADD COLUMN IF NOT EXISTS schedule_type text NOT NULL DEFAULT 'datetime',
  ADD COLUMN IF NOT EXISTS starts_on date,
  ADD COLUMN IF NOT EXISTS ends_on date,
  ADD COLUMN IF NOT EXISTS date_label text;

ALTER TABLE public.events
  ALTER COLUMN starts_at DROP NOT NULL;

ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_event_type_check;
ALTER TABLE public.events
  ADD CONSTRAINT events_event_type_check
  CHECK (event_type IN ('program', 'news', 'report'));

ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_schedule_type_check;
ALTER TABLE public.events
  ADD CONSTRAINT events_schedule_type_check
  CHECK (schedule_type IN ('datetime', 'date_range', 'undated'));`}
              </pre>
            </div>
          )}

          <button
            onClick={create}
            disabled={saving}
            className="rounded-xl bg-black text-white px-6 py-3 mt-2"
          >
            {saving ? "Mentes..." : "Letrehozas"}
          </button>
        </div>
      </div>
    </main>
  );
}
