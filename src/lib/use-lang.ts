"use client";

import { usePathname } from "next/navigation";
import { langFromPathname, type Locale } from "@/lib/i18n/config";

/**
 * Текущая локаль на клиенте — определяется по URL (/az/... → az).
 * Не требует проброса пропсов из серверных страниц.
 */
export function useLang(): Locale {
  return langFromPathname(usePathname());
}