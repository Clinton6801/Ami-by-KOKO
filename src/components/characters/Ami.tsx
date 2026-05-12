"use client";

/**
 * Àmì character component — the child guide.
 * Swap the emoji placeholder for an SVG/Lottie illustration when assets are ready.
 */
import { motion } from "framer-motion";

interface AmiProps {
  /** Controls whether Àmì plays her greeting animation */
  greeting?: boolean;
  className?: string;
}

export default function Ami({ greeting = false, className = "" }: AmiProps) {
  return (
    <motion.div
      className={`flex items-center justify-center ${className}`}
      animate={greeting ? { y: [0, -8, 0] } : {}}
      transition={{ duration: 1.2, repeat: greeting ? Infinity : 0, ease: "easeInOut" }}
      aria-label="Àmì"
      role="img"
    >
      {/* TODO: Replace with Àmì SVG/Lottie illustration */}
      <span className="text-7xl select-none">👧🏾</span>
    </motion.div>
  );
}
