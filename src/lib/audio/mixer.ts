/**
 * Web Audio API mixer — powers the DJ Booth.
 * Manages an AudioContext, loads sound buffers, and handles looping/layering.
 */

let audioContext: AudioContext | null = null;
const activeNodes = new Map<string, AudioBufferSourceNode>();
const bufferCache = new Map<string, AudioBuffer>();

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

/**
 * Loads an audio buffer from a URL, with caching.
 */
async function loadBuffer(url: string): Promise<AudioBuffer | null> {
  if (bufferCache.has(url)) {
    return bufferCache.get(url)!;
  }

  try {
    const ctx = getAudioContext();
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    bufferCache.set(url, audioBuffer);
    return audioBuffer;
  } catch {
    return null;
  }
}

/**
 * Starts looping a sound for a given letter pad.
 * If the pad is already active, stops it instead (toggle).
 */
export async function togglePadSound(letter: string): Promise<void> {
  if (activeNodes.has(letter)) {
    stopPadSound(letter);
    return;
  }

  const url = `/audio/english/${letter.toLowerCase()}.mp3`;
  const buffer = await loadBuffer(url);
  if (!buffer) return;

  const ctx = getAudioContext();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(ctx.destination);
  source.start();

  activeNodes.set(letter, source);
}

/**
 * Stops a specific pad's looping sound.
 */
export function stopPadSound(letter: string): void {
  const node = activeNodes.get(letter);
  if (node) {
    node.stop();
    activeNodes.delete(letter);
  }
}

/**
 * Stops all active pad sounds.
 */
export function stopAllSounds(): void {
  activeNodes.forEach((node) => node.stop());
  activeNodes.clear();
}
