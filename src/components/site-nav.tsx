"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { getDictionary } from "@/lib/i18n";
import {
  localeHref,
  localeNames,
  stripLocalePrefix,
  type Locale,
} from "@/lib/i18n/config";
import { useLang } from "@/lib/use-lang";

export function SiteNav({ dark = false, fixed = true, lang: langProp }: { dark?: boolean; fixed?: boolean; lang?: Locale }) {
  const langFromPath = useLang();
  const lang = langProp ?? langFromPath;
  const t = getDictionary(lang);
  const links: [string, string][] = [
    [t.nav.gallery, "/gallery"],
    [t.nav.artists, "/artists"],
    [t.nav.events, "/events"],
    [t.nav.about, "/about"],
    [t.nav.contact, "/contact"],
  ];
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);

  useMotionValueEvent(scrollY, "change", (current) => {
    const diff = current - lastY;
    if (Math.abs(diff) < 8) return;
    const nextHidden = diff > 0 && current > 80;
    setHidden(nextHidden);
    // Закрываем мобильное меню, когда шапка скрывается или начинается скролл.
    if (nextHidden) setOpen(false);
    setLastY(current);
  });

  return (
    <motion.header
      variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`${fixed ? "fixed" : "relative"} inset-x-0 top-0 z-50 backdrop-blur-xl ${
        dark
          ? "bg-black/32 text-[#f4f1ea]"
          : "border-black/10 bg-[#f4f1ea]/74 text-[#11100e]"
      }`}
    >
      <div className="room-shell flex h-16 items-center justify-between gap-6">
        <Link href={localeHref(lang, "/")} className="relative h-10 w-24 md:h-12 md:w-64">
          <Image src="/assets/logo.png" alt="ROOM" fill className="object-contain" priority />
        </Link>
        <nav className="hidden items-center gap-7 text-[0.68rem] font-semibold uppercase tracking-[0.18em] md:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={localeHref(lang, href)} className="opacity-78 transition hover:opacity-100">
              {label}
            </Link>
          ))}
          <LanguageSwitch lang={lang} />
        </nav>
        <button
          className="grid size-10 place-items-center border border-current/20 md:hidden"
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? t.nav.closeNav : t.nav.openNav}
          title={open ? t.nav.closeNav : t.nav.openNav}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="max-h-[calc(100vh-4rem)] overflow-y-auto overflow-hidden border-t border-current/10 md:hidden"
          >
            <div className="room-shell flex flex-col gap-5 py-8 text-xs font-semibold uppercase tracking-[0.22em]">
              {links.map(([label, href]) => (
                <Link
                  key={href}
                  href={localeHref(lang, href)}
                  onClick={() => setOpen(false)}
                  className="opacity-70 transition hover:opacity-100"
                >
                  {label}
                </Link>
              ))}
              <LanguageSwitch lang={lang} />
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}

/**
 * Переключатель EN ↔ AZ: ведёт на ту же страницу с сохранением
 * текущего пути и query-строки.
 */
function LanguageSwitch({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const other: Locale = lang === "en" ? "az" : "en";
  return (
    <span className="flex items-center gap-2">
      <span className="opacity-60">{localeNames[lang]}</span>
      <Link
        href={localeHref(other, "/")}
        aria-label={t.nav.switchLabel}
        title={t.nav.switchLabel}
        className="opacity-40 transition hover:opacity-100 underline underline-offset-4"
        onClick={(e) => {
          // Ведём на текущий путь в другой локали, сохраняя query.
          e.preventDefault();
          const target = localeHref(other, stripLocalePrefix(window.location.pathname));
          window.location.href = target + window.location.search;
        }}
      >
        {localeNames[other]}
      </Link>
    </span>
  );
}