"use client";

/**
 * useSong — loads and plays a song MP3.
 * If the MP3 fails to load, silently fails with no fallback.
 *
 * For letter songs: tracks which songs have been heard in the progress table
 * (subject = 'songs', letter = the letter key). When all 26 letter songs
 * have been played at least once, awards the sound_explorer certificate.
 *
 * Returns: { play, stop, isPlaying, checkExists }
 */
import { useState, useRef, useCallback } from "react";
import type { SongData } from "@/lib/audio/songs";
import { audioManager } from "@/lib/audio/audioManager";
import { awardCertificate } from "@/lib/awardCertificate";
import { checkSongExists } from "@/lib/audio/checkSongExists";

const ALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function useSong(childId?: string | null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const playedLetters = useRef<Set<string>>(new Set());
  const existsCache = useRef<Map<string, boolean>>(new Map());

  const stop = useCallback(() => {
    audioManager.stop();
    setIsPlaying(false);
  }, []);

  const checkExists = useCallback(async (audioPath: string): Promise<boolean> => {
    if (existsCache.current.has(audioPath)) {
      return existsCache.current.get(audioPath) ?? false;
    }
    const exists = await checkSongExists(audioPath);
    existsCache.current.set(audioPath, exists);
    return exists;
  }, []);

  const play = useCallback(async (song: SongData) => {
    stop();
    setIsPlaying(true);

    try {
      await audioManager.play(song.audioPath);
    } catch {
      // No fallback — just do nothing if file doesn't exist
      setIsPlaying(false);
    }

    // Track letter song plays for sound_explorer certificate
    // Letter songs have single uppercase letter keys (A, B, C...)
    if (childId && song.key.length === 1 && ALL_LETTERS.includes(song.key.toUpperCase())) {
      const letter = song.key.toUpperCase();
      playedLetters.current.add(letter);

      // Record in progress table (subject = 'songs')
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          language: "english",
          letter,
          subject: "songs",
          patch: { heard_count: 1 },
        }),
      }).catch(() => {});

      // Check if all 26 letter songs have been played this session
      if (playedLetters.current.size >= 26) {
        awardCertificate(childId, "sound_explorer");
      }
    }
  }, [stop, childId]);

  return { play, stop, isPlaying, checkExists };
}


