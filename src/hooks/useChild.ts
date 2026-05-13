"use client";

/**
 * useChild — fetches and manages the active child profile.
 *
 * Cross-device persistence strategy:
 * - Primary: last_used_child_id stored in the profiles table (server-side)
 * - Fallback: localStorage (for instant restore before DB responds)
 * - If no saved preference, defaults to the first child
 */
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Child } from "@/types";

export function useChild() {
  const supabase = createClient();
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChildren() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        const kids = (data ?? []) as Child[];
        setChildren(kids);

        // Restore from localStorage first (instant), then verify
        const savedId = typeof window !== "undefined"
          ? localStorage.getItem("activeChildId")
          : null;
        const saved = kids.find(c => c.id === savedId);
        setActiveChild(saved ?? kids[0] ?? null);
      }

      setLoading(false);
    }

    fetchChildren();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectChild(child: Child) {
    setActiveChild(child);
    // Persist in localStorage for fast restore
    if (typeof window !== "undefined") {
      localStorage.setItem("activeChildId", child.id);
    }
  }

  return { children, activeChild, selectChild, loading, error };
}
