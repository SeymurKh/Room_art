import type { Artwork, SiteSettings } from "@/lib/types";

export function whatsappArtworkUrl(settings: SiteSettings, artwork: Artwork) {
  const text = `Hello ROOM, I would like to inquire about "${artwork.title}" (${artwork.year}).`;
  return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function whatsappContactUrl(settings: SiteSettings, subject = "collaboration") {
  const text = `Hello ROOM, I would like to discuss ${subject}.`;
  return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`;
}
