"use client";

/**
 * useProgress — reads and writes phonics/numeracy/world progress per child.
 *
 * Reads use the browser Supabase client (RLS allows school admins to SELECT).
 * Writes go through /api/progress (service role) so school children
 * (parent_id = null) are not blocked by the parent-scoped RLS policy.
 *
 * Milestone detection: after each mastered update, checks if a certificate
 * milestone has been reached and returns it via `newMilestone` for the
 * calling component to handle (award + show certificate).
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LetterProgress, Language, CertificateType } from "@/types";

const FREE_LETTERS = ["a","b","c","d","e","f"];
const ALL_LETTERS  = "abcdefghijklmnopqrstuvwxyz".split("");

export function useProgress(childId: string | null, language: Language) {
  const supabase = createClient();
  const [progress, setProgress] = useState<LetterProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMilestone, setNewMilestone] = useState<CertificateType | null>(null);
  // Track which milestones we've already fired this session to avoid duplicates
  const firedMilestones = useRef<Set<CertificateType>>(new Set());

  useEffect(() => {
    if (!childId) return;
    let cancelled = false;

    async function fetchProgress() {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("progress")
        .select("*")
        .eq("child_id", childId)
        .eq("language", language);
      if (!cancelled) {
        setProgress((data as LetterProgress[]) ?? []);
        setLoading(false);
      }
    }
    fetchProgress();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, language]);

  /** Write progress via service-role API — works for both parent and school children */
  const upsertProgress = useCallback(
    async (
      letter: string,
      patch: Partial<Omit<LetterProgress, "id" | "child_id" | "language" | "letter">>,
      subject = "literacy"
    ) => {
      if (!childId) return;

      // Optimistic local update
      let updatedProgress: LetterProgress[] = [];
      setProgress(prev => {
        const existing = prev.find(p => p.letter === letter);
        const next = existing
          ? prev.map(p =>
              p.id === existing.id
                ? { ...p, ...patch, last_activity: new Date().toISOString() }
                : p
            )
          : [
              ...prev,
              {
                id: `temp-${letter}`,
                child_id: childId,
                language,
                letter,
                heard_count: 0,
                traced_count: 0,
                mastered: false,
                last_activity: new Date().toISOString(),
                ...patch,
              } as LetterProgress,
            ];
        updatedProgress = next;
        return next;
      });

      // Persist via API
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, language, letter, subject, patch }),
      });

      // Check milestones after write (only for literacy mastery)
      if (patch.mastered && subject === "literacy") {
        const masteredNow = updatedProgress
          .filter(p => p.mastered)
          .map(p => p.letter.toLowerCase());

        // first_steps — A–F all mastered
        if (
          !firedMilestones.current.has("first_steps") &&
          FREE_LETTERS.every(l => masteredNow.includes(l))
        ) {
          firedMilestones.current.add("first_steps");
          setNewMilestone("first_steps");
        }

        // letter_master — all 26 mastered
        if (
          !firedMilestones.current.has("letter_master") &&
          ALL_LETTERS.every(l => masteredNow.includes(l))
        ) {
          firedMilestones.current.add("letter_master");
          setNewMilestone("letter_master");
        }
      }
    },
    [childId, language]
  );

  const recordHeard = useCallback((letter: string, subject = "literacy") => {
    const existing = progress.find(p => p.letter === letter);
    return upsertProgress(letter, { heard_count: (existing?.heard_count ?? 0) + 1 }, subject);
  }, [progress, upsertProgress]);

  const recordCorrect = useCallback((letter: string, subject = "literacy") => {
    const existing = progress.find(p => p.letter === letter);
    return upsertProgress(letter, { heard_count: (existing?.heard_count ?? 0) + 1, mastered: true }, subject);
  }, [progress, upsertProgress]);

  const recordTraced = useCallback((letter: string, subject = "literacy") => {
    const existing = progress.find(p => p.letter === letter);
    const newCount = (existing?.traced_count ?? 0) + 1;
    return upsertProgress(letter, { traced_count: newCount, mastered: newCount >= 3 }, subject);
  }, [progress, upsertProgress]);

  const masteredLetters = progress.filter(p => p.mastered).map(p => p.letter);
  const masteredCount = masteredLetters.length;

  return {
    progress,
    masteredCount,
    masteredLetters,
    recordHeard,
    recordCorrect,
    recordTraced,
    loading,
    /** Set to a CertificateType when a milestone is reached. Caller should award + show cert, then clear. */
    newMilestone,
    clearMilestone: () => setNewMilestone(null),
  };
}
