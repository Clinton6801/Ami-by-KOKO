"use client";

/**
 * useAssignments — fetches active assignments for a child's school + class.
 * Only relevant when the child has a school_id and class set.
 */
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Assignment, AssignmentProgress, ChildWithClass, CertificateType } from "@/types";

export function useAssignments(child: ChildWithClass | null | undefined) {
  const supabase = createClient();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progress, setProgress] = useState<AssignmentProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [certificateToAward, setCertificateToAward] = useState<CertificateType | null>(null);

  useEffect(() => {
    if (!child?.school_id || !child?.class) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const today = new Date().toISOString().slice(0, 10);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: a } = await (supabase as any)
        .from("assignments")
        .select("*")
        .eq("school_id", child!.school_id)
        .eq("class", child!.class)
        .or(`due_date.gte.${today},due_date.is.null`)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      const aList = (a ?? []) as Assignment[];
      setAssignments(aList);

      if (aList.length > 0) {
        const ids = aList.map(x => x.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: p } = await (supabase as any)
          .from("assignment_progress")
          .select("*")
          .eq("child_id", child!.id)
          .in("assignment_id", ids);
        if (!cancelled) setProgress((p ?? []) as AssignmentProgress[]);
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child?.id, child?.school_id, child?.class]);

  function isCompleted(assignmentId: string) {
    return progress.some(p => p.assignment_id === assignmentId && p.completed);
  }

  // Check for 5 assignments completed certificate
  useEffect(() => {
    const completedCount = progress.filter(p => p.completed).length;
    if (completedCount >= 5) {
      setCertificateToAward('assignment_champion');
    }
  }, [progress]);

  return { assignments, progress, isCompleted, loading, certificateToAward, setCertificateToAward };
}
