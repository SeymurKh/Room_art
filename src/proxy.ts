import { NextResponse, type NextRequest } from "next/server";

const locales = ["en", "az"] as const;

function hasLocalePrefix(pathname: string): boolean {
  return locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
}

/**
 * Роутинг локалей (см. docs/i18n-glossary.md и план i18n):
 *   - страницы живут в app/[lang]/..., где lang = "en" | "az";
 *   - EN-URL остаются без префикса: /gallery → rewrite на /en/gallery
 *     (браузерная строка не меняется, текущие URL не ломаются);
 *   - AZ-URL с префиксом: /az/gallery обслуживается напрямую;
 *   - /en/* редиректится на /* (канонический вид EN).
 * Админка (/admin), API, статика — мимо прокси.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Уже с префиксом локали — отдаём как есть (кроме канонизации /en/*).
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/en" ? "/" : pathname.slice(3);
    return NextResponse.redirect(url);
  }
  if (hasLocalePrefix(pathname)) {
    return NextResponse.next();
  }

  // Без префикса — внутренний rewrite на /en/..., URL в браузере чистый.
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/en" : `/en${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Всё, кроме API, админки, _next и файлов с расширением (статика).
  matcher: ["/((?!api|admin|_next|.*\\..*).*)"],
};
