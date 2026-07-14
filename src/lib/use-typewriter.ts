"use client";

import { useState, useEffect, useCallback } from "react";

const words = ["Art", "Wine", "Dine"];
const prefix = "The Space of ";
const typeSpeed = 70; // ms per character typing
const deleteSpeed = 35; // ms per character deleting
const pauseAfterType = 2500; // pause after full phrase is typed
const pauseAfterDelete = 350; // pause before typing next word

export function useTypewriter() {
  const [displayed, setDisplayed] = useState("");
  const [cursor, setCursor] = useState(true);

  // Blinking cursor
  useEffect(() => {
    const blink = setInterval(() => setCursor((v) => !v), 530);
    return () => clearInterval(blink);
  }, []);

  const animate = useCallback(() => {
    let wordIndex = 0;
    let charIndex = 0;
    // phases: "typePrefix" (first time type everything) | "typeWord" (type just the word) | "pause" | "delete" | "wait"
    let phase: "typePrefix" | "typeWord" | "pause" | "delete" | "wait" = "typePrefix";
    let timeout: ReturnType<typeof setTimeout>;

    function tick() {
      const fullPhrase = prefix + words[wordIndex];

      if (phase === "typePrefix") {
        // First time: type the entire prefix + word
        if (charIndex <= fullPhrase.length) {
          setDisplayed(fullPhrase.slice(0, charIndex));
          charIndex++;
          timeout = setTimeout(tick, typeSpeed);
        } else {
          phase = "pause";
          timeout = setTimeout(tick, pauseAfterType);
        }
      } else if (phase === "typeWord") {
        // Subsequent cycles: prefix is already there, just type the word
        if (charIndex <= words[wordIndex].length) {
          setDisplayed(prefix + words[wordIndex].slice(0, charIndex));
          charIndex++;
          timeout = setTimeout(tick, typeSpeed);
        } else {
          phase = "pause";
          timeout = setTimeout(tick, pauseAfterType);
        }
      } else if (phase === "pause") {
        phase = "delete";
        charIndex = words[wordIndex].length;
        timeout = setTimeout(tick, deleteSpeed);
      } else if (phase === "delete") {
        if (charIndex > 0) {
          charIndex--;
          setDisplayed(prefix + words[wordIndex].slice(0, charIndex));
          timeout = setTimeout(tick, deleteSpeed);
        } else {
          phase = "wait";
          wordIndex = (wordIndex + 1) % words.length;
          timeout = setTimeout(tick, pauseAfterDelete);
        }
      } else if (phase === "wait") {
        phase = "typeWord";
        charIndex = 0;
        timeout = setTimeout(tick, typeSpeed);
      }
    }

    tick();
    return () => clearTimeout(timeout);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const cleanup = animate();
    return cleanup;
  }, []);

  return { displayed, cursor };
}