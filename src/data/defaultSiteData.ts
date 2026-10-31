import type { SiteData } from "@/lib/types";

const empty = { en: "", az: "" } as const;

export const defaultSiteData: SiteData = {
  settings: {
    whatsappNumber: "",
    email: "",
    phone: "",
    address: { ...empty },
    instagram: "",
  },
  artists: [],
  artworks: [],
  events: [],
  about: {
    concept: { ...empty },
    vision: { ...empty },
    identity: { ...empty },
  },
};