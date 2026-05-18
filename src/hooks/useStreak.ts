"use client";

/**
 * useStreak — calculates the current daily learning streak for a child.
 *
 * Logic:
 * - Fetch all distinct session dates for the child
 * - Walk backwards from today counting consecutive days with at least one session
 * - If today has no session yet, check if yesterday does (streak still alive)
 */
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CertificateType } from "@/types";

export function useStreak(childId: string | null | undefined) {
  const supabase = createClient();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);
  const [certificateToAward, setCertificateToAward] = useState<CertificateType | null>(null);

  useEffect(() => {
    if (!childId) return;
    let cancelled = false;

    async function calculate() {
      setLoading(true);

      // Fetch all session start dates for this child
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("sessions")
        .select("started_at")
        .eq("child_id", childId)
        .order("started_at", { ascending: false });

      if (cancelled || !data) { setLoading(false); return; }

      // Build a Set of unique date strings "YYYY-MM-DD"
      const activeDays = new Set<string>(
        (data as { started_at: string }[]).map(s =>
          new Date(s.started_at).toISOString().slice(0, 10)
        )
      );

      // Count consecutive days backwards from today
      let count = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // If today has no session, start checking from yesterday
      // (streak is still alive if yesterday was active)
      const todayStr = today.toISOString().slice(0, 10);
      const checkFrom = activeDays.has(todayStr) ? today : (() => {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        return y;
      })();

      const cursor = new Date(checkFrom);
      while (true) {
        const dateStr = cursor.toISOString().slice(0, 10);
        if (!activeDays.has(dateStr)) break;
        count++;
        cursor.setDate(cursor.getDate() - 1);
      }

      if (!cancelled) {
        setStreak(count);
        setLoading(false);
      }
    }

    calculate();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  // Check for 7-day streak certificate
  useEffect(() => {
    if (streak >= 7) {
      setCertificateToAward('weekly_streak');
    }
  }, [streak]);

  return { streak, loading, certificateToAward, setCertificateToAward };
}
