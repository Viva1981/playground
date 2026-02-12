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
// app/lib/types.ts vagy a komponens teteje

export type HeroSettings = {
  layout: 'overlay' | 'stack'; // 'overlay': Kép a háttérben, 'stack': Kép alatt/felett a szöveg
  align: 
    | 'top-left' | 'top-center' | 'top-right' 
    | 'center-left' | 'center-center' | 'center-right' 
    | 'bottom-left' | 'bottom-center' | 'bottom-right';
  overlay_opacity: number; // 0-100 közötti érték
};

export type MenuItem = {
  label: string;
  url: string;
};

export type HeaderSettings = {
  background_color?: string; // Header háttér
  content_color?: string;    // Ikonok és szöveg színe
  menu_items?: MenuItem[];   // Dinamikus menüpontok
};