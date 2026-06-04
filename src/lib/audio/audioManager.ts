/**
 * Singleton audio manager — ensures only one sound plays at a time.
 * Used by letter sounds, songs, number sounds, and all other audio in the app.
 */

let currentAudio: HTMLAudioElement | null = null;

export const audioManager = {
  /**
   * Play an audio file, stopping any currently playing audio first.
   */
  play(src: string, onEnd?: () => void): void {
    // Stop whatever is currently playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }

    // Play new audio
    currentAudio = new Audio(src);
    currentAudio.onended = () => {
      currentAudio = null;
      onEnd?.();
    };

    currentAudio.onerror = () => {
      currentAudio = null;
      onEnd?.();
    };

    currentAudio.play().catch(() => {
      // File not found or playback error — caller should handle fallback
      currentAudio = null;
      onEnd?.();
    });
  },

  /**
   * Stop any currently playing audio.
   */
  stop(): void {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  },

  /**
   * Check if audio is currently playing.
   */
  isPlaying(): boolean {
    return currentAudio !== null && !currentAudio.paused;
  },
};
