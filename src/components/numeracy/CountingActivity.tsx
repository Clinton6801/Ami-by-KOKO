"use client";

/**
 * CountingActivity — tap each fruit to count it.
 *
 * - Shows N dull/greyed fruit images (N = the number being learnt)
 * - Child taps each one — it lights up and Kòkò makes a sound
 * - A counter shows how many have been tapped
 * - When all are tapped → celebration + onComplete fires
 * - Retry button resets everything
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface CountingActivityProps {
  count: number;        // the number to count to (1–10)
  imageUrl: string;     // the fruit/object image to repeat
  itemName: string;     // e.g. "mango"
  onComplete?: () => void;
}

export default function CountingActivity({
  count,
  imageUrl,
  itemName,
  onComplete,
}: CountingActivityProps) {
  const [tapped, setTapped] = useState<boolean[]>(Array(count).fill(false));
  const [done, setDone] = useState(false);

  const tappedCount = tapped.filter(Boolean).length;

  function speakCount(n: number) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(n));
    u.lang = "en-NG";
    u.rate = 0.8;
    u.pitch = 1.3;
    window.speechSynthesis.speak(u);
  }

  const handleTap = useCallback((index: number) => {
    if (tapped[index] || done) return;

    const next = [...tapped];
    next[index] = true;
    setTapped(next);

    const newCount = next.filter(Boolean).length;
    speakCount(newCount);

    if (newCount === count) {
      setTimeout(() => {
        setDone(true);
        onComplete?.();
      }, 600);
    }
  }, [tapped, done, count, onComplete]);

  function retry() {
    setTapped(Array(count).fill(false));
    setDone(false);
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full">

      {/* Instruction */}
      <div className="text-center">
        <p className="font-bold text-stone-700 text-sm">
          Tap each {itemName} to count!
        </p>
        <p className="text-stone-400 text-xs mt-0.5">
          How many {itemName}s are there?
        </p>
      </div>

      {/* Fruit grid */}
      <div
        className={`flex flex-wrap justify-center gap-3 ${
          count <= 3 ? "max-w-[200px]" :
          count <= 6 ? "max-w-[280px]" : "max-w-[340px]"
        }`}
      >
        {tapped.map((lit, i) => (
          <motion.button
            key={i}
            onClick={() => handleTap(i)}
            disabled={lit || done}
            whileTap={!lit ? { scale: 0.85 } : {}}
            animate={lit ? { scale: [1, 1.25, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={`relative rounded-2xl p-2 transition-all ${
              lit
                ? "bg-amber-100 shadow-md shadow-amber-200"
                : "bg-stone-100 hover:bg-stone-200 cursor-pointer"
            }`}
            style={{ width: 64, height: 64 }}
            aria-label={`${itemName} ${i + 1}${lit ? ", counted" : ", tap to count"}`}
          >
            <div className="relative w-full h-full">
              <Image
                src={imageUrl}
                alt={itemName}
                fill
                className={`object-contain transition-all duration-300 ${
                  lit ? "opacity-100" : "opacity-25 grayscale"
                }`}
                sizes="48px"
                unoptimized
              />
            </div>

            {/* Number badge when tapped */}
            {lit && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-sm"
              >
                {tapped.slice(0, i + 1).filter(Boolean).length}
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Live counter */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {Array(count).fill(null).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                i < tappedCount ? "bg-amber-500" : "bg-stone-200"
              }`}
            />
          ))}
        </div>
        <span className="text-lg font-extrabold text-stone-700">
          {tappedCount} / {count}
        </span>
      </div>

      {/* Completion celebration */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-full max-w-xs bg-green-50 border-2 border-green-300 rounded-3xl p-5 text-center"
          >
            <p className="text-4xl mb-2">🎉</p>
            <p className="font-extrabold text-green-700 text-lg">
              {count} {itemName}{count > 1 ? "s" : ""}!
            </p>
            <p className="text-green-600 text-sm mt-0.5">
              You counted them all!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Retry button — always visible */}
      <button
        onClick={retry}
        className="flex items-center gap-2 text-sm font-semibold text-stone-500 bg-stone-100 hover:bg-stone-200 px-4 py-2.5 rounded-2xl transition"
      >
        🔄 Try again
      </button>
    </div>
  );
}
