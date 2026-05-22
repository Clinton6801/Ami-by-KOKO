"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { isStudentAccount } from "@/lib/access";
import type { Child } from "@/types";

export function useChild() {
  const supabase = createClient();
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChildren = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    if (isStudentAccount(user.email)) {
      // ── Student account ──────────────────────────────────────────────────
      // Primary: query by auth_user_id — works on any device, no localStorage needed.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: fetchErr } = await (supabase as any)
        .from("children")
        .select("*")
        .eq("auth_user_id", user.id)
        .limit(1)
        .single();

      if (!fetchErr && data) {
        const kid = data as Child;
        setChildren([kid]);
        setActiveChild(kid);
        // Keep localStorage in sync as a convenience cache (not source of truth)
        if (typeof window !== "undefined") {
          localStorage.setItem("activeChildId", kid.id);
        }
      } else {
        // Fallback: try localStorage if DB query failed (e.g. RLS not yet applied)
        const childId = typeof window !== "undefined"
          ? localStorage.getItem("activeChildId")
          : null;

        if (childId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: fallback } = await (supabase as any)
            .from("children")
            .select("*")
            .eq("id", childId)
            .single();

          if (fallback) {
            const kid = fallback as Child;
            setChildren([kid]);
            setActiveChild(kid);
          } else {
            setError(fetchErr?.message ?? "Could not load student record.");
          }
        } else {
          setError(fetchErr?.message ?? "Could not load student record.");
        }
      }
    } else {
      // ── Parent or school admin ───────────────────────────────────────────
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: fetchErr } = await (supabase as any)
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: true });

      if (fetchErr) {
        setError(fetchErr.message);
      } else {
        const kids = (data ?? []) as Child[];
        setChildren(kids);

        const savedId = typeof window !== "undefined"
          ? localStorage.getItem("activeChildId")
          : null;
        const saved = kids.find(c => c.id === savedId);
        setActiveChild(prev => {
          if (prev) {
            const refreshed = kids.find(c => c.id === prev.id);
            return refreshed ?? saved ?? kids[0] ?? null;
          }
          return saved ?? kids[0] ?? null;
        });
      }
    }

    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchChildren(); }, [fetchChildren]);

  function selectChild(child: Child) {
    setActiveChild(child);
    if (typeof window !== "undefined") {
      localStorage.setItem("activeChildId", child.id);
    }
  }

  function updateChild(updated: Child) {
    setChildren(prev => prev.map(c => c.id === updated.id ? updated : c));
    if (activeChild?.id === updated.id) setActiveChild(updated);
  }

  return { children, activeChild, selectChild, updateChild, refresh: fetchChildren, loading, error };
}
