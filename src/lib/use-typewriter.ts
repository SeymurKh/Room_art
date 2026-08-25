"use client";

import { useState, useEffect, useCallback } from "react";

const words = ["Gallery.", "Exhibitions.", "Platform."];
const typeSpeed = 55; // ms per character typing
const deleteSpeed = 22; // ms per character deleting
const pauseAfterType = 1800; // pause after full word is typed
const pauseAfterDelete = 300; // pause before typing next word

export function useTypewriter() {
  const [word, setWord] = useState("");
  const [cursor, setCursor] = useState(true);

  // Blinking cursor
  useEffect(() => {
    const blink = setInterval(() => setCursor((v) => !v), 530);
    return () => clearInterval(blink);
  }, []);

  const animate = useCallback(() => {
    let wordIndex = 0;
    let charIndex = 0;
    let phase: "type" | "pause" | "delete" | "wait" = "type";
    let timeout: ReturnType<typeof setTimeout>;

    function tick() {
      const current = words[wordIndex];

      if (phase === "type") {
        if (charIndex <= current.length) {
          setWord(current.slice(0, charIndex));
          charIndex++;
          timeout = setTimeout(tick, typeSpeed);
        } else {
          phase = "pause";
          timeout = setTimeout(tick, pauseAfterType);
        }
      } else if (phase === "pause") {
        phase = "delete";
        charIndex = current.length;
        timeout = setTimeout(tick, deleteSpeed);
      } else if (phase === "delete") {
        if (charIndex > 0) {
          charIndex--;
          setWord(current.slice(0, charIndex));
          timeout = setTimeout(tick, deleteSpeed);
        } else {
          phase = "wait";
          wordIndex = (wordIndex + 1) % words.length;
          timeout = setTimeout(tick, pauseAfterDelete);
        }
      } else if (phase === "wait") {
        phase = "type";
        charIndex = 0;
        timeout = setTimeout(tick, typeSpeed);
      }
    }

    tick();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const cleanup = animate();
    return cleanup;
  }, [animate]);

  return { word, cursor };
}