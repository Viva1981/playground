// app/lib/types.ts

// --- ÉTTERMEK & ESEMÉNYEK ---
export type Restaurant = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  cover_image: string | null;
  gallery_images: string[] | null;
  is_active: boolean;
};

export type EventRow = {
  id: string;
  title: string;
  slug: string;
  starts_at: string;
  summary: string | null;
  is_published: boolean;
  cover_path: string | null;
  restaurant_id: string | null;
  restaurants?: Restaurant | null;
};

// --- HERO SZEKCIÓ ---
export type HeroComponentType = 'title' | 'body' | 'buttons';

export type HeroSettings = {
  layout: 'overlay' | 'stack';
  align: 
    | 'top-left' | 'top-center' | 'top-right' 
    | 'center-left' | 'center-center' | 'center-right' 
    | 'bottom-left' | 'bottom-center' | 'bottom-right';
  overlay_opacity: number;
  components_order?: HeroComponentType[];
  content_color?: string;
  background_color?: string;
};

// --- ABOUT SZEKCIÓ (EZ HIÁNYZOTT AZ EXPORTBÓL) ---
export type AboutComponentType = 'title' | 'body';

export type AboutSettings = {
  content_color?: string;
  background_color?: string;
  components_order?: AboutComponentType[];
};

// --- HEADER SZEKCIÓ ---
export type MenuItem = {
  label: string;
  url: string;
};

export type HeaderSettings = {
  background_color?: string;
  content_color?: string;
  menu_items?: MenuItem[];
};