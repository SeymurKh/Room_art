import { defaultLocale, isLocale, type Locale } from "./config";
import { en, type Dictionary } from "./dictionaries/en";
import { az } from "./dictionaries/az";

export type { Dictionary, Locale };
export { defaultLocale, isLocale };

const dictionaries: Record<Locale, Dictionary> = { en, az };

export function getDictionary(lang: string | undefined): Dictionary {
  return dictionaries[isLocale(lang ?? "") ? (lang as Locale) : defaultLocale];
}
