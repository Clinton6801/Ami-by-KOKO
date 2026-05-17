/**
 * Server-side access context helper.
 * Checks subscription status and school membership to determine
 * whether the current user has paid access.
 *
 * Usage in Server Components:
 *   const { hasPaid, subscription } = await getAccessContext(childId)
 */
import { createClient } from "@/lib/supabase/server";

export interface AccessContext {
  hasPaid: boolean;
  subscription: {
    id: string;
    plan: string;
    active: boolean;
    expires_at: string | null;
  } | null;
  school: { subscription_active: boolean } | null;
}

export async function getAccessContext(childId?: string | null): Promise<AccessContext> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { hasPaid: false, subscription: null, school: null };

  // Students don't have a profile — check via child's school
  const isStudent = user.user_metadata?.role === "student";
  const effectiveChildId = childId ?? (isStudent ? user.user_metadata?.child_id : null);

  // Check parent subscription
  let subscription = null;
  if (!isStudent) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("subscriptions")
      .select("id, plan, active, expires_at")
      .eq("profile_id", user.id)
      .eq("active", true)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    subscription = data ?? null;
  }

  // Check if child belongs to an active school
  let school = null;
  if (effectiveChildId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: child } = await (supabase as any)
      .from("children")
      .select("school_id, schools(subscription_active)")
      .eq("id", effectiveChildId)
      .maybeSingle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (child?.school_id && (child as any).schools?.subscription_active) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      school = (child as any).schools as { subscription_active: boolean };
    }
  }

  const hasPaid = !!subscription || !!school;

  return { hasPaid, subscription, school };
}
