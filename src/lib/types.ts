export type SiteSettings = {
  whatsappNumber: string;
  email: string;
  phone: string;
  address: string;
  instagram: string;
  facebook: string;
};

export type Artist = {
  slug: string;
  name: string;
  role: string;
  portrait: string;
  photos: string[];
  bio: string;
  statement: string;
};

export type Artwork = {
  slug: string;
  title: string;
  artistSlug: string;
  year: string;
  medium: string;
  dimensions: string;
  widthCm: number;
  heightCm: number;
  image: string;
  availability: "Available" | "Reserved" | "Private collection";
  description?: string;
  priceAzn: number | null;
  displayed: boolean;
  tondo?: boolean;
};

export type Event = {
  slug: string;
  title: string;
  status: "Upcoming" | "Current" | "Past";
  date: string;
  image: string;
  heroTransform: string;
  thumbTransform: string;
  detailTransform: string;
  featured: boolean;
  description: string;
  gallery?: string[];
  video?: string;
};

export type AboutContent = {
  concept: string;
  vision: string;
  identity: string;
};

export type SiteData = {
  settings: SiteSettings;
  artists: Artist[];
  artworks: Artwork[];
  events: Event[];
  about: AboutContent;
};