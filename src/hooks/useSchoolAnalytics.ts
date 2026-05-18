"use client";

/**
 * useSchoolAnalytics — fetches aggregated progress data for a school.
 * Returns class averages, per-student breakdown, and assignment stats.
 */
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChildWithClass, Assignment, AssignmentProgress } from "@/types";

export interface StudentStat {
  id: string;
  name: string;
  avatar_url: string | null;
  class: string;
  lettersCount: number;
  numbersCount: number;
  worldCount: number;
  assignmentsCompleted: number;
  lastActive: string | null;
}

export interface LetterMastery {
  letter: string;
  count: number;
  pct: number;
}

export interface WeeklyPoint {
  week: string;
  avg: number;
}

export interface SchoolAnalytics {
  totalStudents: number;
  activeThisWeek: number;
  avgLettersMastered: number;
  avgAssignmentCompletion: number;
  studentStats: StudentStat[];
  letterMastery: LetterMastery[];
  weeklyProgress: WeeklyPoint[];
  assignments: (Assignment & { completionRate: number })[];
}

export function useSchoolAnalytics(schoolId: string | null) {
  const supabase = createClient();
  const [analytics, setAnalytics] = useState<SchoolAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);

    // Fetch students
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: students } = await (supabase as any)
      .from("children").select("*").eq("school_id", schoolId);
    const kids = (students ?? []) as ChildWithClass[];

    if (kids.length === 0) {
      setAnalytics({
        totalStudents: 0, activeThisWeek: 0, avgLettersMastered: 0,
        avgAssignmentCompletion: 0, studentStats: [], letterMastery: [],
        weeklyProgress: [], assignments: [],
      });
      setLoading(false);
      return;
    }

    const ids = kids.map(k => k.id);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    // Fetch progress
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: progressRows } = await (supabase as any)
      .from("progress").select("child_id, letter, subject, mastered, last_activity")
      .in("child_id", ids);
    const progress = (progressRows ?? []) as { child_id: string; letter: string; subject: string; mastered: boolean; last_activity: string }[];

    // Fetch sessions for active this week
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sessions } = await (supabase as any)
      .from("sessions").select("child_id").in("child_id", ids).gte("started_at", weekAgo);
    const activeIds = new Set((sessions ?? []).map((s: { child_id: string }) => s.child_id));

    // Fetch assignments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assignmentRows } = await (supabase as any)
      .from("assignments").select("*").eq("school_id", schoolId).order("created_at", { ascending: false });
    const assignments = (assignmentRows ?? []) as Assignment[];

    // Fetch assignment progress
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: apRows } = await (supabase as any)
      .from("assignment_progress").select("*").in("child_id", ids);
    const ap = (apRows ?? []) as AssignmentProgress[];

    // Build per-student stats
    const studentStats: StudentStat[] = kids.map(kid => {
      const kidProgress = progress.filter(p => p.child_id === kid.id);
      const lettersCount = kidProgress.filter(p => p.subject === "literacy" && p.mastered).length;
      const numbersCount = kidProgress.filter(p => p.subject === "numeracy" && p.mastered).length;
      const worldCount   = kidProgress.filter(p => p.subject === "world" && p.mastered).length;
      const assignmentsCompleted = ap.filter(a => a.child_id === kid.id && a.completed).length;
      const lastActivity = kidProgress.sort((a, b) => b.last_activity.localeCompare(a.last_activity))[0]?.last_activity ?? null;
      return {
        id: kid.id, name: kid.name, avatar_url: kid.avatar_url ?? null,
        class: kid.class ?? "sprout_1", lettersCount, numbersCount, worldCount,
        assignmentsCompleted, lastActive: lastActivity,
      };
    });

    // Letter mastery across class
    const letterCounts: Record<string, number> = {};
    progress.filter(p => p.subject === "literacy" && p.mastered).forEach(p => {
      letterCounts[p.letter] = (letterCounts[p.letter] ?? 0) + 1;
    });
    const letterMastery: LetterMastery[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l => ({
      letter: l,
      count: letterCounts[l] ?? 0,
      pct: kids.length > 0 ? Math.round(((letterCounts[l] ?? 0) / kids.length) * 100) : 0,
    }));

    // Weekly progress (last 8 weeks)
    const weeklyProgress: WeeklyPoint[] = [];
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(Date.now() - w * 7 * 86400000);
      const weekEnd   = new Date(Date.now() - (w - 1) * 7 * 86400000);
      const weekLabel = weekStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      const masteredInWeek = progress.filter(p =>
        p.mastered &&
        p.last_activity >= weekStart.toISOString() &&
        p.last_activity < weekEnd.toISOString()
      ).length;
      weeklyProgress.push({ week: weekLabel, avg: kids.length > 0 ? Math.round(masteredInWeek / kids.length) : 0 });
    }

    // Assignment completion rates
    const assignmentsWithRate = assignments.map(a => {
      const assigned = ap.filter(p => p.assignment_id === a.id);
      const completed = assigned.filter(p => p.completed).length;
      return { ...a, completionRate: assigned.length > 0 ? Math.round((completed / assigned.length) * 100) : 0 };
    });

    const avgLetters = kids.length > 0
      ? Math.round(studentStats.reduce((s, k) => s + k.lettersCount, 0) / kids.length)
      : 0;
    const avgCompletion = assignmentsWithRate.length > 0
      ? Math.round(assignmentsWithRate.reduce((s, a) => s + a.completionRate, 0) / assignmentsWithRate.length)
      : 0;

    setAnalytics({
      totalStudents: kids.length,
      activeThisWeek: activeIds.size,
      avgLettersMastered: avgLetters,
      avgAssignmentCompletion: avgCompletion,
      studentStats,
      letterMastery,
      weeklyProgress,
      assignments: assignmentsWithRate,
    });
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  useEffect(() => { load(); }, [load]);

  return { analytics, loading, refresh: load };
}
