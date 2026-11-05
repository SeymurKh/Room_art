"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { stripLocalePrefix } from "@/lib/i18n/config";

// Плавный переход — один на «комнату» (роут), а не на каждый URL.
// /gallery/first и /gallery/second — одна страница-комната /gallery/[slug]:
// их смена не должна перезапускать дерево страницы — иначе state переключателя
// картин сбрасывался в initialSlug и intro проигрывался заново
// («страница просто обновляется как будто» и откат к первой картине).
// Путь сопоставляется без префикса локали: /az/gallery/slug — та же «комната»,
// что и /gallery/slug. Иначе в AZ каждый replaceState при переключении картин
// менял бы key и перемонтировал всю страницу целиком (со скачком и fade).
function routeKey(pathname: string): string {
  const path = stripLocalePrefix(pathname);
  if (/^\/gallery\/[^/]+$/.test(path)) return "/gallery/[slug]";
  if (/^\/artists\/[^/]+$/.test(path)) return "/artists/[slug]";
  if (/^\/events\/[^/]+$/.test(path)) return "/events/[slug]";
  return path;
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={routeKey(pathname)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}