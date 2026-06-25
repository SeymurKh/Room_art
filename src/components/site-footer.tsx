import Link from "next/link";
import type { SiteSettings } from "@/lib/types";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-black/10 bg-[#11100e] py-12 text-[#f4f1ea]">
      <div className="room-shell grid gap-8 md:grid-cols-[1.1fr_.9fr_.9fr]">
        <div>
          <Link href="/" className="room-serif text-4xl font-semibold">
            {settings.brand}
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/58">
            Contemporary art, exhibitions, artists, and cultural encounters in Baku.
          </p>
        </div>
        <div className="text-sm leading-7 text-white/70">
          <p>{settings.address}</p>
          <p>{settings.phone}</p>
          <p>{settings.email}</p>
        </div>
        <div className="flex items-start gap-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          <a href={settings.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href={settings.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
        </div>
      </div>
    </footer>
  );
}
