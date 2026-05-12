"use client";

/**
 * SoundPad — a single tappable pad in the DJ Booth.
 * Glows when active (looping); plays sound on tap.
 */
import { motion } from "framer-motion";

interface SoundPadProps {
  letter: string;
  active: boolean;
  onToggle: () => void;
}

export default function SoundPad({ letter, active, onToggle }: SoundPadProps) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.88 }}
      animate={active ? { boxShadow: "0 0 16px 4px rgba(245,158,11,0.6)" } : { boxShadow: "none" }}
      className={`
        focus-ring flex aspect-square items-center justify-center rounded-2xl
        text-2xl font-bold transition
        ${active
          ? "bg-amber-400 text-white"
          : "bg-stone-100 text-stone-600 hover:bg-amber-100"
        }
      `}
      aria-pressed={active}
      aria-label={`Sound pad for letter ${letter}`}
    >
      {letter}
    </motion.button>
  );
}
