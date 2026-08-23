"use client";

import { useState, useEffect, useCallback } from "react";

const words = ["Art", "Exhibitions", "Artists"];
const prefix = "Digital Space For ";
const typeSpeed = 50; // ms per character typing
const deleteSpeed = 20; // ms per character deleting
const pauseAfterType = 1800; // pause after full phrase is typed
const pauseAfterDelete = 200; // pause before typing next word

export function useTypewriter() {
  const [word, setWord] = useState("");
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
    let firstCycle = true;
    let phase: "typePrefix" | "typeWord" | "pause" | "delete" | "wait" = "typePrefix";
    let timeout: ReturnType<typeof setTimeout>;

    function tick() {
      const fullPhrase = prefix + words[wordIndex];

      if (phase === "typePrefix") {
        // First cycle: type the full phrase character by character
        if (charIndex <= fullPhrase.length) {
          const text = fullPhrase.slice(0, charIndex);
          setDisplayed(text);
          setWord("");
          charIndex++;
          timeout = setTimeout(tick, typeSpeed);
        } else {
          phase = "pause";
          timeout = setTimeout(tick, pauseAfterType);
        }
      } else if (phase === "typeWord") {
        // Subsequent cycles: only type the word
        if (charIndex <= words[wordIndex].length) {
          const w = words[wordIndex].slice(0, charIndex);
          setWord(w);
          setDisplayed(prefix + w);
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
          const w = words[wordIndex].slice(0, charIndex);
          setWord(w);
          setDisplayed(prefix + w);
          timeout = setTimeout(tick, deleteSpeed);
        } else {
          phase = "wait";
          wordIndex = (wordIndex + 1) % words.length;
          if (firstCycle) firstCycle = false;
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

  useEffect(() => {
    const cleanup = animate();
    return cleanup;
  }, [animate]);

  return { prefix: "Digital Space For", word, cursor, displayed };
}