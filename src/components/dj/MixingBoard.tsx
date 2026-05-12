"use client";

/**
 * MixingBoard — the DJ Booth UI.
 * Children tap letter pads to layer sounds into a loop.
 * Powered by Web Audio API via the mixer lib.
 */
import { useState } from "react";
import SoundPad from "./SoundPad";

const DJ_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function MixingBoard() {
  const [activePads, setActivePads] = useState<Set<string>>(new Set());

  function togglePad(letter: string) {
    setActivePads((prev) => {
      const next = new Set(prev);
      if (next.has(letter)) {
        next.delete(letter);
      } else {
        next.add(letter);
      }
      return next;
    });
  }

  return (
    <div
      role="group"
      aria-label="DJ mixing board"
      className="grid w-full max-w-sm grid-cols-4 gap-3"
    >
      {DJ_LETTERS.map((letter) => (
        <SoundPad
          key={letter}
          letter={letter}
          active={activePads.has(letter)}
          onToggle={() => togglePad(letter)}
        />
      ))}
    </div>
  );
}
