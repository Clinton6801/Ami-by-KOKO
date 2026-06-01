/**
 * Access control utilities — pure functions for checking free vs paid content.
 * These are server-safe and can be called from both Server and Client Components.
 *
 * Free tier limits:
 * - Letters: A–F only
 * - Numbers: 1–3 only
 * - World: Body Parts category only
 * - Story: first 3 shards (A, B, C)
 * - DJ Booth: first 3 pads (A, B, C)
 * - Languages: English only
 */

/** Letters A–F are free; G–Z require paid access */
export function isLetterFree(letter: string): boolean {
  return ["a", "b", "c", "d", "e", "f"].includes(letter.toLowerCase());
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
