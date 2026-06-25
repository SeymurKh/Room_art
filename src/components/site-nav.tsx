"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import type { SiteSettings } from "@/lib/types";

const links = [
  ["Artists", "/artists"],
  ["Gallery", "/gallery"],
  ["Events", "/events"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

export function SiteNav({ settings, dark = false }: { settings: SiteSettings; dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);

  useMotionValueEvent(scrollY, "change", (current) => {
    const diff = current - lastY;
    if (Math.abs(diff) < 8) return;
    setHidden(diff > 0 && current > 80);
    setLastY(current);
  });

  return (
    <motion.header
      variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl ${
        dark
          ? "border-white/10 bg-black/32 text-[#f4f1ea]"
          : "border-black/10 bg-[#f4f1ea]/74 text-[#11100e]"
      }`}
    >
      <div className="room-shell flex h-16 items-center justify-between gap-6">
        <Link href="/" className="room-serif text-2xl font-semibold leading-none">
          {settings.brand}
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
            className="overflow-hidden border-t border-current/10 md:hidden"
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
