import Link from "next/link";
import type { SiteSettings } from "@/lib/types";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const brand = "ROOM";
  return (
    <footer className="border-t border-black/10 bg-[#11100e] py-8 text-[#f4f1ea] md:py-12">
      <div className="room-shell flex flex-col items-center gap-5 text-center md:grid md:grid-cols-[1.1fr_.9fr_.9fr] md:items-start md:gap-8 md:text-left">
        <div>
          <Link href="/" className="room-serif text-3xl font-semibold md:text-4xl">
            {brand}
          </Link>
          <p className="mt-3 max-w-sm text-xs leading-6 text-white/58 md:mt-4 md:text-sm">
            Contemporary art, events, artists, and cultural encounters in Baku.
          </p>
        </div>
        <div className="text-xs leading-7 text-white/70 md:text-sm">
          <p>{settings.address}</p>
          <p>{settings.phone}</p>
          <p>{settings.email}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 md:items-start md:justify-start">
          <a href={settings.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href={settings.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
        </div>
      </div>
    </footer>
  );
}
