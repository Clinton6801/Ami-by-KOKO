"use client";

/**
 * useAudio — manages audio playback state across the app.
 * Wraps playLetterSound and exposes a simple speaking state.
 */
import { useState, useCallback } from "react";
import { playLetterSound } from "@/lib/audio/speech";
import type { Language } from "@/types";

export function useAudio() {
  const [speaking, setSpeaking] = useState(false);
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);

  const play = useCallback(
    async (letter: string, language: Language, audioClipUrl?: string) => {
      if (speaking) return;
      setSpeaking(true);
      setCurrentLetter(letter);

      await playLetterSound({ letter, language, audioClipUrl });

      setSpeaking(false);
      setCurrentLetter(null);
    },
    [speaking]
  );

  return { speaking, currentLetter, play };
}
