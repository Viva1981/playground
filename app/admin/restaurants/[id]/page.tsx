"use client";

import { useEffect, useMemo, useState, use } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import RichTextEditor from "@/app/components/admin/RichTextEditor";
import {
  deletePaths,
  deleteRestaurantWithRelated,
} from "@/app/utils/adminMediaClient";

type RestaurantRow = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  is_active: boolean;
  cover_path: string | null;
  gallery_paths?: string[] | null;
  gallery_images?: string[] | null;
};

type GalleryField = "gallery_paths" | "gallery_images";

function getGalleryField(row: RestaurantRow | null): GalleryField | null {
  if (!row) return null;
  if (Object.prototype.hasOwnProperty.call(row, "gallery_paths")) return "gallery_paths";
  if (Object.prototype.hasOwnProperty.call(row, "gallery_images")) return "gallery_images";
  return null;
}

function getGalleryPaths(row: RestaurantRow | null): string[] {
  if (!row) return [];
  if (Array.isArray(row.gallery_paths)) return row.gallery_paths.filter(Boolean);
  if (Array.isArray(row.gallery_images)) return row.gallery_images.filter(Boolean);
  return [];
}

export default function EditRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [draggedGalleryPath, setDraggedGalleryPath] = useState<string | null>(null);
  const [dropTargetPath, setDropTargetPath] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", id)
        .single<RestaurantRow>();
      setRestaurant(data);
      setLoading(false);
    })();
  }, [id]);

  const galleryField = useMemo(() => getGalleryField(restaurant), [restaurant]);
  const galleryPaths = useMemo(() => getGalleryPaths(restaurant), [restaurant]);

  async function updateGalleryInDb(nextGallery: string[]) {
    if (!restaurant) return false;

    const field = getGalleryField(restaurant);
    if (!field) {
      alert(
        "A galeria mentesehez SQL modositas kell. Supabase SQL Editor: ALTER TABLE public.restaurants ADD COLUMN gallery_paths text[] DEFAULT '{}'::text[];"
      );
      return false;
    }

    const { error } = await supabase
      .from("restaurants")
      .update({ [field]: nextGallery })
      .eq("id", restaurant.id);

    if (error) {
      alert(error.message);
      return false;
    }

    setRestaurant((prev) => {
      if (!prev) return prev;
      if (field === "gallery_paths") {
        return { ...prev, gallery_paths: nextGallery };
      }
      return { ...prev, gallery_images: nextGallery };
    });

    return true;
  }

  function reorderGalleryPaths(paths: string[], draggedPath: string, targetPath: string) {
    const fromIndex = paths.indexOf(draggedPath);
    const toIndex = paths.indexOf(targetPath);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return paths;

    const next = [...paths];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
  }

  async function moveGalleryImage(draggedPath: string, targetPath: string) {
    if (!restaurant || draggedPath === targetPath) return;
    if (galleryUploading || deleting) return;

    const current = getGalleryPaths(restaurant);
    const next = reorderGalleryPaths(current, draggedPath, targetPath);
    if (next === current) return;

    setGalleryUploading(true);
    try {
      const ok = await updateGalleryInDb(next);
      if (!ok) throw new Error("A galeria sorrend mentese sikertelen.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hiba a galeria sorrendezes soran.");
    } finally {
      setGalleryUploading(false);
      setDraggedGalleryPath(null);
      setDropTargetPath(null);
    }
  }

  async function save() {
    if (!restaurant) return;

    setSaving(true);
    const { error } = await supabase
      .from("restaurants")
      .update({
        name: restaurant.name,
        slug: restaurant.slug,
        address: restaurant.address,
        lat: restaurant.lat,
        lng: restaurant.lng,
        phone: restaurant.phone,
        website: restaurant.website,
        description: restaurant.description,
        is_active: restaurant.is_active,
      })
      .eq("id", id);

    setSaving(false);
    if (error) alert(error.message);
    else alert("Sikeres mentes!");
  }

  async function uploadCover(file: File) {
    if (!restaurant) return;

    setCoverUploading(true);
    const previousCoverPath = restaurant.cover_path;
    const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase();
    const filePath = `restaurants/${id}/cover-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("public-media")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setCoverUploading(false);
      alert(uploadError.message);
      return;
    }

    if (previousCoverPath && previousCoverPath !== filePath) {
      try {
        await deletePaths([previousCoverPath]);
      } catch (deleteErr) {
        await deletePaths([filePath]).catch(() => undefined);
        const message =
          deleteErr instanceof Error
            ? deleteErr.message
            : "A korabbi boritokep torlese sikertelen.";
        setCoverUploading(false);
        alert(message);
        return;
      }
    }

    const { error: dbError } = await supabase
      .from("restaurants")
      .update({ cover_path: filePath })
      .eq("id", id);

    if (dbError) {
      if (previousCoverPath !== filePath) {
        await deletePaths([filePath]).catch(() => undefined);
      }
      setCoverUploading(false);
      alert(dbError.message);
      return;
    }

    setRestaurant({ ...restaurant, cover_path: filePath });
    setCoverUploading(false);
  }

  async function deleteCover() {
    if (!restaurant?.cover_path) return;
    if (!confirm("Biztosan torlod a boritokepet?")) return;

    setCoverUploading(true);
    try {
      await deletePaths([restaurant.cover_path]);

      const { error: dbError } = await supabase
        .from("restaurants")
        .update({ cover_path: null })
        .eq("id", id);

      if (dbError) throw new Error(dbError.message);
      setRestaurant({ ...restaurant, cover_path: null });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hiba a boritokep torlese soran.");
    } finally {
      setCoverUploading(false);
    }
  }

  async function uploadGallery(files: FileList) {
    if (!restaurant) return;
    if (!galleryField) {
      alert(
        "A galeria hasznalatahoz SQL modositas kell. Supabase SQL Editor: ALTER TABLE public.restaurants ADD COLUMN gallery_paths text[] DEFAULT '{}'::text[];"
      );
      return;
    }

    const existing = getGalleryPaths(restaurant);
    if (existing.length + files.length > 10) {
      alert("Maximum 10 kep lehet a galeriaban.");
      return;
    }

    setGalleryUploading(true);
    const uploadedPaths: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const filePath = `restaurants/${id}/gallery/${uuidv4()}.${ext}`;

      const { error } = await supabase.storage
        .from("public-media")
        .upload(filePath, file, { upsert: true });

      if (error) {
        await deletePaths(uploadedPaths).catch(() => undefined);
        setGalleryUploading(false);
        alert(error.message);
        return;
      }

      uploadedPaths.push(filePath);
    }

    const nextGallery = [...existing, ...uploadedPaths];
    const ok = await updateGalleryInDb(nextGallery);

    if (!ok) {
      await deletePaths(uploadedPaths).catch(() => undefined);
    }

    setGalleryUploading(false);
  }

  async function deleteGalleryImage(path: string) {
    if (!restaurant) return;
    if (!confirm("Biztosan torlod ezt a kepet a galeriabol?")) return;

    setGalleryUploading(true);
    try {
      await deletePaths([path]);

      const nextGallery = getGalleryPaths(restaurant).filter((p) => p !== path);
      const ok = await updateGalleryInDb(nextGallery);
      if (!ok) throw new Error("A galeria adatbazis frissitese sikertelen.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hiba a galerakep torlese soran.");
    } finally {
      setGalleryUploading(false);
    }
  }

  async function removeRestaurant() {
    if (!restaurant) return;
    const approved = confirm(
      "Biztosan torlod az ettermet? A kapcsolodo esemenyek es azok kepei is torlodni fognak."
    );
    if (!approved) return;

    setDeleting(true);
    try {
      await deleteRestaurantWithRelated(restaurant.id);
      router.replace("/admin/restaurants");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hiba az etterem torlese soran.");
      setDeleting(false);
    }
  }

  if (loading) return <div className="p-6">Betoltes...</div>;
  if (!restaurant) return <div className="p-6">Nem talalhato.</div>;

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Etterem szerkesztese</h1>
        <Link href="/admin/restaurants" className="text-sm underline">
          Vissza
        </Link>
      </div>

      <div className="grid gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Nev</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={restaurant.name}
              onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Slug (URL)</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={restaurant.slug}
              onChange={(e) => setRestaurant({ ...restaurant, slug: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Cim</label>
          <input
            className="w-full border p-2 rounded-lg"
            value={restaurant.address || ""}
            onChange={(e) => setRestaurant({ ...restaurant, address: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Latitude</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={restaurant.lat ?? ""}
              onChange={(e) =>
                setRestaurant({
                  ...restaurant,
                  lat: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              placeholder="pl. 48.1035"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Longitude</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={restaurant.lng ?? ""}
              onChange={(e) =>
                setRestaurant({
                  ...restaurant,
                  lng: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              placeholder="pl. 20.7784"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Telefonszam</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={restaurant.phone || ""}
              onChange={(e) => setRestaurant({ ...restaurant, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Weboldal</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={restaurant.website || ""}
              onChange={(e) => setRestaurant({ ...restaurant, website: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Leiras</label>
          <div className="mt-1">
            <RichTextEditor
              value={restaurant.description || ""}
              onChange={(value) => setRestaurant({ ...restaurant, description: value })}
              placeholder="Etterem leiras (formatalhato)..."
              minHeight="160px"
            />
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            A kartyan a rich text formazas megjelenik roviditett nezetben.
          </p>
        </div>

        <div className="border-t pt-4 mt-2">
          <label className="text-sm font-medium mb-2 block">Boritokep</label>
          {restaurant.cover_path && (
            <div className="mb-3 relative h-40 w-full rounded-lg overflow-hidden border">
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${restaurant.cover_path}`}
                alt="Cover"
                fill
                className="object-cover"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            disabled={coverUploading || deleting}
            onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])}
          />
          {restaurant.cover_path && (
            <button
              type="button"
              disabled={coverUploading || deleting}
              onClick={deleteCover}
              className="ml-3 border px-3 py-1.5 rounded text-red-600 disabled:opacity-50"
            >
              Boritokep torlese
            </button>
          )}
          {coverUploading && <span className="text-sm text-blue-600 ml-2">Feltoltes...</span>}
        </div>

        <div className="border-t pt-4 mt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Galeria (max 10 kep)</label>
            <span className="text-xs text-neutral-500">{galleryPaths.length}/10</span>
          </div>

          {!galleryField && (
            <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              SQL modositas szukseges a galeriahoz. Supabase SQL Editor:
              <code className="block mt-2 rounded bg-amber-100 px-2 py-1 text-xs">
                {"ALTER TABLE public.restaurants ADD COLUMN gallery_paths text[] DEFAULT '{}'::text[];"}
              </code>
            </div>
          )}

          <input
            type="file"
            multiple
            accept="image/*"
            disabled={galleryUploading || deleting || !galleryField || galleryPaths.length >= 10}
            onChange={(e) => e.target.files && uploadGallery(e.target.files)}
          />
          {galleryUploading && <span className="text-sm text-blue-600 ml-2">Feltoltes / mentes...</span>}
          {galleryPaths.length > 1 && (
            <p className="mt-2 text-xs text-neutral-500">
              Tipp: huzd at a kepeket drag-and-drop modon a kivant sorrendhez.
            </p>
          )}

          {galleryPaths.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {galleryPaths.map((path) => (
                <div
                  key={path}
                  draggable={!galleryUploading && !deleting}
                  onDragStart={() => setDraggedGalleryPath(path)}
                  onDragEnd={() => {
                    setDraggedGalleryPath(null);
                    setDropTargetPath(null);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (draggedGalleryPath && draggedGalleryPath !== path) {
                      setDropTargetPath(path);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedGalleryPath && draggedGalleryPath !== path) {
                      void moveGalleryImage(draggedGalleryPath, path);
                    }
                  }}
                  className={`relative aspect-square rounded-lg overflow-hidden border bg-neutral-100 cursor-move ${
                    draggedGalleryPath === path ? "opacity-60" : ""
                  } ${dropTargetPath === path ? "ring-2 ring-black/40" : ""}`}
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${path}`}
                    alt="Galeria"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    disabled={galleryUploading || deleting}
                    onClick={() => deleteGalleryImage(path)}
                    className="absolute top-1 right-1 h-7 w-7 rounded-full bg-white/90 text-red-600 border disabled:opacity-50"
                    aria-label="Galeria kep torlese"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={save}
            disabled={saving || coverUploading || galleryUploading || deleting}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-neutral-800 disabled:opacity-50"
          >
            {saving ? "Mentes..." : "Mentes"}
          </button>

          <button
            onClick={removeRestaurant}
            disabled={saving || coverUploading || galleryUploading || deleting}
            className="border border-red-300 text-red-700 px-6 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? "Torles..." : "Etterem torlese"}
          </button>
        </div>
      </div>
    </main>
  );
}
