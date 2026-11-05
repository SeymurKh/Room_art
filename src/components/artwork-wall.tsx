"use client";

import { useRef, useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowUpRight, Search } from "lucide-react";
import type { Artwork, SiteSettings } from "@/lib/types";
import { whatsappArtworkUrl } from "@/lib/whatsapp";
import { ArtworkFrame } from "@/components/artwork-frame";
import { MobileMagnifier } from "@/components/mobile-magnifier";
import { getDictionary } from "@/lib/i18n";
import { formatDimensions, pickLocalized } from "@/lib/i18n/config";
import { useLang } from "@/lib/use-lang";

// Акт 1 — картина «поднимается со спины на ноги»:
// из положения лёжа (rotateX) встаёт вертикально на своё место на стене.
// quick — укороченный вход при переключении между картинами (direction: 1 —
// next, вход справа; -1 — prev, вход слева).
// Exit-анимаций в этом компоненте НЕТ намеренно: весь «уход» принадлежит одному
// motion-узлу в ArtworkViewer — так AnimatePresence mode="wait" дожидается ровно
// одного exit-промиса и не зависает на координации вложенных узлов.
function frameVariants(quick: boolean, direction: 1 | -1): Variants {
  if (quick) {
    return {
      initial: { opacity: 0, rotateX: 22, y: 24, x: 28 * direction, filter: "blur(4px)" },
      animate: {
        opacity: 1,
        rotateX: 0,
        y: 0,
        x: 0,
        filter: "blur(0px)",
        transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
      },
    };
  }
  return {
    initial: { opacity: 0, rotateX: 50, y: 48 },
    animate: {
      opacity: 1,
      rotateX: 0,
      y: 0,
      transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] },
    },
  };
}

// Акт 3 — надписи появляются последними (quick — быстрее при переключении)
function staggerContainer(quick: boolean): Variants {
  return {
    animate: {
      transition: quick
        ? { staggerChildren: 0.06, delayChildren: 0.15 }
        : { staggerChildren: 0.12, delayChildren: 1.1 },
    },
  };
}

function fadeUp(quick: boolean): Variants {
  return {
    initial: { opacity: 0, y: quick ? 14 : 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: quick ? 0.45 : 0.7, ease: "easeOut" as const },
    },
  };
}

export function ArtworkWall({
  artwork,
  artist,
  settings,
  quick = false,
  direction = 1,
  scale,
  onScaleChange,
  showMagnifier,
  onToggleMagnifier,
}: {
  artwork: Artwork;
  artist: string;
  settings: SiteSettings;
  /** Укороченная анимация входа — при переключении между картинами. */
  quick?: boolean;
  /** Направление переключения: 1 — next (вход справа), -1 — prev (слева). */
  direction?: 1 | -1;
  /** Масштаб x1/x2/x3. Управляется из ArtworkViewer, чтобы переживать
   *  перемонтирование секции при смене картины (иначе сбрасывался в x1). */
  scale: number;
  onScaleChange: (scale: number) => void;
  /** Мобильная лупа — тоже управляется из ArtworkViewer (не сбрасывается). */
  showMagnifier: boolean;
  onToggleMagnifier: () => void;
}) {
  const priceLabel = artwork.priceAzn != null ? `${artwork.priceAzn.toLocaleString("en-US")} AZN` : null;
  const lang = useLang();
  const t = getDictionary(lang);
  const wallRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const frameV = frameVariants(quick, direction);
  const staggerV = staggerContainer(quick);
  const fadeV = fadeUp(quick);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 1024);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Фона у секции нет намеренно: «стена» живёт в ArtworkViewer одним неподвижным
  // слоем — анимация смены картин трогает только картину и информацию, а фон
  // не шевелится и не мигает при переключении.
  return (
    <section
      ref={wallRef}
      className="relative overflow-hidden grid min-h-screen grid-rows-[auto_1fr_auto] pt-16"
    >
      {/* Top header info */}
      <motion.header
        variants={staggerV}
        initial="initial"
        animate="animate"
        className="room-shell relative z-10 flex flex-col items-center gap-4 py-5 text-center md:flex-row md:items-start md:justify-between md:gap-6 md:py-6 md:text-left"
      >
        <motion.div variants={fadeV}>
          <p className="section-kicker text-[#f4f1ea]">{artist}</p>
          {/* min-h на две строки: одно- и двухстрочные названия не меняют
              высоту шапки — центр картины не «прыгает» при переключении. */}
          <h1 className="room-serif mt-2 max-w-md min-h-[1.9em] text-3xl font-medium leading-[0.95] text-[#f4f1ea] md:text-5xl">
            {artwork.title}
          </h1>
        </motion.div>
        <motion.div variants={fadeV} className="flex flex-col items-center gap-3 md:flex-row md:items-start md:gap-6">
          <div className="flex items-center gap-2">
            {([1, 1.4, 1.8] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onScaleChange(s)}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                  scale === s
                    ? "bg-[#f4f1ea] text-[#11100e]"
                    : "bg-white/10 text-[#f4f1ea] hover:bg-white/15"
                }`}
              >
                x{s === 1 ? "1" : s === 1.4 ? "2" : "3"}
              </button>
            ))}
            {/* Кнопка лупы видна только на мобильных (lg:hidden — тот же порог
                1024px, что был у isMobile), но рендерится всегда: CSS, а не
                JS-флаг — кнопка не «выпрыгивает» в хедер после перерисовки. */}
            <button
              type="button"
              onClick={onToggleMagnifier}
              className={`grid size-9 place-items-center transition lg:hidden ${
                showMagnifier
                  ? "bg-[#f4f1ea] text-[#11100e]"
                  : "bg-white/10 text-[#f4f1ea] hover:bg-white/15"
              }`}
              aria-label={showMagnifier ? t.artwork.hideMagnifier : t.artwork.showMagnifier}
            >
              <Search size={16} />
            </button>
          </div>
          <div className="text-right">
            {artwork.year ? <p className="text-sm text-[#f4f1ea]">{artwork.year}</p> : null}
            <p className="mt-1 text-sm text-[#f4f1ea]">{pickLocalized(artwork.medium, lang)}</p>
          </div>
        </motion.div>
      </motion.header>

      {/* Center artwork on the venue wall */}
      <div className="flex items-center justify-center overflow-hidden px-4 py-2">
        <div className="relative w-fit">
          <motion.div
            ref={imageRef}
            variants={frameV}
            initial="initial"
            animate="animate"
            className="relative z-10"
            style={{ transformOrigin: "center bottom" }}
          >
            <a
              href={artwork.image}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.artwork.openFull(artwork.title)}
              className="block cursor-zoom-in"
            >
              <ArtworkFrame artwork={artwork} priority enableLens scale={scale} />
            </a>
          </motion.div>
        </div>
      </div>

      {showMagnifier && isMobile && (
        <MobileMagnifier
          imageUrl={artwork.image}
          imageRef={imageRef}
          containerRef={wallRef}
          scale={scale}
        />
      )}

      {/* Bottom / side details */}
      <motion.footer
        variants={staggerV}
        initial="initial"
        animate="animate"
        className="room-shell relative z-10 flex flex-col items-center justify-center gap-6 py-5 text-center md:flex-row md:items-end md:justify-between md:py-6 md:text-left"
      >
        <motion.div variants={fadeV}>
          {/* Значения с min-h на две строки: высота футера одинакова для
              одно- и двухстрочных значений — картина остаётся по центру. */}
          <dl className="grid grid-cols-3 gap-x-3 gap-y-2 justify-items-center text-xs sm:gap-x-8 sm:text-sm md:justify-items-start">
            <div>
              <dt className="text-[#f4f1ea]">{t.artwork.dimensions}</dt>
              <dd className="mt-0.5 min-h-[2.9em] text-[#f4f1ea]">{formatDimensions(artwork, lang)}</dd>
            </div>
            <div>
              <dt className="text-[#f4f1ea]">{t.artwork.availability}</dt>
              <dd className="mt-0.5 min-h-[2.9em] text-[#f4f1ea]">
                {artwork.availability === "Available"
                  ? t.artwork.available
                  : artwork.availability === "Reserved"
                    ? t.artwork.reserved
                    : t.artwork.privateCollection}
              </dd>
            </div>
            {priceLabel ? (
              <div>
                <dt className="text-[#f4f1ea]">{t.artwork.price}</dt>
                <dd className="mt-0.5 min-h-[2.9em] text-[#f4f1ea]">{priceLabel}</dd>
              </div>
            ) : null}
          </dl>
        </motion.div>

        <motion.div variants={fadeV}>
          <a
            href={whatsappArtworkUrl(settings, artwork, lang)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#11100e] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4f1ea] transition hover:bg-[#11100e]/85"
          >
            {t.artwork.inquireWhatsapp} <ArrowUpRight size={16} />
          </a>
        </motion.div>
      </motion.footer>
    </section>
  );
}