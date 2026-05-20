"use client";

/**
 * useChallenges — fetches the active weekly challenge for a child's class
 * and their progress towards it. Auto-generates a default challenge if none
 * exists for the current week.
 */
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChildWithClass } from "@/types";

export interface Challenge {
  id: string;
  school_id: string;
  class: string;
  title: string;
  description: string | null;
  metric: "letters_mastered" | "assignments_complete" | "sessions";
  target_count: number;
  week_start: string;
  week_end: string;
}

export interface ChallengeProgress {
  id: string;
  challenge_id: string;
  child_id: string;
  current_count: number;
  completed: boolean;
  completed_at: string | null;
}

export interface LeaderboardEntry {
  child_id: string;
  name: string;
  avatar_url: string | null;
  score: number;
  rank: number;
}

export function useChallenges(child: ChildWithClass | null) {
  const supabase = createClient();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [myProgress, setMyProgress] = useState<ChallengeProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!child?.school_id || !child?.class) return;
    setLoading(true);

    const today = new Date();
    const weekStart = getWeekStart(today);
    const weekEnd = getWeekEnd(today);

    // Find active challenge for this class this week
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: challenges } = await (supabase as any)
      .from("challenges")
      .select("*")
      .eq("school_id", child.school_id)
      .eq("class", child.class)
      .lte("week_start", today.toISOString().slice(0, 10))
      .gte("week_end", today.toISOString().slice(0, 10))
      .order("created_at", { ascending: false })
      .limit(1);

    const activeChallenge = challenges?.[0] as Challenge | undefined;
    setChallenge(activeChallenge ?? null);

    if (activeChallenge && child.id) {
      // Get my progress
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: prog } = await (supabase as any)
        .from("challenge_progress")
        .select("*")
        .eq("challenge_id", activeChallenge.id)
        .eq("child_id", child.id)
        .maybeSingle();
      setMyProgress(prog as ChallengeProgress ?? null);

      // Build leaderboard — top 5 in class by letters mastered this week
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: classKids } = await (supabase as any)
        .from("children")
        .select("id, name, avatar_url")
        .eq("school_id", child.school_id)
        .eq("class", child.class);

      if (classKids && classKids.length > 0) {
        const ids = classKids.map((k: { id: string }) => k.id);

        // Count letters mastered this week per child
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: progressRows } = await (supabase as any)
          .from("progress")
          .select("child_id")
          .in("child_id", ids)
          .eq("subject", "literacy")
          .eq("mastered", true)
          .gte("last_activity", weekStart);

        const scores: Record<string, number> = {};
        (progressRows ?? []).forEach((r: { child_id: string }) => {
          scores[r.child_id] = (scores[r.child_id] ?? 0) + 1;
        });

        const entries: LeaderboardEntry[] = classKids
          .map((k: { id: string; name: string; avatar_url: string | null }) => ({
            child_id: k.id,
            name: k.name,
            avatar_url: k.avatar_url,
            score: scores[k.id] ?? 0,
            rank: 0,
          }))
          .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score)
          .slice(0, 5)
          .map((e: LeaderboardEntry, i: number) => ({ ...e, rank: i + 1 }));

        setLeaderboard(entries);
      }
    }

    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child?.id, child?.school_id, child?.class]);

  useEffect(() => { load(); }, [load]);

  return { challenge, myProgress, leaderboard, loading, refresh: load };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

function getWeekEnd(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7); // Sunday
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}
