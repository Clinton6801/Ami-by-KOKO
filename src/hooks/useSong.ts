"use client";

/**
 * useSong — loads and plays a song MP3.
 * Falls back to Web Speech API TTS reading the lyrics if MP3 not available.
 * Returns: { play, stop, isPlaying, hasClip }
 */
import { useState, useRef, useCallback } from "react";
import type { SongData } from "@/lib/audio/songs";

export function useSong() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasClip, setHasClip] = useState<boolean | null>(null); // null = unknown
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(async (song: SongData) => {
    // Stop anything currently playing
    stop();
    setIsPlaying(true);

    // 1. Try the pre-recorded MP3
    const played = await tryPlayClip(song.audioPath, () => {
      setIsPlaying(false);
      audioRef.current = null;
    }, (audio) => {
      audioRef.current = audio;
    });

    if (played) {
      setHasClip(true);
      return;
    }

    // 2. Fall back to TTS
    setHasClip(false);
    await speakLyrics(song.lyrics);
    setIsPlaying(false);
  }, [stop]);

  return { play, stop, isPlaying, hasClip };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tryPlayClip(
  url: string,
  onEnd: () => void,
  onAudio: (audio: HTMLAudioElement) => void
): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    audio.oncanplaythrough = () => {
      onAudio(audio);
      audio.play().catch(() => resolve(false));
      resolve(true);
    };
    audio.onended = onEnd;
    audio.onerror = () => resolve(false);
    // Trigger load
    audio.load();
    // Timeout — if no response in 1.5s, assume clip doesn't exist
    setTimeout(() => resolve(false), 1500);
  });
}

function speakLyrics(lyrics: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(lyrics);
    u.lang = "en-NG";
    u.rate = 0.85;
    u.pitch = 1.2;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}
