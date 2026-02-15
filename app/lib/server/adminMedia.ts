import { getSupabaseAdmin } from "@/app/lib/server/supabaseAdmin";

const BUCKET = "public-media";

export function diffRemovedPaths(oldPaths: string[], newPaths: string[]): string[] {
  const nextSet = new Set(newPaths.filter(Boolean));
  return oldPaths.filter((p) => p && !nextSet.has(p));
}

export async function deleteFiles(paths: string[]) {
  const supabaseAdmin = getSupabaseAdmin();
  const filtered = paths.filter(Boolean);
  if (filtered.length === 0) return { success: true as const };

  const { error } = await supabaseAdmin.storage.from(BUCKET).remove(filtered);
  if (error) {
    return { success: false as const, error: error.message };
  }

  return { success: true as const };
}

export async function getEventAssetPaths(eventId: string) {
  const supabaseAdmin = getSupabaseAdmin();
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

export async function deleteRestaurantWithRelatedData(restaurantId: string) {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: restaurant, error: restaurantError } = await supabaseAdmin
    .from("restaurants")
    .select("*")
    .eq("id", restaurantId)
    .single<Record<string, unknown>>();

  if (restaurantError || !restaurant) {
    return {
      success: false as const,
      error: restaurantError?.message ?? "Restaurant not found",
    };
  }

  const coverPath =
    typeof restaurant.cover_path === "string" ? restaurant.cover_path : null;
  const galleryPaths = Array.isArray(restaurant.gallery_paths)
    ? restaurant.gallery_paths
    : Array.isArray(restaurant.gallery_images)
      ? restaurant.gallery_images
      : [];

  const { data: relatedEvents, error: eventsReadError } = await supabaseAdmin
    .from("events")
    .select("id, cover_path, gallery_paths")
    .eq("restaurant_id", restaurantId)
    .returns<Array<{ id: string; cover_path: string | null; gallery_paths: string[] | null }>>();

  if (eventsReadError) {
    return { success: false as const, error: eventsReadError.message };
  }

  const eventIds = (relatedEvents ?? []).map((e) => e.id);
  const eventPaths = (relatedEvents ?? []).flatMap((e) => [
    e.cover_path,
    ...(Array.isArray(e.gallery_paths) ? e.gallery_paths : []),
  ]);

  const allPaths = [coverPath, ...galleryPaths, ...eventPaths].filter(
    (path): path is string => Boolean(path)
  );

  const storageDeleteResult = await deleteFiles(allPaths);
  if (!storageDeleteResult.success) {
    return { success: false as const, error: storageDeleteResult.error };
  }

  if (eventIds.length > 0) {
    const { error: eventsDeleteError } = await supabaseAdmin
      .from("events")
      .delete()
      .in("id", eventIds);

    if (eventsDeleteError) {
      return { success: false as const, error: eventsDeleteError.message };
    }
  }

  const { error: restaurantDeleteError } = await supabaseAdmin
    .from("restaurants")
    .delete()
    .eq("id", restaurantId);

  if (restaurantDeleteError) {
    return { success: false as const, error: restaurantDeleteError.message };
  }

  return {
    success: true as const,
    removedPaths: allPaths,
    removedEventCount: eventIds.length,
  };
}
