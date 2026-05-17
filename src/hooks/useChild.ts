"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
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

    // Check user role from metadata
    const role = user.user_metadata?.role;

    if (role === "student") {
      // Student auth — fetch the single child linked to this auth account
      const childId = user.user_metadata?.child_id;
      if (!childId) { setLoading(false); return; }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("children")
        .select("*")
        .eq("id", childId)
        .single();

      if (error) {
        setError(error.message);
      } else if (data) {
        const kid = data as Child;
        setChildren([kid]);
        setActiveChild(kid);
        if (typeof window !== "undefined") {
          localStorage.setItem("activeChildId", kid.id);
        }
      }
    } else {
      // Parent or school admin — fetch children by parent_id
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
