"use client";

import { motion } from "framer-motion";
import { useSong } from "@/hooks/useSong";
import { useChild } from "@/hooks/useChild";
import type { SongData } from "@/lib/audio/songs";
import { useEffect, useState } from "react";

interface SongButtonProps {
  song: SongData;
  label?: string;
  locked?: boolean;
  onLockedTap?: () => void;
  soundPlaying?: boolean;
}

export default function SongButton({ song, label, locked, onLockedTap, soundPlaying }: SongButtonProps) {
  const { activeChild } = useChild();
  const { play, stop, isPlaying, checkExists } = useSong(activeChild?.id);
  const [songExists, setSongExists] = useState<boolean | null>(null);

  useEffect(() => {
    checkExists(song.audioPath).then(setSongExists);
  }, [song.audioPath, checkExists]);

  function handleClick() {
    if (songExists === false) return; // Do nothing if song doesn't exist
    if (locked) { onLockedTap?.(); return; }
    if (isPlaying) { stop(); return; }
    play(song);
  }

  if (locked) {
    return (
      <button
        onClick={handleClick}
        disabled={soundPlaying}
        className={`w-full max-w-sm bg-white rounded-3xl shadow-md ring-1 ring-stone-100 p-4 flex items-center gap-4 transition opacity-70 ${soundPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
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

  if (songExists === false) {
    return (
      <button
        disabled
        className="w-full max-w-sm bg-stone-100 rounded-3xl shadow-md ring-1 ring-stone-200 p-4 flex items-center gap-4 opacity-60 cursor-not-allowed"
        aria-label={`${label ?? "Sing with Kòkò"} — coming soon`}
      >
        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-3xl opacity-50">🦜</div>
        <div className="flex-1 text-left">
          <p className="font-bold text-stone-500 text-sm">{label ?? "🎵 Sing with Kòkò"}</p>
          <p className="text-stone-400 text-xs">Coming soon</p>
        </div>
        <span className="text-xs font-bold text-stone-400 bg-stone-200 px-2 py-1 rounded-full">Soon</span>
      </button>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={soundPlaying}
      whileTap={{ scale: soundPlaying ? 1 : 0.93 }}
      className={`w-full max-w-sm bg-white rounded-3xl shadow-md ring-1 ring-violet-100 p-4 flex items-center gap-4 transition hover:shadow-lg ${soundPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          {soundPlaying ? "Letter sound is playing…" : isPlaying ? "Tap to stop" : "Tap to hear the song"}
        </p>
      </div>

      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0 transition ${isPlaying ? "bg-violet-400" : "bg-violet-500"}`}>
        {isPlaying ? "⏹" : "🎵"}
      </div>
    </motion.button>
  );
}
