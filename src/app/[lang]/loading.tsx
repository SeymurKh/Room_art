"use client";

import { getDictionary } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";

export default function Loading() {
  const lang = useLang();
  const t = getDictionary(lang);
  return (
    <main className="dark-room grid min-h-screen place-items-center px-4 text-[#f4f1ea]">
      <div className="text-center">
        <p className="room-serif text-6xl font-medium animate-pulse">ROOM</p>
        <p className="mt-6 text-sm text-white/50">{t.loading}</p>
      </div>
    </main>
  );
}