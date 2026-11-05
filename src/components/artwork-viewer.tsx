"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Artwork, SiteSettings } from "@/lib/types";
import { ArtworkWall } from "@/components/artwork-wall";
import { RoomImage } from "@/components/room-image";
import {
  buildArtworkHref,
  getAdjacentArtwork,
  parseNavContext,
  resolveArtworkPool,
  type ArtworkNavContext,
} from "@/lib/artwork-nav";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

const SWIPE_THRESHOLD = 50;
const CLICK_SUPPRESS_MS = 300;
const EXIT_DURATION_MS = 220;
/** Страховка: если exit-анимация почему-то не даст onAnimationComplete, подмена случится по таймеру. */
const EXIT_FALLBACK_MS = EXIT_DURATION_MS + 250;

/** Фон стены — единственный на всю страницу и всегда неподвижный: ArtworkWall
 *  фон больше не рисует (его секция прозрачна), поэтому анимация смены картин
 *  трогает только картину и информацию — «стена» не шевелится и не мигает. */
const wallStyle: React.CSSProperties = {
  backgroundImage: "url('/assets/room-wall.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const wrapperExit = { opacity: 0, y: -18, scale: 0.98, filter: "blur(4px)" };
const wrapperRest = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" };

/** Layout-эффект на клиенте (строго до paint), обычный useEffect на сервере. */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * ArtworkViewer — переключение картин прямо на slug-странице (/gallery/[slug]).
 *
 * Пул и порядок prev/next определяются контекстом открытия (query-параметр ctx,
 * см. artwork-nav): работы художника, отфильтрованная галерея, displayed-галерея
 * главной или вся коллекция. Обход циклический.
 *
 * Смена картин — ЖЁСТКО последовательная, без AnimatePresence:
 *
 *   клик → «уход» текущей (0.22s) → подмена контента → «вход» новой.
 *
 * AnimatePresence mode="wait" здесь не используется намеренно: его оркестрация
 * exit-промисов при быстрых кликах и побочных перерисовках позволяла «уходу» и
 * «входу» идти на перегонки — итоговый экран зависел от порядка завершения
 * анимаций. Здесь в каждый момент работает ровно одна анимация, а результат
 * детерминирован: на экране всегда последняя выбранная работа.
 *
 * Быстрые клики копятся в currentSlugRef: трижды «next» подряд — прокрутка на
 * три картины, даже если клики пришли во время «ухода».
 *
 * Переключение происходит на месте: URL синхронизируется через history.replaceState
 * (страницы остаются статическими), соседние изображения префетчатся заранее.
 * Управление: десктоп — стрелки по краям с превью; мобильный — только свайп,
 * с тонкими подсказками-шевронами, которые гаснут после первого перехода.
 */
export function ArtworkViewer({
  artworks,
  artistNames,
  initialSlug,
  settings,
  lang,
}: {
  artworks: Artwork[];
  artistNames: Record<string, string>;
  initialSlug: string;
  settings: SiteSettings;
  lang: Locale;
}) {
  const t = getDictionary(lang);
  const fallbackArtist = t.artwork.fallbackArtist;
  // currentSlug — логическая позиция обхода (меняется сразу по клику);
  // displayedSlug — то, что сейчас физически отрисовано (меняется после «ухода»).
  const [currentSlug, setCurrentSlug] = useState(initialSlug);
  const [displayedSlug, setDisplayedSlug] = useState(initialSlug);
  const [phase, setPhase] = useState<"enter" | "exit">("enter");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [quickEntry, setQuickEntry] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [navContext, setNavContext] = useState<ArtworkNavContext>({ kind: "collection" });
  // Масштаб (x1/x2/x3) и мобильная лупа живут здесь, а не в ArtworkWall:
  // секция перемонтируется при каждой смене картины (key), иначе эти настройки
  // сбрасывались бы — картина «прыгала» в другой размер после переключения.
  const [scale, setScale] = useState(1);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const toggleMagnifier = useCallback(() => setShowMagnifier((value) => !value), []);

  const currentSlugRef = useRef(initialSlug);
  const phaseRef = useRef<"enter" | "exit">("enter");
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Точка старта касания хранится с identifier: прерванные жесты (touchcancel —
  // pull-to-refresh, системные жесты) не дают старым координатам выстрелить
  // случайным переходом (именно так картинка «возвращалась к первой»).
  const touchStart = useRef<{ id: number; x: number; y: number } | null>(null);
  const suppressClickUntil = useRef(0);

  const current = artworks.find((item) => item.slug === currentSlug) ?? artworks[0];
  const displayed = artworks.find((item) => item.slug === displayedSlug) ?? artworks[0];

  // Пул обхода: контекстный набор; если текущая картина в него не входит —
  // fallback на всю коллекцию.
  const pool = useMemo(() => {
    const contextual = resolveArtworkPool(artworks, navContext);
    return contextual.some((item) => item.slug === currentSlug) ? contextual : artworks;
  }, [artworks, navContext, currentSlug]);

  const adjacent = useMemo(() => getAdjacentArtwork(pool, currentSlug), [pool, currentSlug]);

  /** Полный шаг смены картинки: подменить контент и запустить «вход». */
  const completeExit = useCallback(() => {
    if (phaseRef.current !== "exit") return;
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    phaseRef.current = "enter";
    setDisplayedSlug(currentSlugRef.current);
    setPhase("enter");
  }, []);

  const navigate = useCallback(
    (slug: string, dir: 1 | -1) => {
      // Защита от no-op: повторный переход к текущей картине ничего не делает.
      if (slug === currentSlugRef.current) return;
      currentSlugRef.current = slug;
      setDirection(dir);
      setQuickEntry(true);
      setHintDismissed(true);
      setCurrentSlug(slug);
      // URL меняется без навигации: контекст (ctx) сохраняется,
      // страница остаётся статической.
      window.history.replaceState(null, "", buildArtworkHref(slug, navContext, lang));
    },
    [navContext, lang]
  );

  // Запуск «ухода», когда логическая позиция ушла вперёд, а предыдущий
  // переход уже завершён. Если клик пришёл во время «ухода» — он уже
  // накоплен в currentSlugRef и будет показан в completeExit.
  useEffect(() => {
    if (phaseRef.current === "exit" || displayedSlug === currentSlug) return;
    phaseRef.current = "exit";
    setPhase("exit");
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    exitTimerRef.current = setTimeout(completeExit, EXIT_FALLBACK_MS);
  }, [currentSlug, displayedSlug, completeExit]);

  useEffect(
    () => () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    },
    []
  );

  // Заголовок вкладки следует за текущей (логической) картиной (как generateMetadata).
  useEffect(() => {
    if (current) document.title = `${current.title} — ROOM`;
  }, [current]);

  // Клавиатура: ←/→ переключают картины.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
      ) {
        return;
      }
      if (!adjacent) return;
      if (event.key === "ArrowLeft") navigate(adjacent.prev.slug, -1);
      if (event.key === "ArrowRight") navigate(adjacent.next.slug, 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [adjacent, navigate]);

  // Префетч соседних изображений — переключение без задержек.
  useEffect(() => {
    if (!adjacent) return;
    for (const item of [adjacent.prev, adjacent.next]) {
      const img = new window.Image();
      img.src = item.image;
    }
  }, [adjacent]);

  // Свайп на сенсорных экранах. Касание хранится с identifier: прерванные жесты
  // (touchcancel — pull-to-refresh, системные жесты) не дают старым координатам
  // выстрелить случайным переходом (так картинка «возвращалась к первой»).
  const onTouchStart = useCallback((event: React.TouchEvent) => {
    if (event.touches.length !== 1) {
      // мультитач (пинч-зум) — жест не наш
      touchStart.current = null;
      return;
    }
    const touch = event.touches[0];
    touchStart.current = { id: touch.identifier, x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchCancel = useCallback(() => {
    // Жест прерван браузером — забываем его, чтобы «хвост» не сработал свайпом.
    touchStart.current = null;
  }, []);

  const onTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      const start = touchStart.current;
      touchStart.current = null;
      if (!start || !adjacent) return;
      // Ищем то же касание, что и на старте (пальцы завершаются вразнобой).
      const touch = Array.from(event.changedTouches).find((t) => t.identifier === start.id);
      if (!touch) return;
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;

      // Любой заметный жест гасит синтетический click: после скролла/свайпа он
      // «прошивается» сквозь ссылку/кнопку под пальцем (отсюда «обновления»).
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        suppressClickUntil.current = Date.now() + CLICK_SUPPRESS_MS;
      }
      // Палец ещё на экране (мульти-тач) — переключения нет.
      if (event.touches.length > 0) return;

      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
        // После свайпа браузер шлёт синтетический click — гасим его.
        suppressClickUntil.current = Date.now() + CLICK_SUPPRESS_MS;
        if (dx < 0) navigate(adjacent.next.slug, 1);
        else navigate(adjacent.prev.slug, -1);
      }
    },
    [adjacent, navigate]
  );

  const onClickCapture = useCallback((event: React.MouseEvent) => {
    if (suppressClickUntil.current > Date.now()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, []);

  // Отключаем «pull-to-refresh» на странице работы: вертикальное дёргание
  // перезагружало страницу вместо переключения картины.
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const prevRoot = root.style.overscrollBehaviorY;
    const prevBody = body.style.overscrollBehaviorY;
    root.style.overscrollBehaviorY = "contain";
    body.style.overscrollBehaviorY = "contain";
    return () => {
      root.style.overscrollBehaviorY = prevRoot;
      body.style.overscrollBehaviorY = prevBody;
    };
  }, []);

  if (!displayed) return null;

  return (
    <div
      className="relative overflow-x-clip"
      onClickCapture={onClickCapture}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      {/* Постоянная подложка стены: пока старая работа уходит, а новая входит,
          «стена» остаётся неподвижной и не мигает. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" style={wallStyle} />
      {/* Затемнение одним слоем: 70% визуально совпадает с прежним двойным
          bg-black/45 (0.45 + 0.45 ≈ 0.70), но уже без пульсации при переключении. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-black/70" />

      {/* Контекст обхода читается клиентски (useSearchParams); всё остальное дерево
          остаётся предрендеренным — см. Next docs: Prerendering / useSearchParams. */}
      <Suspense fallback={null}>
        <NavContextSync onContext={setNavContext} />
      </Suspense>

      {/* Единственная анимация смены: уход (phase="exit") → подмена ключа
          (completeExit) → вход (внутренние варианты ArtworkWall). */}
      <motion.div
        key={displayed.slug}
        className="relative z-10"
        initial={wrapperRest}
        animate={phase === "exit" ? wrapperExit : wrapperRest}
        transition={
          phase === "exit"
            ? { duration: EXIT_DURATION_MS / 1000, ease: "easeIn" }
            : { duration: 0.15, ease: "easeOut" }
        }
        onAnimationComplete={completeExit}
      >
        <ArtworkWall
          artwork={displayed}
          artist={artistNames[displayed.artistSlug] ?? fallbackArtist}
          settings={settings}
          quick={quickEntry}
          direction={direction}
          scale={scale}
          onScaleChange={setScale}
          showMagnifier={showMagnifier}
          onToggleMagnifier={toggleMagnifier}
        />
      </motion.div>

      {adjacent ? (
        <>
          <NavButton
            side="prev"
            artwork={adjacent.prev}
            artistName={artistNames[adjacent.prev.artistSlug] ?? fallbackArtist}
            label={t.artwork.prevArtwork(adjacent.prev.title)}
            onClick={() => navigate(adjacent.prev.slug, -1)}
          />
          <NavButton
            side="next"
            artwork={adjacent.next}
            artistName={artistNames[adjacent.next.artistSlug] ?? fallbackArtist}
            label={t.artwork.nextArtwork(adjacent.next.title)}
            onClick={() => navigate(adjacent.next.slug, 1)}
          />
          {/* На мобильном кнопки скрыты: остаётся только свайп — ему намекают
              тонкие шевроны, которые гаснут после первого перехода. */}
          <SwipeHint side="prev" dismissed={hintDismissed} />
          <SwipeHint side="next" dismissed={hintDismissed} />
        </>
      ) : null}
    </div>
  );
}

/**
 * Передаёт контекст обхода (ctx из query-строки) наверх.
 * Обёрнут в собственный Suspense: компонент с useSearchParams при пререндере
 * рендерится на клиенте, не затрагивая остальное дерево страницы.
 */
function NavContextSync({ onContext }: { onContext: (ctx: ArtworkNavContext) => void }) {
  const searchParams = useSearchParams();
  const ctx = useMemo(
    () => parseNavContext(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );
  // Layout-эффект (строго до paint): контекст применяется до первой отрисовки,
  // и соседние кнопки/превью сразу считают нужный пул — без кадра с fallback.
  useIsomorphicLayoutEffect(() => {
    onContext(ctx);
  }, [ctx, onContext]);
  return null;
}

/** Кнопка переключения (десктоп) с превью соседней работы. */
function NavButton({
  side,
  artwork,
  artistName,
  label,
  onClick,
}: {
  side: "prev" | "next";
  artwork: Artwork;
  artistName: string;
  label: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isPrev = side === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-label={label}
      className={`group absolute top-1/2 z-30 hidden -translate-y-1/2 md:block ${
        isPrev ? "left-3 md:left-8 lg:left-10" : "right-3 md:right-8 lg:right-10"
      }`}
    >
      <span className="grid size-12 place-items-center rounded-full border border-white/25 bg-black/35 text-[#f4f1ea] shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-white/50 hover:bg-white/10 group-active:scale-95 group-focus-visible:ring-2 group-focus-visible:ring-white/60">
        <span
          className={`transition-transform duration-200 ${
            isPrev ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"
          }`}
        >
          {isPrev ? <ChevronLeft size={20} strokeWidth={1.75} /> : <ChevronRight size={20} strokeWidth={1.75} />}
        </span>
      </span>
      <NavPreview side={side} artwork={artwork} artistName={artistName} visible={hovered} />
    </button>
  );
}

/**
 * Превью соседней работы под кнопкой. Прижато внутренней стороной к кнопке
 * (prev — left-0, next — right-0): карточка растёт вглубь страницы и никогда
 * не выходит за её границы.
 */
function NavPreview({
  side,
  artwork,
  artistName,
  visible,
}: {
  side: "prev" | "next";
  artwork: Artwork;
  artistName: string;
  visible: boolean;
}) {
  const isPrev = side === "prev";
  return (
    <span
      className={`pointer-events-none absolute top-full mt-3 hidden w-44 border border-white/15 bg-black/70 p-2 text-left backdrop-blur transition duration-200 md:block ${
        isPrev ? "left-0" : "right-0"
      } ${visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}
    >
      <span className="relative block aspect-[4/3] w-full overflow-hidden bg-white/5">
        <RoomImage
          src={artwork.image}
          alt={artwork.title}
          fill
          sizes="176px"
          className="object-contain"
          fallbackText={artwork.title}
        />
      </span>
      <span className="mt-2 block truncate text-xs font-semibold uppercase tracking-[0.12em] text-[#f4f1ea]">
        {artwork.title}
      </span>
      <span className="mt-0.5 block truncate text-[0.62rem] uppercase tracking-[0.14em] text-white/50">
        {artistName}
      </span>
    </span>
  );
}

/** Мобильная подсказка «листай свайпом» — тонкие шевроны с лёгким покачиванием. */
function SwipeHint({ side, dismissed }: { side: "prev" | "next"; dismissed: boolean }) {
  const isPrev = side === "prev";
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute top-1/2 z-30 -translate-y-1/2 transition-opacity duration-500 md:hidden ${
        dismissed ? "opacity-0" : "opacity-100"
      } ${isPrev ? "left-1.5" : "right-1.5"}`}
    >
      <motion.span
        className="block text-white/35"
        animate={{ x: isPrev ? [-2, 2, -2] : [2, -2, 2] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
      >
        {isPrev ? <ChevronLeft size={16} strokeWidth={1.5} /> : <ChevronRight size={16} strokeWidth={1.5} />}
      </motion.span>
    </span>
  );
}