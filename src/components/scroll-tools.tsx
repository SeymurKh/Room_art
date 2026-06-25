"use client";

import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useState, useCallback } from "react";

export function ScrollTools() {
  const { scrollYProgress } = useScroll();
  const [showTopBtn, setShowTopBtn] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setShowTopBtn(value > 0.18);
  });

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <motion.div
        className="fixed left-0 right-0 top-0 z-60 h-[2px] origin-left"
        style={{
          scaleX: scrollYProgress,
          background:
            "linear-gradient(90deg, transparent, var(--gold, #a58e63), var(--gold, #a58e63))",
        }}
      />

      <AnimatePresence mode="wait">
        {showTopBtn ? (
          <motion.button
            key="top-btn"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 grid size-12 place-items-center border border-black/12 bg-[#f4f1ea]/90 text-[#11100e] backdrop-blur transition hover:bg-[#11100e] hover:text-[#f4f1ea]"
            aria-label="Scroll to top"
          >
            <ArrowUp size={18} />
          </motion.button>
        ) : null}
      </AnimatePresence>
    </>
  );
}