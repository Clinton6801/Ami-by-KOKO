"use client";

import { motion } from "framer-motion";

interface SoundPadProps {
  letter: string;
  active: boolean;
  colour: string;
  onToggle: () => void;
}

export default function SoundPad({ letter, active, colour, onToggle }: SoundPadProps) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.85 }}
      animate={active
        ? { boxShadow: "0 0 20px 4px rgba(245,158,11,0.5)", scale: 1.05 }
        : { boxShadow: "none", scale: 1 }}
      transition={{ duration: 0.15 }}
      className={`
        aspect-square rounded-2xl flex flex-col items-center justify-center gap-1
        text-white font-extrabold transition shadow-md
        ${active
          ? `bg-gradient-to-br ${colour}`
          : "bg-stone-100 text-stone-500 hover:bg-stone-200"
        }
      `}
      aria-pressed={active}
      aria-label={`Sound pad for letter ${letter}`}
    >
      <span className="text-xl sm:text-2xl">{letter}</span>
      <span className="text-xs opacity-75">{letter.toLowerCase()}</span>
      {active && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          className="text-xs"
        >
          ♪
        </motion.div>
      )}
    </motion.button>
  );
}
