"use client";

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
  }, [childId, language, supabase]);

  /** Upsert a progress row — called on heard / correct / traced */
  const upsertProgress = useCallback(
    async (letter: string, patch: Partial<Omit<LetterProgress, "id" | "child_id" | "language" | "letter">>) => {
      if (!childId) return;

      const existing = progress.find(p => p.letter === letter);

      if (existing) {
        const updated = { ...patch, last_activity: new Date().toISOString() };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("progress").update(updated).eq("id", existing.id);
        setProgress(prev => prev.map(p => p.id === existing.id ? { ...p, ...updated } : p));
      } else {
        const newRow = {
          child_id: childId,
          language,
          letter,
          heard_count: 0,
          traced_count: 0,
          mastered: false,
          ...patch,
          last_activity: new Date().toISOString(),
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any).from("progress").insert(newRow).select().single();
        if (data) setProgress(prev => [...prev, data as LetterProgress]);
      }
    },
    [childId, language, progress, supabase]
  );

  const recordHeard = useCallback((letter: string) => {
    const existing = progress.find(p => p.letter === letter);
    return upsertProgress(letter, { heard_count: (existing?.heard_count ?? 0) + 1 });
  }, [progress, upsertProgress]);

  const recordCorrect = useCallback((letter: string) => {
    const existing = progress.find(p => p.letter === letter);
    const newCount = (existing?.heard_count ?? 0) + 1;
    return upsertProgress(letter, { heard_count: newCount, mastered: true });
  }, [progress, upsertProgress]);

  const recordTraced = useCallback((letter: string) => {
    const existing = progress.find(p => p.letter === letter);
    const newCount = (existing?.traced_count ?? 0) + 1;
    return upsertProgress(letter, { traced_count: newCount, mastered: newCount >= 3 });
  }, [progress, upsertProgress]);

  const masteredLetters = progress.filter(p => p.mastered).map(p => p.letter);
  const masteredCount = masteredLetters.length;

  return { progress, masteredCount, masteredLetters, recordHeard, recordCorrect, recordTraced, loading };
}
