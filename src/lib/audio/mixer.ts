/**
 * Web Audio API mixer — powers the DJ Booth.
 *
 * Strategy:
 * 1. Try to load pre-recorded clip from /public/audio/english/[letter].mp3
 * 2. If no clip exists, synthesise a musical tone using Web Audio API
 *    so the DJ Booth always works even without audio assets.
 *
 * Each letter maps to a musical note in a pentatonic scale — sounds
 * pleasant when layered together.
 */

let audioContext: AudioContext | null = null;
const activeNodes = new Map<string, AudioBufferSourceNode | OscillatorNode>();
const bufferCache = new Map<string, AudioBuffer>();

// Pentatonic scale frequencies (Hz) — one per DJ pad letter
const NOTE_FREQUENCIES: Record<string, number> = {
  A: 261.63, // C4
  B: 293.66, // D4
  C: 329.63, // E4
  D: 392.00, // G4
  E: 440.00, // A4
  F: 523.25, // C5
  G: 587.33, // D5
  H: 659.25, // E5
};

function getAudioContext(): AudioContext {
  if (!audioContext) audioContext = new AudioContext();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

async function loadBuffer(url: string): Promise<AudioBuffer | null> {
  if (bufferCache.has(url)) return bufferCache.get(url)!;
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
 * Creates a looping synthesised tone for a letter.
 * Uses a soft sine wave with a slight detune for warmth.
 */
function createSynthLoop(letter: string): OscillatorNode {
  const ctx = getAudioContext();
  const freq = NOTE_FREQUENCIES[letter] ?? 440;

  // Oscillator
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  // Gain envelope — fade in softly
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.1);

  // Slight chorus effect via a detuned oscillator
  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(freq * 1.005, ctx.currentTime);
  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.08, ctx.currentTime);

  osc.connect(gain);
  osc2.connect(gain2);
  gain.connect(ctx.destination);
  gain2.connect(ctx.destination);

  osc.start();
  osc2.start();

  // Store osc2 cleanup on osc
  osc.onended = () => { osc2.stop(); };

  return osc;
}

export async function togglePadSound(letter: string): Promise<void> {
  if (activeNodes.has(letter)) {
    stopPadSound(letter);
    return;
  }

  // Try pre-recorded clip first
  const url = `/audio/english/${letter.toLowerCase()}.mp3`;
  const buffer = await loadBuffer(url);

  if (buffer) {
    const ctx = getAudioContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(ctx.destination);
    source.start();
    activeNodes.set(letter, source);
  } else {
    // Fall back to synthesised tone
    const osc = createSynthLoop(letter);
    activeNodes.set(letter, osc);
  }
}

export function stopPadSound(letter: string): void {
  const node = activeNodes.get(letter);
  if (node) {
    try { node.stop(); } catch { /* already stopped */ }
    activeNodes.delete(letter);
  }
}

export function stopAllSounds(): void {
  activeNodes.forEach((node) => {
    try { node.stop(); } catch { /* already stopped */ }
  });
  activeNodes.clear();
}
