"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

type MobileHorizontalScrollProps = {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
  showIndicator?: boolean;
};

export function MobileHorizontalScroll({
  children,
  className = "",
  itemClassName = "",
  showIndicator = true,
}: MobileHorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const items = el.querySelectorAll("[data-scroll-item]");
    setItemCount(items.length);

    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const itemWidth = el.scrollWidth / items.length;
      const index = Math.round(scrollLeft / itemWidth);
      setActiveIndex(Math.max(0, Math.min(index, items.length - 1)));
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [children]);

  const scrollTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const items = el.querySelectorAll("[data-scroll-item]");
    const item = items[index] as HTMLElement;
    if (item) {
      el.scrollTo({ left: item.offsetLeft, behavior: "smooth" });
    }
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
      {showIndicator && itemCount > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: itemCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-6 bg-[#11100e]" : "w-1.5 bg-[#11100e]/20"
              }`}
              aria-label={`Scroll to item ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function MobileScrollItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div data-scroll-item className={`snap-center shrink-0 ${className}`}>
      {children}
    </div>
  );
}
