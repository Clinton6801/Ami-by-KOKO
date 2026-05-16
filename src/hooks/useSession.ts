"use client";

/**
 * useSession — tracks time spent in each mode.
 * Writes a session row on mount via /api/sessions (service role),
 * updates ended_at on unmount.
 *
 * Uses the API route instead of the browser client so school children
 * (who have no parent_id) are not blocked by RLS.
 */
import { useEffect, useRef } from "react";
import type { AppMode } from "@/types";

export function useSession(childId: string | null | undefined, mode: AppMode) {
  const sessionId = useRef<string | null>(null);

  useEffect(() => {
    if (!childId) return;

    let cancelled = false;

    async function startSession() {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, mode }),
      });
      if (!cancelled && res.ok) {
        const json = await res.json();
        sessionId.current = json.sessionId ?? null;
      }
    }

    startSession();

    return () => {
      cancelled = true;
      if (sessionId.current) {
        // Fire-and-forget — best effort on unmount
        fetch("/api/sessions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionId.current }),
        });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, mode]);
}
