"use client";

/**
 * Kòkò character component — the talking parrot audio avatar.
 * Animates when speaking; shows a "muted" state when voice is lost.
 */
import { motion } from "framer-motion";

interface KokoProps {
  /** Whether Kòkò is currently speaking (triggers beak animation) */
  speaking?: boolean;
  /** Whether Kòkò has lost his voice (Story Mode initial state) */
  muted?: boolean;
  className?: string;
}

export default function Koko({
  speaking = false,
  muted = false,
  className = "",
}: KokoProps) {
  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      animate={
        speaking
          ? { scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }
          : { scale: 1, rotate: 0 }
      }
      transition={{ duration: 0.4, ease: "easeInOut" }}
      aria-label={muted ? "Kòkò — voice lost" : speaking ? "Kòkò is speaking" : "Kòkò"}
      role="img"
    >
      {/* TODO: Replace with Kòkò SVG/Lottie illustration */}
      <span className={`text-7xl select-none ${muted ? "grayscale opacity-60" : ""}`}>
        🦜
      </span>

      {/* Muted indicator */}
      {muted && (
        <span
          className="absolute -bottom-1 -right-1 text-2xl"
          aria-hidden
        >
          🔇
        </span>
      )}
    </motion.div>
  );
}
