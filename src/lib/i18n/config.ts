/**
 * Ядро i18n: поддерживаемые локали и хелперы ссылок.
 *
 * Схема URL (см. src/proxy.ts):
 *   - EN — без префикса: /gallery, /artists/slug (текущие URL не меняются)
 *   - AZ — с префиксом:  /az/gallery, /az/artists/slug
 * Внутри приложения страницы лежат в app/[lang]/..., где lang = "en" | "az".
 * Прокси переписывает непрефиксованные пути на /en/..., чтобы они совпали
 * с роутами [lang]; /en/* канонически редиректится обратно на /*.
 */

export const locales = ["en", "az"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Человекочитаемое имя языка (для переключателя). */
export const localeNames: Record<Locale, string> = {
  en: "EN",
  az: "AZ",
};

/**
 * Локализованный href: для EN путь остаётся без префикса,
 * для AZ получает префикс /az (корень — просто /az).
 */
export function localeHref(lang: Locale, path: string): string {
  if (lang === "en") return path;
  return path === "/" ? "/az" : `/az${path}`;
}

/** Префикс локали в URL: "" для EN, "/az" для AZ. */
export function localePrefix(lang: Locale): string {
  return lang === "en" ? "" : "/az";
}

/**
 * Детектирует локаль по pathname (без опоры на роутер — работает
 * и на клиенте, и при SSR): /az/... → "az", всё остальное → "en".
 */
export function langFromPathname(pathname: string): Locale {
  return pathname === "/az" || pathname.startsWith("/az/") ? "az" : "en";
}

/**
 * Путь текущей страницы без локального префикса: /az/gallery → /gallery.
 * Нужен для переключателя языка.
 */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/az") return "/";
  if (pathname.startsWith("/az/")) return pathname.slice(3) || "/";
  return pathname;
}

export type LocalizedText = { en: string; az: string };

/**
 * Нормализация значения из БД/JSON/формы к LocalizedText.
 * Принимает: готовый объект {en,az}; легаси-строку ("Artist") → {en, az:""};
 * JSON-строку из БД ('{"en":...,"az":...}') → объект. Пустое → {en:"", az:""}.
 */
export function toLocalizedText(value: unknown): LocalizedText {
  if (value == null) return { en: "", az: "" };
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{")) {
      try {
        return toLocalizedText(JSON.parse(trimmed));
      } catch {
        // не JSON — обычная строка
      }
    }
    return { en: value, az: "" };
  }
  if (typeof value === "object") {
    const record = value as { en?: unknown; az?: unknown };
    return {
      en: typeof record.en === "string" ? record.en : "",
      az: typeof record.az === "string" ? record.az : "",
    };
  }
  return { en: "", az: "" };
}

/**
 * Выбор значения по языку с фолбэком на EN: незаполненный AZ
 * никогда не «дырявит» интерфейс.
 */
export function pickLocalized(
  value: LocalizedText | string | null | undefined,
  lang: Locale
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return (lang === "az" ? value.az : value.en) || value.en || "";
}

/**
 * Формат размера работы: "60 × 80 cm" (EN) / "60 × 80 sm" (AZ).
 */
export function formatDimensions(
  size: { widthCm: number; heightCm: number },
  lang: Locale
): string {
  return `${size.widthCm} × ${size.heightCm} ${lang === "az" ? "sm" : "cm"}`;
}