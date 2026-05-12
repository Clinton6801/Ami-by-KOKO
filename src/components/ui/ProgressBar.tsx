"use client";

/**
 * ProgressBar — shows letter mastery progress for a child.
 */
import { motion } from "framer-motion";

interface ProgressBarProps {
  /** 0–100 */
  value: number;
  label?: string;
}

export default function ProgressBar({ value, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex justify-between text-sm text-stone-600">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-4 w-full overflow-hidden rounded-full bg-stone-100"
      >
        <motion.div
          className="h-full rounded-full bg-amber-400"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
