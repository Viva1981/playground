import { supabaseAdmin } from "@/app/lib/server/supabaseAdmin";

const BUCKET = "public-media";

export function diffRemovedPaths(oldPaths: string[], newPaths: string[]): string[] {
  const nextSet = new Set(newPaths.filter(Boolean));
  return oldPaths.filter((p) => p && !nextSet.has(p));
}

export async function deleteFiles(paths: string[]) {
  const filtered = paths.filter(Boolean);
  if (filtered.length === 0) return { success: true as const };

  const { error } = await supabaseAdmin.storage.from(BUCKET).remove(filtered);
  if (error) {
    return { success: false as const, error: error.message };
  }

  return { success: true as const };
}

export async function getEventAssetPaths(eventId: string) {
  const { data, error } = await supabaseAdmin
    .from("events")
    .select("cover_path, gallery_paths")
    .eq("id", eventId)
    .single<{ cover_path: string | null; gallery_paths: string[] | null }>();

  if (error || !data) {
    return { success: false as const, error: error?.message ?? "Event not found" };
  }

  const paths = [
    data.cover_path,
    ...(Array.isArray(data.gallery_paths) ? data.gallery_paths : []),
  ].filter((p): p is string => Boolean(p));

  return { success: true as const, paths };
}

