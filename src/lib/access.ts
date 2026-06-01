"use client";

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
import { isLetterFree, isNumberFree, isCategoryFree, isShardFree, isPadFree } from "./access-utils";

// Re-export pure utility functions so existing imports still work
export { isLetterFree, isNumberFree, isCategoryFree, isShardFree, isPadFree };

/**
 * Returns true if the email belongs to a student account.
 * Student accounts use the synthetic @amibykoko.app domain.
 */
export function isStudentAccount(email?: string | null): boolean {
  return email?.endsWith("@amibykoko.app") ?? false;
}

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
