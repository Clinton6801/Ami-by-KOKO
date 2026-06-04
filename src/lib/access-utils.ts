/**
 * Access control utilities — pure functions for checking free vs paid content.
 * These are server-safe and can be called from both Server and Client Components.
 * NO "use client" directive — this is a pure server module.
 *
 * Free tier limits:
 * - English letters: A–F only
 * - Yorùbá letters: A, B, D, E, Ẹ, F only (first 6 of 25)
 * - French letters: A–F only
 * - Numbers: 1–3 only
 * - World: Body Parts category only
 * - Story: first 3 shards (A, B, C)
 * - DJ Booth: first 3 pads (A, B, C)
 * - Languages: English only (Yorùbá and French require paid access)
 */

/** 
 * Check if a letter is free based on language.
 * English & French: A–F are free
 * Yorùbá: A, B, D, E, Ẹ, F are free (first 6 of 25 letters)
 */
export function isLetterFree(letter: string, language: string = "english"): boolean {
  const lowerLetter = letter.toLowerCase();
  
  if (language === "yoruba") {
    // Yorùbá free letters: A, B, D, E, Ẹ, F
    return ["a", "b", "d", "e", "ẹ", "f"].includes(lowerLetter);
  }
  
  // English and French: A–F are free
  return ["a", "b", "c", "d", "e", "f"].includes(lowerLetter);
}

/** Numbers 1–3 are free; 4–10 require paid access */
export function isNumberFree(num: number | string): boolean {
  return [1, 2, 3].includes(Number(num));
}

/** Body Parts category is free; all others require paid access */
export function isCategoryFree(category: string): boolean {
  return category === "body";
}

/** First 3 story shards (index 0–2) are free */
export function isShardFree(index: number): boolean {
  return index < 3;
}

/** First 3 DJ pads (index 0–2) are free */
export function isPadFree(index: number): boolean {
  return index < 3;
}
