"use client";

import { useEffect } from "react";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { localeHref } from "@/lib/i18n/config";
import { useLang } from "@/lib/use-lang";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const lang = useLang();
  const t = getDictionary(lang);
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="dark-room grid min-h-screen place-items-center px-4 text-[#f4f1ea]">
      <div className="text-center">
        <p className="section-kicker text-white/50">{t.errorPage.kicker}</p>
        <h1 className="room-serif mt-4 text-5xl font-medium md:text-7xl">{t.errorPage.title}</h1>
        <p className="mt-6 max-w-md text-sm leading-7 text-white/62">
          {t.errorPage.copy}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 border border-white/30 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition hover:bg-white hover:text-black"
          >
            {t.errorPage.retry}
          </button>
          <Link
            href={localeHref(lang, "/")}
            className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/78 transition hover:text-white"
          >
            {t.errorPage.back}
          </Link>
        </div>
      </div>
    </main>
  );
}