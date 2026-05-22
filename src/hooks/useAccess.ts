"use client";

/**
 * useAccess — client-side hook to check paid access status.
 * Fetches subscription and school data for the active child.
 * Also exposes isStudent so pages can show the right locked UI.
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

    async function check() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

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
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChild?.id, activeChild?.school_id]);

  return { hasPaid, loading, isStudent };
}
