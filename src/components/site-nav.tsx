"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";

const links = [
  ["Gallery", "/gallery"],
  ["Artists", "/artists"],
  ["Events", "/events"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

export function SiteNav({ dark = false, fixed = true }: { dark?: boolean; fixed?: boolean }) {
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
        <Link href="/" className="relative h-10 w-24 md:h-12 md:w-64">
          <Image src="/assets/logo.png" alt="ROOM" fill className="object-contain" priority />
        </Link>
        <nav className="hidden items-center gap-7 text-[0.68rem] font-semibold uppercase tracking-[0.18em] md:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="opacity-78 transition hover:opacity-100">
              {label}
            </Link>
          ))}
          <span className="opacity-60">EN</span>
        </nav>
        <button
          className="grid size-10 place-items-center border border-current/20 md:hidden"
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          title={open ? "Close navigation" : "Open navigation"}
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
                  href={href}
                  onClick={() => setOpen(false)}
                  className="opacity-70 transition hover:opacity-100"
                >
                  {label}
                </Link>
              ))}
              <span className="opacity-40">EN</span>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
