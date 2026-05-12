"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useChild } from "@/hooks/useChild";
import { useProgress } from "@/hooks/useProgress";
import Koko from "@/components/characters/Koko";

const STORY_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const TOTAL = STORY_LETTERS.length;

export default function StoryPage() {
  const { activeChild } = useChild();
  const { masteredLetters } = useProgress(activeChild?.id ?? null, "english");

  const shardsCollected = STORY_LETTERS.filter(l => masteredLetters.includes(l)).length;
  const completed = shardsCollected >= TOTAL;
  const pct = Math.round((shardsCollected / TOTAL) * 100);

  return (
    <div className="flex flex-col items-center gap-6 pb-10">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-stone-800">📖 Kòkò&apos;s Story</h1>
        <p className="text-stone-500 text-sm mt-1 max-w-xs mx-auto">
          Kòkò lost his voice! Master letters A–J to restore it.
        </p>
      </div>

      {/* Kòkò character */}
      <motion.div
        animate={completed ? { scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] } : {}}
        transition={{ repeat: completed ? Infinity : 0, duration: 2 }}
        className="relative"
      >
        <Koko muted={!completed} speaking={completed} />
        {!completed && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-2 -right-2 text-2xl"
          >
            😢
          </motion.div>
        )}
      </motion.div>

      {/* Progress bar */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between text-xs font-semibold text-stone-500 mb-1.5">
          <span>{shardsCollected}/{TOTAL} shards found</span>
          <span>{pct}%</span>
        </div>
        <div className="h-4 bg-stone-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Celebration */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-gradient-to-br from-amber-400 to-orange-400 rounded-3xl p-6 text-center shadow-xl shadow-amber-200"
          >
            <div className="text-5xl mb-2">🎉</div>
            <p className="text-white font-extrabold text-xl">Kòkò has his voice back!</p>
            <p className="text-orange-100 text-sm mt-1">You&apos;re a phonics champion!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shard grid */}
      <div className="w-full max-w-sm">
        <p className="text-xs font-semibold text-stone-500 mb-3 text-center uppercase tracking-wide">
          Voice Shards
        </p>
        <div role="list" aria-label="Voice shards" className="grid grid-cols-5 gap-2 sm:gap-3">
          {STORY_LETTERS.map((letter) => {
            const collected = masteredLetters.includes(letter);
            return (
              <motion.div
                key={letter}
                role="listitem"
                aria-label={`Shard ${letter}${collected ? ", collected" : ", not yet found"}`}
                animate={collected ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.4 }}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-0.5 text-sm font-extrabold shadow-sm
                  ${collected
                    ? "bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-amber-200"
                    : "bg-stone-100 text-stone-400"
                  }`}
              >
                <span className="text-base">{collected ? letter : "?"}</span>
                {collected && <span className="text-xs opacity-80">{letter.toLowerCase()}</span>}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CTA if not done */}
      {!completed && (
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-md ring-1 ring-amber-100 p-5 text-center">
          <p className="text-stone-700 font-semibold mb-3 text-sm">
            {shardsCollected === 0
              ? "Start learning letters to collect shards!"
              : `${TOTAL - shardsCollected} more letter${TOTAL - shardsCollected > 1 ? "s" : ""} to go!`}
          </p>
          <Link
            href="/phonics/english"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-2xl transition shadow-md shadow-amber-200"
          >
            Go to Phonics →
          </Link>
        </div>
      )}

    </div>
  );
}
