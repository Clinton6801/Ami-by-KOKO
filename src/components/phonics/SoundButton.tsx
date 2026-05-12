"use client";

/**
 * SoundButton — the big "Hear Kòkò say it!" button on the letter detail page.
 * Plays the pre-recorded clip or falls back to Web Speech API.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { playLetterSound } from "@/lib/audio/speech";
import Koko from "@/components/characters/Koko";
import type { Language } from "@/types";

interface SoundButtonProps {
  letter: string;
  language: Language;
  /** Path to pre-recorded audio clip, if available */
  audioClipUrl?: string;
}

export default function SoundButton({
  letter,
  language,
  audioClipUrl,
}: SoundButtonProps) {
  const [speaking, setSpeaking] = useState(false);

  async function handlePlay() {
    if (speaking) return;
    setSpeaking(true);
    await playLetterSound({ letter, language, audioClipUrl });
    setSpeaking(false);
  }

  return (
    <motion.button
      onClick={handlePlay}
      disabled={speaking}
      whileTap={{ scale: 0.94 }}
      className="focus-ring flex flex-col items-center gap-3 rounded-3xl bg-amber-50 px-8 py-6 transition hover:bg-amber-100 disabled:opacity-70"
      aria-label={`Hear Kòkò say the letter ${letter}`}
    >
      <Koko speaking={speaking} />
      <span className="text-sm font-medium text-stone-600">
        {speaking ? "Kòkò is speaking…" : "Tap to hear Kòkò!"}
      </span>
    </motion.button>
  );
}
