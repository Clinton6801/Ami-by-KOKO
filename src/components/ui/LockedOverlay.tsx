"use client";

/**
 * LockedOverlay — frosted glass overlay for locked content cards.
 * Shows sparkle instead of lock, Kòkò peeking from corner, shimmer animation.
 */
import { motion } from "framer-motion";

interface LockedOverlayProps {
  onTap: () => void;
  label?: string;
}

export default function LockedOverlay({ onTap, label = "Unlock with Explorer" }: LockedOverlayProps) {
  return (
    <motion.button
      onClick={onTap}
      whileTap={{ scale: 0.97 }}
      className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col items-center justify-center z-10"
      style={{
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
      }}
      aria-label={label}
    >
      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 1 }}
      />

      {/* Kòkò peeking from top-right */}
      <motion.span
        className="absolute top-0.5 right-1 text-base leading-none"
        animate={{ y: [0, -2, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        🦜
      </motion.span>

      {/* Sparkle + label */}
      <div className="flex flex-col items-center gap-0.5">
        <motion.span
          className="text-lg"
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          ✨
        </motion.span>
        <span className="text-[9px] font-bold text-amber-700 text-center leading-tight px-1">
          {label}
        </span>
      </div>
    </motion.button>
  );
}
