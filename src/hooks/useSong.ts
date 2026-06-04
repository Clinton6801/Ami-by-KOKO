"use client";

/**
 * useSong — loads and plays a song MP3.
 * Falls back to Web Speech API TTS reading the lyrics if MP3 not available.
 *
 * For letter songs: tracks which songs have been heard in the progress table
 * (subject = 'songs', letter = the letter key). When all 26 letter songs
 * have been played at least once, awards the sound_explorer certificate.
 *
 * Returns: { play, stop, isPlaying, hasClip }
 */
import { useState, useRef, useCallback } from "react";
import type { SongData } from "@/lib/audio/songs";
import { audioManager } from "@/lib/audio/audioManager";
import { awardCertificate } from "@/lib/awardCertificate";

const ALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function useSong(childId?: string | null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasClip, setHasClip] = useState<boolean | null>(null);
  const playedLetters = useRef<Set<string>>(new Set());

  const stop = useCallback(() => {
    audioManager.stop();
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(async (song: SongData) => {
    stop();
    setIsPlaying(true);

    // 1. Try the pre-recorded MP3
    const played = await tryPlayClip(song.audioPath, () => {
      setIsPlaying(false);
    });

    if (played) {
      setHasClip(true);
    } else {
      // 2. Fall back to TTS
      setHasClip(false);
      await speakLyrics(song.lyrics);
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

  return { play, stop, isPlaying, hasClip };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tryPlayClip(url: string, onEnd: () => void): Promise<boolean> {
  return new Promise((resolve) => {
    audioManager.play(url, () => {
      onEnd();
      resolve(true);
    });

    // Set a timeout in case the audio doesn't fire any event
    const timeout = setTimeout(() => {
      resolve(false);
    }, 2000);

    // Check if file exists by creating a test audio element
    const testAudio = new Audio(url);
    testAudio.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
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
