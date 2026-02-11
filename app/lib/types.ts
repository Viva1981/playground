export type Restaurant = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  cover_image: string | null;
  gallery_images: string[] | null; // Ez egy string tömb lesz a képekhez
  is_active: boolean;
};

// Az esemény típusát is bővítjük a restaurant_id-val
// és opcionálisan beágyazzuk az étterem adatait (joinoláskor kell majd)
export type EventRow = {
  id: string;
  title: string;
  slug: string;
  starts_at: string;
  summary: string | null;
  is_published: boolean;
  cover_path: string | null;
  restaurant_id: string | null; // ÚJ MEZŐ
  restaurants?: Restaurant | null; // Ha lekérjük a hozzá tartozó éttermet is
};