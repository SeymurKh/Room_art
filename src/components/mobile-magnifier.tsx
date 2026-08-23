"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { GripVertical } from "lucide-react";

const ZOOM = 3;
const LENS_SIZE = 150;
const HANDLE_WIDTH = 40;
const HANDLE_HEIGHT = 44;

type Rect = { left: number; top: number; width: number; height: number };

/**
 * MobileMagnifier — перетаскиваемая лупа для мобильных.
 * Живёт как отдельный виджет в сцене (section.wall), не привязана к контейнеру картинки.
 * Начинает под картиной, можно двигать в пределах сцены.
 */
export function MobileMagnifier({
  imageUrl,
  imageRef,
  containerRef,
}: {
  imageUrl: string;
  imageRef: React.RefObject<HTMLDivElement | null>;
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [imageRect, setImageRect] = useState<Rect | null>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef({ touchX: 0, touchY: 0, posX: 0, posY: 0 });

  /* ---- Measure image & container, set initial position ---- */
  useEffect(() => {
    const measure = () => {
      const imgEl = imageRef.current;
      const contEl = containerRef.current;
      if (!imgEl || !contEl) return;

      const imgR = imgEl.getBoundingClientRect();
      const contR = contEl.getBoundingClientRect();

      setImageRect({
        left: imgR.left - contR.left,
        top: imgR.top - contR.top,
        width: imgR.width,
        height: imgR.height,
      });
      setContainerSize({ w: contR.width, h: contR.height });

      // Initial position: centered below the image
      setPos({
        x: imgR.left - contR.left + imgR.width / 2,
        y: imgR.top - contR.top + imgR.height + 20,
      });
      setReady(true);
    };

    // Wait for animations to settle
    const timer = setTimeout(measure, 1600);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measure);
    };
  }, [imageRef, containerRef]);

  /* ---- Touch handlers ---- */
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      dragStartRef.current = {
        touchX: touch.clientX,
        touchY: touch.clientY,
        posX: pos.x,
        posY: pos.y,
      };
      setDragging(true);
    },
    [pos]
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];

      const newX = dragStartRef.current.posX + (touch.clientX - dragStartRef.current.touchX);
      const newY = dragStartRef.current.posY + (touch.clientY - dragStartRef.current.touchY);

      // Clamp within container
      const margin = LENS_SIZE / 2;
      setPos({
        x: Math.max(margin, Math.min(containerSize.w - margin, newX)),
        y: Math.max(margin, Math.min(containerSize.h - margin - HANDLE_HEIGHT, newY)),
      });
    };

    const handleEnd = () => setDragging(false);

    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleEnd);
    return () => {
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [dragging, containerSize]);

  /* ---- Calculate zoom ---- */
  const getZoomStyle = useCallback((): React.CSSProperties => {
    if (!imageRect) return {};

    // Lens center relative to the image
    const relX = (pos.x - imageRect.left) / imageRect.width;
    const relY = (pos.y - imageRect.top) / imageRect.height;

    // If lens is outside the image — show dark circle (no zoom)
    const overImage = relX >= 0 && relX <= 1 && relY >= 0 && relY <= 1;
    if (!overImage) {
      return {
        background: "rgba(20, 20, 18, 0.6)",
      };
    }

    const clampedX = Math.max(0, Math.min(1, relX));
    const clampedY = Math.max(0, Math.min(1, relY));

    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: `${imageRect.width * ZOOM}px ${imageRect.height * ZOOM}px`,
      backgroundPosition: `${
        -clampedX * ZOOM * imageRect.width + LENS_SIZE / 2
      }px ${
        -clampedY * ZOOM * imageRect.height + LENS_SIZE / 2
      }px`,
    };
  }, [imageRect, pos, imageUrl]);

  if (!ready) return null;

  return (
    <div
      ref={widgetRef}
      className="absolute z-50"
      style={{
        left: pos.x,
        top: pos.y,
        transform: `translate(-50%, -${LENS_SIZE / 2}px)`,
        touchAction: "none",
      }}
      onTouchStart={handleTouchStart}
    >
      {/* Lens circle */}
      <div
        className="rounded-full border-2 border-white/80 shadow-xl"
        style={{
          width: LENS_SIZE,
          height: LENS_SIZE,
          ...getZoomStyle(),
        }}
      />
      {/* Handle with grip icon */}
      <div
        className="mx-auto flex items-center justify-center"
        style={{
          width: HANDLE_WIDTH,
          height: HANDLE_HEIGHT,
          marginTop: -2,
          background: "rgba(30, 30, 28, 0.85)",
          borderRadius: "0 0 12px 12px",
        }}
      >
        <GripVertical size={20} className="text-white/60" />
      </div>
    </div>
  );
}