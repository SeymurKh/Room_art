import Link from "next/link";
import Image from "next/image";
import type { SiteSettings } from "@/lib/types";

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-black/10 bg-[#11100e] py-8 text-[#f4f1ea] md:py-12">
      <div className="room-shell flex flex-col items-center gap-5 text-center md:grid md:grid-cols-[1.1fr_.9fr_.9fr] md:items-start md:gap-8 md:text-left">
        <div>
          <Link href="/" className="relative inline-block h-16 w-72">
            <Image src="/assets/logo.png" alt="ROOM" fill className="object-contain" />
          </Link>
        </div>
        <div className="text-xs leading-7 text-white/70 md:text-sm">
          <p>{settings.address}</p>
          <p>{settings.phone}</p>
          <p>{settings.email}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 md:items-start md:justify-start">
          <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 transition hover:text-white">
            <InstagramIcon size={18} /> Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
