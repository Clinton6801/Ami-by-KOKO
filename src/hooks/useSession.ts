"use client";

/**
 * useSession — tracks time spent in each mode.
 * Writes a session row on mount, updates ended_at on unmount.
 */
import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AppMode } from "@/types";

export function useSession(childId: string | null | undefined, mode: AppMode) {
  const supabase = createClient();
  const sessionId = useRef<string | null>(null);

  useEffect(() => {
    if (!childId) return;

    let cancelled = false;

    async function startSession() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("sessions")
        .insert({ child_id: childId, mode })
        .select("id")
        .single();

      if (!cancelled && data) {
        sessionId.current = data.id;
      }
    }

    startSession();

    return () => {
      cancelled = true;
      if (sessionId.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from("sessions")
          .update({ ended_at: new Date().toISOString() })
          .eq("id", sessionId.current)
          .then(() => {});
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, mode]);
}
