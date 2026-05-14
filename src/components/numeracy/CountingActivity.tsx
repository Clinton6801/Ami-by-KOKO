"use client";

/**
 * CountingActivity — tap each fruit to count it.
 *
 * - Shows N dull/greyed fruit images (N = the number being learnt)
 * - Child taps each one — it lights up with its sequential count number
 * - Kòkò speaks the running count on each tap
 * - Progress dots fill as each fruit is tapped
 * - When all are tapped → celebration
 * - Retry button resets everything
 */
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface CountingActivityProps {
  count: number;
  imageUrl: string;
  itemName: string;
  onComplete?: () => void;
}

function speakNumber(n: number) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(String(n));
  u.lang = "en-NG";
  u.rate = 0.8;
  u.pitch = 1.3;
  window.speechSynthesis.speak(u);
}

export default function CountingActivity({
  count,
  imageUrl,
  itemName,
  onComplete,
}: CountingActivityProps) {
  // tapOrder[i] = which tap number this fruit was (1-based), or 0 if not tapped
  const [tapOrder, setTapOrder] = useState<number[]>(Array(count).fill(0));
  const [done, setDone] = useState(false);
  // Use a ref for the running tap counter so it's always current inside handlers
  const tapCountRef = useRef(0);

  const tappedCount = tapOrder.filter(n => n > 0).length;

  function handleTap(index: number) {
    if (tapOrder[index] > 0 || done) return;

    tapCountRef.current += 1;
    const thisNumber = tapCountRef.current;

    setTapOrder(prev => {
      const next = [...prev];
      next[index] = thisNumber;
      return next;
    });

    speakNumber(thisNumber);

    if (thisNumber === count) {
      setTimeout(() => {
        setDone(true);
        onComplete?.();
      }, 700);
    }
  }

  function retry() {
    tapCountRef.current = 0;
    setTapOrder(Array(count).fill(0));
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
          count <= 3 ? "max-w-[220px]" :
          count <= 6 ? "max-w-[300px]" : "max-w-[360px]"
        }`}
      >
        {tapOrder.map((tapNum, i) => {
          const lit = tapNum > 0;
          return (
            <motion.button
              key={i}
              onClick={() => handleTap(i)}
              disabled={lit || done}
              whileTap={!lit ? { scale: 0.82 } : {}}
              animate={lit ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`relative rounded-2xl p-2 transition-colors ${
                lit
                  ? "bg-amber-100 shadow-md shadow-amber-200 cursor-default"
                  : "bg-stone-100 hover:bg-stone-200 active:bg-stone-300 cursor-pointer"
              }`}
              style={{ width: 68, height: 68 }}
              aria-label={`${itemName} ${i + 1}${lit ? `, counted as ${tapNum}` : ", tap to count"}`}
            >
              {/* Fruit image */}
              <div className="relative w-full h-full">
                <Image
                  src={imageUrl}
                  alt={itemName}
                  fill
                  className={`object-contain transition-all duration-300 ${
                    lit ? "opacity-100" : "opacity-20 grayscale"
                  }`}
                  sizes="52px"
                  unoptimized
                />
              </div>

              {/* Sequential number badge */}
              {lit && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-amber-500 text-white text-xs font-extrabold rounded-full flex items-center justify-center shadow-md border-2 border-white"
                >
                  {tapNum}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Progress dots + counter */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5 flex-wrap justify-center max-w-[200px]">
          {Array(count).fill(null).map((_, i) => (
            <motion.div
              key={i}
              animate={{ scale: i < tappedCount ? [1, 1.3, 1] : 1 }}
              transition={{ duration: 0.2 }}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                i < tappedCount ? "bg-amber-500" : "bg-stone-200"
              }`}
            />
          ))}
        </div>
        <span className="text-xl font-extrabold text-stone-700 min-w-[48px]">
          {tappedCount}/{count}
        </span>
      </div>

      {/* Celebration */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-full max-w-xs bg-green-50 border-2 border-green-300 rounded-3xl p-5 text-center"
          >
            <p className="text-4xl mb-2">🎉</p>
            <p className="font-extrabold text-green-700 text-xl">
              {count} {itemName}{count !== 1 ? "s" : ""}!
            </p>
            <p className="text-green-600 text-sm mt-1">
              You counted them all correctly!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Retry */}
      <button
        onClick={retry}
        className="flex items-center gap-2 text-sm font-semibold text-stone-500 bg-stone-100 hover:bg-stone-200 px-5 py-2.5 rounded-2xl transition active:scale-95"
      >
        🔄 Try again
      </button>
    </div>
  );
}
