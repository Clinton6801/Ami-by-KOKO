/**
 * Web Speech API wrapper — fallback TTS when pre-recorded clips aren't available.
 * Primary audio source is always the pre-recorded native speaker clips.
 */
import type { Language } from "@/types";

const LANGUAGE_BCP47: Record<Language, string> = {
  english: "en-NG", // Nigerian English accent preferred
  yoruba: "yo",
  igbo: "ig",
  hausa: "ha",
};

interface PlayLetterSoundOptions {
  letter: string;
  language: Language;
  /** If provided, attempts to play the pre-recorded clip first */
  audioClipUrl?: string;
}

/**
 * Plays the sound for a letter.
 * Strategy: pre-recorded clip → Web Speech API fallback.
 */
export async function playLetterSound({
  letter,
  language,
  audioClipUrl,
}: PlayLetterSoundOptions): Promise<void> {
  // 1. Try pre-recorded clip
  if (audioClipUrl) {
    const played = await tryPlayClip(audioClipUrl);
    if (played) return;
  }

  // 2. Fall back to Web Speech API
  await speakWithTTS(letter, language);
}

async function tryPlayClip(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    audio.onended = () => resolve(true);
    audio.onerror = () => resolve(false); // clip not found — fall back to TTS
    audio.play().catch(() => resolve(false));
  });
}

async function speakWithTTS(letter: string, language: Language): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(letter);
    utterance.lang = LANGUAGE_BCP47[language];
    utterance.rate = 0.8; // slightly slower for children
    utterance.pitch = 1.2; // slightly higher — Kòkò's voice
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.cancel(); // cancel any ongoing speech
    window.speechSynthesis.speak(utterance);
  });
}
