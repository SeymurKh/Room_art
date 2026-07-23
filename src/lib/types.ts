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
  bio: string;
  statement: string;
};

export type Artwork = {
  slug: string;
  title: string;
  artistSlug: string;
  year: string;
  dimensions: string;
  widthCm: number;
  heightCm: number;
  image: string;
  availability: "Available" | "Reserved" | "Private collection";
  description: string;
  displayed: boolean;
};

export type Exhibition = {
  slug: string;
  title: string;
  type: "Exhibition" | "Event";
  status: "Upcoming" | "Current" | "Past";
  date: string;
  image: string;
  heroTransform: string;
  thumbTransform: string;
  detailTransform: string;
  featured: boolean;
  description: string;
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
  exhibitions: Exhibition[];
  about: AboutContent;
};