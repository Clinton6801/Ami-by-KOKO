"use client";

/**
 * useAccess — client-side hook to check paid access status.
 * Fetches subscription and school data for the active child.
 * Also exposes isStudent so pages can show the right locked UI.
 *
 * REAL-TIME UPDATES:
 * Listens to Supabase real-time changes on the subscriptions table.
 * When a new subscription is created (after payment), the UI updates instantly
 * without needing a page reload.
 */
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Child } from "@/types";

export interface AccessState {
  hasPaid: boolean;
  loading: boolean;
  /** True when the logged-in user is a student account (@amibykoko.app) */
  isStudent: boolean;
}

export function useAccess(activeChild: Child | null): AccessState {
  const supabase = createClient();
  const [hasPaid, setHasPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let userId: string | null = null;

    async function check() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      userId = user.id;
      const studentAccount = user.email?.endsWith("@amibykoko.app") ?? false;
      if (!cancelled) setIsStudent(studentAccount);

      // School child with active school subscription → full access
      if (activeChild?.school_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: school } = await (supabase as any)
          .from("schools")
          .select("subscription_active")
          .eq("id", activeChild.school_id)
          .single();

        if (school?.subscription_active) {
          if (!cancelled) { setHasPaid(true); setLoading(false); }
          return;
        }
      }

      // Student with inactive school subscription — no parent sub check needed
      if (studentAccount) {
        if (!cancelled) { setHasPaid(false); setLoading(false); }
        return;
      }

      // Check parent subscription
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: sub } = await (supabase as any)
        .from("subscriptions")
        .select("active, expires_at")
        .eq("profile_id", user.id)
        .eq("active", true)
        .maybeSingle();

      const now = new Date().toISOString();
      const paid = !!sub && (!sub.expires_at || sub.expires_at > now);

      if (!cancelled) { setHasPaid(paid); setLoading(false); }
    }

    check();

    // Set up real-time listener for subscription changes
    // This triggers when the webhook creates a new subscription after payment
    let subscription: ReturnType<typeof supabase.channel> | null = null;

    async function setupRealtimeListener() {
      if (!userId) return;

      subscription = supabase
        .channel(`subscription-changes-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*", // INSERT, UPDATE, DELETE
            schema: "public",
            table: "subscriptions",
            filter: `profile_id=eq.${userId}`,
          },
          async () => {
            // Subscription changed — re-check access
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: sub } = await (supabase as any)
              .from("subscriptions")
              .select("active, expires_at")
              .eq("profile_id", user.id)
              .eq("active", true)
              .maybeSingle();

            const now = new Date().toISOString();
            const paid = !!sub && (!sub.expires_at || sub.expires_at > now);

            if (!cancelled) {
              console.log("[useAccess] Real-time subscription update detected, hasPaid:", paid);
              setHasPaid(paid);
            }
          }
        )
        .subscribe();
    }

    setupRealtimeListener();

    return () => {
      cancelled = true;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChild?.id, activeChild?.school_id]);

  return { hasPaid, loading, isStudent };
}
