import type { Artwork, SiteSettings } from "@/lib/types";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

export function whatsappArtworkUrl(settings: SiteSettings, artwork: Artwork, lang: Locale = "en") {
  const t = getDictionary(lang);
  const text = t.whatsapp.artworkInquiry(artwork.title, artwork.year);
  return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function whatsappContactUrl(settings: SiteSettings, lang: Locale = "en", subject?: string) {
  const t = getDictionary(lang);
  const text = t.whatsapp.contactMessage(subject ?? t.whatsapp.subjectCollab);
  return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`;
}
