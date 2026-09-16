"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { PositionedImage, buildTransform, parseTransform } from "@/components/positioned-image";
import type { Event } from "@/lib/types";
import { clamp } from "@/lib/utils";

export type PreviewKey = "hero" | "thumb" | "detail";

export function PreviewBlock({
  label,
  event,
  index,
  updateEvents,
  previewKey,
  containerClassName,
  containerStyle,
  dimmed = false,
  imageMode = "cover",
}: {
  label: string;
  event: Event;
  index: number;
  updateEvents: (fn: (prev: Event[]) => Event[]) => void;
  previewKey: PreviewKey;
  containerClassName: string;
  containerStyle?: React.CSSProperties;
  dimmed?: boolean;
  imageMode?: "cover" | "contain";
}) {
  const field = `${previewKey}Transform` as keyof Event;
  const transform = (event[field] as string) ?? "translate(0px, 0px) scale(1)";
  const parsed = parseTransform(transform);
  const [live, setLive] = useState(parsed);
  const liveRef = useRef(parsed);
  liveRef.current = live;

  const containerRef = useRef<HTMLDivElement>(null);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);

  function saveTransform(tx: number, ty: number, scale: number) {
    const value = buildTransform(tx, ty, scale);
    updateEvents((prev) =>
      prev.map((ev, i) => (i === index ? { ...ev, [field]: value } : ev))
    );
  }

  function handleReset() {
    saveTransform(0, 0, 1);
    setLive({ tx: 0, ty: 0, scale: 1 });
  }

  function beginDrag(clientX: number, clientY: number) {
    draggingRef.current = true;
    lastMouseRef.current = { x: clientX, y: clientY };
  }

  function moveDrag(clientX: number, clientY: number) {
    if (!draggingRef.current) return;
    const dx = clientX - lastMouseRef.current.x;
    const dy = clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: clientX, y: clientY };
    const rect = containerRef.current?.getBoundingClientRect();
    const dxPct = rect && rect.width > 0 ? (dx / rect.width) * 100 : 0;
    const dyPct = rect && rect.height > 0 ? (dy / rect.height) * 100 : 0;
    setLive((prev) => ({ tx: prev.tx + dxPct, ty: prev.ty + dyPct, scale: prev.scale }));
  }

  function endDrag() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const { tx, ty, scale } = liveRef.current;
    saveTransform(tx, ty, scale);
  }

  useEffect(() => {
    if (draggingRef.current) return;
    setLive((prev) =>
      prev.tx === parsed.tx && prev.ty === parsed.ty && prev.scale === parsed.scale
        ? prev
        : parsed
    );
  }, [parsed]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      beginDrag(e.clientX, e.clientY);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => moveDrag(e.clientX, e.clientY),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handlePointerUp = useCallback(() => endDrag(), []);

  function handleZoom(delta: number) {
    const next = { ...live, scale: clamp(+(live.scale + delta).toFixed(2), 0.5, 4) };
    setLive(next);
    saveTransform(next.tx, next.ty, next.scale);
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">
        {label} — live preview
      </p>
      <div className="relative rounded-xl overflow-hidden">
        <div
          ref={containerRef}
          className={containerClassName}
          style={containerStyle}
          onPointerDown={event.image ? handlePointerDown : undefined}
          onPointerMove={event.image ? handlePointerMove : undefined}
          onPointerUp={event.image ? handlePointerUp : undefined}
          onPointerCancel={event.image ? handlePointerUp : undefined}
        >
          {event.image ? (
            <PositionedImage
              src={event.image}
              alt={event.title}
              transform={buildTransform(live.tx, live.ty, live.scale)}
              mode={imageMode}
              draggable={false}
              clipPath={containerStyle?.clipPath as string | undefined}
              containerClassName="h-full w-full"
              loading="eager"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[#6f6a61]">
              Upload an image first
            </div>
          )}
        </div>
        {event.image ? (
          <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => handleZoom(-0.1)} className="grid size-7 place-items-center bg-black/40 text-white backdrop-blur hover:bg-black/60" aria-label="Zoom out"><ZoomOut size={14} /></button>
              <span className="px-1 text-[10px] text-white/80 min-w-12 text-center bg-black/30 backdrop-blur py-1">
                {Math.round(live.scale * 100)}%
              </span>
              <button type="button" onClick={() => handleZoom(0.1)} className="grid size-7 place-items-center bg-black/40 text-white backdrop-blur hover:bg-black/60" aria-label="Zoom in"><ZoomIn size={14} /></button>
            </div>
            <button type="button" onClick={handleReset} className="grid size-7 place-items-center bg-black/40 text-white backdrop-blur hover:bg-black/60" aria-label="Reset" title="Reset position"><RotateCcw size={14} /></button>
          </div>
        ) : null}
        {dimmed && event.image ? (
          <div className="absolute inset-0 pointer-events-none bg-black/10" />
        ) : null}
      </div>
      {event.image ? (
        <p className="text-[10px] text-[#6f6a61] text-center">
          Drag to pan
        </p>
      ) : null}
    </div>
  );
}