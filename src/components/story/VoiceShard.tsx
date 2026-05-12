"use client";

/**
 * VoiceShard — a single shard in the story arc.
 * Glows when collected; grey when not yet found.
 */
import { motion } from "framer-motion";

interface VoiceShardProps {
  letter: string;
  collected: boolean;
}

export default function VoiceShard({ letter, collected }: VoiceShardProps) {
  return (
    <motion.div
      role="listitem"
      aria-label={`Shard ${letter}${collected ? ", collected" : ", not yet found"}`}
      animate={
        collected
          ? { scale: [1, 1.15, 1], opacity: 1 }
          : { scale: 1, opacity: 0.4 }
      }
      transition={{ duration: 0.5 }}
      className={`
        flex aspect-square items-center justify-center rounded-xl text-lg font-bold
        ${collected
          ? "bg-amber-400 text-white shadow-md shadow-amber-200"
          : "bg-stone-200 text-stone-400"
        }
      `}
    >
      {collected ? letter : "?"}
    </motion.div>
  );
}
