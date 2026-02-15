import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  deleteFiles,
  deleteRestaurantWithRelatedData,
  diffRemovedPaths,
  getEventAssetPaths,
} from "@/app/lib/server/adminMedia";

type Body =
  | { action: "deletePaths"; paths: string[] }
  | { action: "deleteByDiff"; oldPaths: string[]; newPaths: string[] }
  | { action: "deleteEventAssets"; eventId: string }
  | { action: "deleteRestaurantWithRelated"; restaurantId: string };

function createUserScopedSupabase(accessToken: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

async function requireAdmin(request: NextRequest) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) {
    return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const userClient = createUserScopedSupabase(token);
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: adminRow, error: adminError } = await userClient
    .from("admins")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle<{ user_id: string }>();

  if (adminError || !adminRow) {
    return { ok: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true as const };
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.action === "deletePaths") {
    const result = await deleteFiles(body.paths ?? []);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  }

  if (body.action === "deleteByDiff") {
    const removed = diffRemovedPaths(body.oldPaths ?? [], body.newPaths ?? []);
    const result = await deleteFiles(removed);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, removed });
  }

  if (body.action === "deleteEventAssets") {
    const eventAssets = await getEventAssetPaths(body.eventId);
    if (!eventAssets.success) {
      return NextResponse.json({ error: eventAssets.error }, { status: 400 });
    }

    const result = await deleteFiles(eventAssets.paths);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, removed: eventAssets.paths });
  }

  if (body.action === "deleteRestaurantWithRelated") {
    const result = await deleteRestaurantWithRelatedData(body.restaurantId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      removed: result.removedPaths,
      removedEventCount: result.removedEventCount,
    });
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
