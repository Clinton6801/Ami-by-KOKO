"use client";

/**
 * useProgress — reads and writes phonics/numeracy/world progress per child.
 *
 * Reads use the browser Supabase client (RLS allows school admins to SELECT).
 * Writes go through /api/progress (service role) so school children
 * (parent_id = null) are not blocked by the parent-scoped RLS policy.
 */
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LetterProgress, Language } from "@/types";

export function useProgress(childId: string | null, language: Language) {
  const supabase = createClient();
  const [progress, setProgress] = useState<LetterProgress[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!childId) return;
    let cancelled = false;

    async function fetch() {
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
    fetch();
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
      setProgress(prev => {
        const existing = prev.find(p => p.letter === letter);
        if (existing) {
          return prev.map(p =>
            p.id === existing.id
              ? { ...p, ...patch, last_activity: new Date().toISOString() }
              : p
          );
        }
        return [
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
      });

      // Persist via API
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, language, letter, subject, patch }),
      });
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

  return { progress, masteredCount, masteredLetters, recordHeard, recordCorrect, recordTraced, loading };
}
