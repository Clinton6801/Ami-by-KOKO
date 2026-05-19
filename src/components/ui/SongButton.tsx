"use client";

import { motion } from "framer-motion";
import { useSong } from "@/hooks/useSong";
import { useChild } from "@/hooks/useChild";
import type { SongData } from "@/lib/audio/songs";

interface SongButtonProps {
  song: SongData;
  label?: string;
  locked?: boolean;
  onLockedTap?: () => void;
}

export default function SongButton({ song, label, locked, onLockedTap }: SongButtonProps) {
  const { activeChild } = useChild();
  const { play, stop, isPlaying } = useSong(activeChild?.id);

  function handleClick() {
    if (locked) { onLockedTap?.(); return; }
    if (isPlaying) { stop(); return; }
    play(song);
  }

  if (locked) {
    return (
      <button
        onClick={handleClick}
        className="w-full max-w-sm bg-white rounded-3xl shadow-md ring-1 ring-stone-100 p-4 flex items-center gap-4 transition opacity-70"
        aria-label={`${label ?? "Sing with Kòkò"} — locked`}
      >
        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-3xl">🔒</div>
        <div className="flex-1 text-left">
          <p className="font-bold text-stone-800 text-sm">{label ?? "🎵 Sing with Kòkò"}</p>
          <p className="text-stone-400 text-xs">Unlock Explorer to sing along</p>
        </div>
        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Explorer</span>
      </button>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.93 }}
      className="w-full max-w-sm bg-white rounded-3xl shadow-md ring-1 ring-violet-100 p-4 flex items-center gap-4 transition hover:shadow-lg"
      aria-label={isPlaying ? "Stop song" : (label ?? "Sing with Kòkò")}
    >
      {/* Kòkò dancing emoji */}
      <motion.div
        className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-3xl"
        animate={isPlaying ? { rotate: [-8, 8, -8], scale: [1, 1.1, 1] } : { rotate: 0, scale: 1 }}
        transition={{ repeat: isPlaying ? Infinity : 0, duration: 0.6 }}
      >
        🦜
      </motion.div>

      <div className="flex-1 text-left">
        <p className="font-bold text-stone-800 text-sm">
          {isPlaying ? "Kòkò is singing… 🎵" : (label ?? "🎵 Sing with Kòkò")}
        </p>
        <p className="text-stone-500 text-xs">
          {isPlaying ? "Tap to stop" : "Tap to hear the song"}
        </p>
      </div>

      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0 transition ${isPlaying ? "bg-violet-400" : "bg-violet-500"}`}>
        {isPlaying ? "⏹" : "🎵"}
      </div>
    </motion.button>
  );
}
