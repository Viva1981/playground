"use client";

import { supabase } from "@/app/utils/supabaseClient";

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error("Nincs érvényes admin session.");
  }
  return data.session.access_token;
}

async function postAdminMedia(body: unknown) {
  const token = await getAccessToken();
  const response = await fetch("/api/admin/media", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Admin media művelet sikertelen.");
  }
  return data;
}

export async function deletePaths(paths: string[]) {
  return postAdminMedia({ action: "deletePaths", paths });
}

export async function deleteByDiff(oldPaths: string[], newPaths: string[]) {
  return postAdminMedia({ action: "deleteByDiff", oldPaths, newPaths });
}

export async function deleteEventAssets(eventId: string) {
  return postAdminMedia({ action: "deleteEventAssets", eventId });
}

