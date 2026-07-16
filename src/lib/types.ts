export type Locale = "en" | "az" | "ru";

export type SiteSettings = {
  brand: string;
  locale: Locale;
  whatsappNumber: string;
  email: string;
  phone: string;
  address: string;
  instagram: string;
  facebook: string;
};

export type HomeContent = {
  eyebrow: string;
  headline: string;
  intro: string;
  heroImage: string;
  currentExhibitionSlug: string;
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
  medium: string;
  category: string;
  dimensions: string;
  widthCm: number;
  heightCm: number;
  image: string;
  availability: "Available" | "Reserved" | "Private collection";
  description: string;
};

export type Exhibition = {
  slug: string;
  title: string;
  type: "Exhibition" | "Event";
  status: "Upcoming" | "Current" | "Past";
  date: string;
  image: string;
  description: string;
};

export type AboutContent = {
  concept: string;
  vision: string;
  identity: string;
  image: string;
};

export type SiteData = {
  settings: SiteSettings;
  home: HomeContent;
  artists: Artist[];
  artworks: Artwork[];
  exhibitions: Exhibition[];
  about: AboutContent;
};
