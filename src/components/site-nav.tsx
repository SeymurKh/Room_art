import Link from "next/link";
import { Menu } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

const links = [
  ["Artists", "/artists"],
  ["Gallery", "/gallery"],
  ["Events", "/events"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

export function SiteNav({ settings, dark = false }: { settings: SiteSettings; dark?: boolean }) {
  return (
    <header
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
          aria-label="Open navigation"
          title="Open navigation"
        >
          <Menu size={18} />
        </button>
      </div>
    </header>
  );
}
