"use client";

/**
 * useProgress — reads and writes progress per child per language.
 *
 * IMPORTANT: fetches ALL subjects for the child so callers can filter.
 * masteredCount and masteredLetters are filtered to subject='literacy' only
 * to avoid numeracy/world rows inflating the phonics count.
 *
 * Writes go through /api/progress (service role) so school children
 * (parent_id = null) are not blocked by the parent-scoped RLS policy.
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
  const firedMilestones = useRef<Set<CertificateType>>(new Set());

  useEffect(() => {
    if (!childId) return;
    let cancelled = false;

    async function fetchProgress() {
      setLoading(true);
      // Fetch ALL subjects — callers filter as needed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("progress")
        .select("*")
        .eq("child_id", childId)
        .eq("language", language);

      console.log("[useProgress] fetched rows:", data?.length, "error:", error, "childId:", childId, "language:", language);

      if (!cancelled) {
        setProgress((data as LetterProgress[]) ?? []);
        setLoading(false);
      }
    }
    fetchProgress();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, language]);

  const upsertProgress = useCallback(
    async (
      letter: string,
      patch: Partial<Omit<LetterProgress, "id" | "child_id" | "language" | "letter">>,
      subject = "literacy"
    ) => {
      if (!childId) return;

      let updatedProgress: LetterProgress[] = [];
      setProgress(prev => {
        const existing = prev.find(p => p.letter === letter && (p as LetterProgress & { subject?: string }).subject === subject);
        const next = existing
          ? prev.map(p =>
              p.id === existing.id
                ? { ...p, ...patch, last_activity: new Date().toISOString() }
                : p
            )
          : [
              ...prev,
              {
                id: `temp-${subject}-${letter}`,
                child_id: childId,
                language,
                letter,
                heard_count: 0,
                traced_count: 0,
                mastered: false,
                last_activity: new Date().toISOString(),
                subject,
                ...patch,
              } as LetterProgress,
            ];
        updatedProgress = next;
        return next;
      });

      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, language, letter, subject, patch }),
      });

      // Milestone check — literacy only
      if (patch.mastered && subject === "literacy") {
        const masteredNow = updatedProgress
          .filter(p => p.mastered && (p as LetterProgress & { subject?: string }).subject === "literacy")
          .map(p => p.letter.toLowerCase());

        console.log("[useProgress] milestone check — mastered literacy letters:", masteredNow);

        if (
          !firedMilestones.current.has("first_steps") &&
          FREE_LETTERS.every(l => masteredNow.includes(l))
        ) {
          console.log("[useProgress] 🎉 first_steps milestone reached!");
          firedMilestones.current.add("first_steps");
          setNewMilestone("first_steps");
        }

        if (
          !firedMilestones.current.has("letter_master") &&
          ALL_LETTERS.every(l => masteredNow.includes(l))
        ) {
          console.log("[useProgress] 🎉 letter_master milestone reached!");
          firedMilestones.current.add("letter_master");
          setNewMilestone("letter_master");
        }
      }
    },
    [childId, language]
  );

  const recordHeard = useCallback((letter: string, subject = "literacy") => {
    const existing = progress.find(p => p.letter === letter && (p as LetterProgress & { subject?: string }).subject === subject);
    return upsertProgress(letter, { heard_count: (existing?.heard_count ?? 0) + 1 }, subject);
  }, [progress, upsertProgress]);

  const recordCorrect = useCallback((letter: string, subject = "literacy") => {
    const existing = progress.find(p => p.letter === letter && (p as LetterProgress & { subject?: string }).subject === subject);
    return upsertProgress(letter, { heard_count: (existing?.heard_count ?? 0) + 1, mastered: true }, subject);
  }, [progress, upsertProgress]);

  const recordTraced = useCallback((letter: string, subject = "literacy") => {
    const existing = progress.find(p => p.letter === letter && (p as LetterProgress & { subject?: string }).subject === subject);
    const newCount = (existing?.traced_count ?? 0) + 1;
    return upsertProgress(letter, { traced_count: newCount, mastered: newCount >= 3 }, subject);
  }, [progress, upsertProgress]);

  // ── Filtered views ────────────────────────────────────────────────────────

  // Literacy only — for phonics dashboard and milestone detection
  const literacyProgress = progress.filter(p => (p as LetterProgress & { subject?: string }).subject === "literacy" || !(p as LetterProgress & { subject?: string }).subject);
  const masteredLetters = literacyProgress.filter(p => p.mastered).map(p => p.letter);
  const masteredCount = masteredLetters.length;

  // Numeracy — numbers 1–10
  const numeracyProgress = progress.filter(p => (p as LetterProgress & { subject?: string }).subject === "numeracy");
  const masteredNumbers = numeracyProgress.filter(p => p.mastered).map(p => p.letter);

  // World — all 24 items
  const worldProgress = progress.filter(p => (p as LetterProgress & { subject?: string }).subject === "world");
  const masteredWorldItems = worldProgress.filter(p => p.mastered).map(p => p.letter);

  return {
    progress,
    literacyProgress,
    numeracyProgress,
    worldProgress,
    masteredCount,
    masteredLetters,
    masteredNumbers,
    masteredWorldItems,
    recordHeard,
    recordCorrect,
    recordTraced,
    loading,
    newMilestone,
    clearMilestone: () => setNewMilestone(null),
  };
}
