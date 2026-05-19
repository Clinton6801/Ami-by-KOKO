"use client";

/**
 * useStreak — calculates the current daily learning streak for a child.
 * Awards weekly_streak certificate when streak >= 7.
 */
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { awardCertificate } from "@/lib/awardCertificate";

export function useStreak(childId: string | null | undefined) {
  const supabase = createClient();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!childId) return;
    let cancelled = false;

    async function calculate() {
      setLoading(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("sessions")
        .select("started_at")
        .eq("child_id", childId)
        .order("started_at", { ascending: false });

      if (cancelled || !data) { setLoading(false); return; }

      const activeDays = new Set<string>(
        (data as { started_at: string }[]).map(s =>
          new Date(s.started_at).toISOString().slice(0, 10)
        )
      );

      let count = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

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

        // Award weekly_streak certificate at exactly 7 days (fire-and-forget)
        if (count >= 7 && childId) {
          awardCertificate(childId, "weekly_streak");

          // WhatsApp notification
          fetch("/api/notifications/whatsapp/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ childId, type: "streak", detail: "7-day streak" }),
          }).catch(() => {});
        }
      }
    }

    calculate();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  return { streak, loading };
}
