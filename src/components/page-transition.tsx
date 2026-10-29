"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

// Плавный переход — один на «комнату» (роут), а не на каждый URL.
// /gallery/first и /gallery/second — одна страница-комната /gallery/[slug]:
// их смена не должна перезапускать дерево страницы — иначе state переключателя
// картин сбрасывался в initialSlug и intro проигрывался заново
// («страница просто обновляется как будто» и откат к первой картине).
function routeKey(pathname: string): string {
  if (/^\/gallery\/[^/]+$/.test(pathname)) return "/gallery/[slug]";
  if (/^\/artists\/[^/]+$/.test(pathname)) return "/artists/[slug]";
  if (/^\/events\/[^/]+$/.test(pathname)) return "/events/[slug]";
  return pathname;
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