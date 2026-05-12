"use client";

/**
 * useChild — fetches and manages the active child profile.
 * Stores the selected child ID in localStorage for persistence.
 */
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Child } from "@/types";
import type { Database } from "@/lib/supabase/database.types";

type ChildRow = Database["public"]["Tables"]["children"]["Row"];

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
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: true })
        .returns<ChildRow[]>();

      if (error) {
        setError(error.message);
      } else {
        const kids = (data ?? []) as Child[];
        setChildren(kids);

        const savedId = localStorage.getItem("activeChildId");
        const saved = kids.find((c) => c.id === savedId);
        setActiveChild(saved ?? kids[0] ?? null);
      }

      setLoading(false);
    }

    fetchChildren();
  }, [supabase]);

  function selectChild(child: Child) {
    setActiveChild(child);
    localStorage.setItem("activeChildId", child.id);
  }

  return { children, activeChild, selectChild, loading, error };
}
