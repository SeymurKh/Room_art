"use client";

import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { localeHref } from "@/lib/i18n/config";
import { useLang } from "@/lib/use-lang";

export default function NotFound() {
  const lang = useLang();
  const t = getDictionary(lang);
  return (
    <main className="dark-room grid min-h-screen place-items-center px-4 text-[#f4f1ea]">
      <div className="text-center">
        <p className="section-kicker text-white/50">{t.notFound.kicker}</p>
        <h1 className="room-serif mt-4 text-6xl font-medium md:text-8xl">{t.notFound.title}</h1>
        <p className="mt-6 max-w-md text-sm leading-7 text-white/62">
          {t.notFound.copy}
        </p>
        <Link
          href={localeHref(lang, "/")}
          className="mt-9 inline-flex items-center gap-2 border border-white/20 px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] transition hover:bg-white hover:text-black"
        >
          {t.notFound.back}
        </Link>
      </div>
    </main>
  );
}