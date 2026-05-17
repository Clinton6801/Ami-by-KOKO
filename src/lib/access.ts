/**
 * Access control helpers — determines what content a user can access
 * based on their subscription status and school membership.
 *
 * Free tier limits:
 * - Letters: A–F only
 * - Numbers: 1–3 only
 * - World: Body Parts category only
 * - Story: first 3 shards (A, B, C)
 * - DJ Booth: first 3 pads (A, B, C)
 * - Languages: English only
 *
 * School children with an active school subscription get full access.
 */

import type { Subscription } from "@/types";

interface School {
  subscription_active: boolean;
}

interface Child {
  school_id?: string | null;
}

interface AccessContext {
  subscription: Subscription | null;
  child: Child | null;
  school: School | null;
}

/** Returns true if the user has full paid access */
export function hasPaidAccess(ctx: AccessContext): boolean {
  // School child with active school subscription
  if (ctx.child?.school_id && ctx.school?.subscription_active) return true;
  // Active parent subscription
  if (ctx.subscription?.active) return true;
  return false;
}

// ─── Per-feature free checks ──────────────────────────────────────────────────

/** Letters A–F are free; G–Z require paid access */
export function isLetterFree(letter: string): boolean {
  return ["a","b","c","d","e","f"].includes(letter.toLowerCase());
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
