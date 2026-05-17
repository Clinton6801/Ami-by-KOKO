"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SoundPad from "./SoundPad";
import { togglePadSound, stopAllSounds } from "@/lib/audio/mixer";
import { isPadFree } from "@/lib/access";

const DJ_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const PAD_COLOURS = [
  "from-amber-400 to-orange-400",
  "from-green-400 to-emerald-500",
  "from-rose-400 to-pink-500",
  "from-violet-400 to-purple-500",
  "from-sky-400 to-blue-500",
  "from-yellow-400 to-amber-400",
  "from-teal-400 to-cyan-500",
  "from-fuchsia-400 to-pink-400",
];

interface MixingBoardProps {
  hasPaid?: boolean;
  onLockedTap?: () => void;
}

export default function MixingBoard({ hasPaid = false, onLockedTap }: MixingBoardProps) {
  const [activePads, setActivePads] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => () => { stopAllSounds(); }, []);

  async function handleToggle(letter: string, index: number) {
    if (!hasPaid && !isPadFree(index)) {
      onLockedTap?.();
      return;
    }
    await togglePadSound(letter);
    setActivePads(prev => {
      const next = new Set(prev);
      if (next.has(letter)) { next.delete(letter); } else { next.add(letter); }
      setIsPlaying(next.size > 0);
      return next;
    });
  }

  function handleStopAll() {
    stopAllSounds();
    setActivePads(new Set());
    setIsPlaying(false);
  }

  return (
    <div className="w-full max-w-sm flex flex-col gap-5">
      {/* Status bar */}
      <div className="bg-white rounded-2xl p-3 flex items-center justify-between shadow-sm ring-1 ring-stone-100">
        <div className="flex items-center gap-2">
          <motion.div
            animate={isPlaying ? { scale: [1, 1.3, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className={`w-3 h-3 rounded-full ${isPlaying ? "bg-green-500" : "bg-stone-300"}`}
          />
          <span className="text-sm font-semibold text-stone-600">
            {isPlaying ? `${activePads.size} sound${activePads.size > 1 ? "s" : ""} playing` : "Tap a pad to start"}
          </span>
        </div>
        {isPlaying && (
          <button onClick={handleStopAll}
            className="text-xs font-bold text-red-500 hover:text-red-600 px-3 py-1 rounded-xl bg-red-50 hover:bg-red-100 transition">
            Stop all
          </button>
        )}
      </div>

      {/* Pad grid */}
      <div role="group" aria-label="DJ mixing board" className="grid grid-cols-4 gap-2 sm:gap-3">
        {DJ_LETTERS.map((letter, i) => {
          const locked = !hasPaid && !isPadFree(i);
          return locked ? (
            <button
              key={letter}
              onClick={() => onLockedTap?.()}
              aria-label={`Pad ${letter} — locked`}
              className={`relative aspect-square rounded-2xl bg-gradient-to-br ${PAD_COLOURS[i]} opacity-50 flex flex-col items-center justify-center gap-1 text-white`}
              style={{ minHeight: 64 }}
            >
              <span className="text-xl font-extrabold">{letter}</span>
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center gap-0.5 z-10">
                <span className="text-lg">🔒</span>
                <span className="text-[9px] font-bold text-amber-700">Explorer</span>
              </div>
            </button>
          ) : (
            <SoundPad
              key={letter}
              letter={letter}
              active={activePads.has(letter)}
              colour={PAD_COLOURS[i]}
              onToggle={() => handleToggle(letter, i)}
            />
          );
        })}
      </div>

      <p className="text-center text-xs text-stone-400">
        🎵 Tap pads to layer sounds · Tap again to stop
      </p>
    </div>
  );
}
