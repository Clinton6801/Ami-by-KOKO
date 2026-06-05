/**
 * Web Speech API wrapper — fallback TTS when pre-recorded clips aren't available.
 * Primary audio source is always the pre-recorded native speaker clips.
 */
import type { Language } from "@/types";
import { audioManager } from "./audioManager";

const LANGUAGE_BCP47: Record<Language, string> = {
  english: "en-NG", // Nigerian English accent preferred
  yoruba: "yo",
  igbo: "ig",
  hausa: "ha",
  french: "fr-FR", // French pronunciation
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
    let resolved = false;

    // Create audio element to check if file exists before playing
    const testAudio = new Audio(url);
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    }, 1000); // 1 second should be enough to detect 404

    testAudio.oncanplay = () => {
      clearTimeout(timeout);
      if (!resolved) {
        resolved = true;
        // File exists, now play it
        audioManager.play(url, () => {
          // Audio finished playing
        });
        resolve(true);
      }
    };

    testAudio.onerror = () => {
      clearTimeout(timeout);
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    };

    // Start loading the audio
    testAudio.load();
  });
}

async function speakWithTTS(letter: string, language: Language): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      resolve();
      return;
    }

    // Stop any playing audio before starting TTS
    audioManager.stop();

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

