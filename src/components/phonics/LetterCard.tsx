"use client";

/**
 * LetterCard — tappable card in the A–Z phonics grid.
 * Triggers Kòkò audio on tap.
 */
import { motion } from "framer-motion";
import Link from "next/link";
import type { Language } from "@/types";

interface LetterCardProps {
  letter: string;
  language: Language;
  mastered?: boolean;
}

export default function LetterCard({
  letter,
  language,
  mastered = false,
}: LetterCardProps) {
  return (
    <Link href={`/phonics/${language}/${letter.toLowerCase()}`}>
      <motion.div
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        className={`
          focus-ring flex aspect-square cursor-pointer items-center justify-center
          rounded-2xl text-2xl font-bold text-white shadow-sm transition
          ${mastered ? "bg-green-500" : "bg-amber-400 hover:bg-amber-500"}
        `}
        aria-label={`Letter ${letter}${mastered ? ", mastered" : ""}`}
      >
        {letter}
        {mastered && (
          <span className="absolute -top-1 -right-1 text-sm" aria-hidden>
            ⭐
          </span>
        )}
      </motion.div>
    </Link>
  );
}
