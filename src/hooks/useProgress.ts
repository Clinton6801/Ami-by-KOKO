"use client";

/**
 * useProgress — reads and updates a child's phonics progress.
 */
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LetterProgress, Language } from "@/types";
import type { Database } from "@/lib/supabase/database.types";

type ProgressRow = Database["public"]["Tables"]["progress"]["Row"];

export function useProgress(childId: string | null, language: Language) {
  const supabase = createClient();
  const [progress, setProgress] = useState<LetterProgress[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!childId) return;

    async function fetchProgress() {
      setLoading(true);
      const { data } = await supabase
        .from("progress")
        .select("*")
        .eq("child_id", childId!)
        .eq("language", language)
        .returns<ProgressRow[]>();

      setProgress((data as LetterProgress[]) ?? []);
      setLoading(false);
    }

    fetchProgress();
  }, [childId, language, supabase]);

  /** Records that a child heard a letter sound */
  const recordHeard = useCallback(
    async (letter: string) => {
      if (!childId) return;

      const existing = progress.find(
        (p) => p.letter === letter && p.language === language
      );

      if (existing) {
        await supabase
          .from("progress")
          .update({
            heard_count: existing.heard_count + 1,
            last_activity: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("progress").insert({
          child_id: childId,
          language,
          letter,
          heard_count: 1,
        });
      }

      setProgress((prev) => {
        if (existing) {
          return prev.map((p) =>
            p.id === existing.id
              ? { ...p, heard_count: p.heard_count + 1 }
              : p
          );
        }
        return prev;
      });
    },
    [childId, language, progress, supabase]
  );

  /** Records that a child traced a letter — mastered after 3 traces */
  const recordTraced = useCallback(
    async (letter: string) => {
      if (!childId) return;

      const existing = progress.find(
        (p) => p.letter === letter && p.language === language
      );

      if (existing) {
        const newTracedCount = existing.traced_count + 1;
        const mastered = newTracedCount >= 3;

        await supabase
          .from("progress")
          .update({
            traced_count: newTracedCount,
            mastered,
            last_activity: new Date().toISOString(),
          })
          .eq("id", existing.id);

        setProgress((prev) =>
          prev.map((p) =>
            p.id === existing.id
              ? { ...p, traced_count: newTracedCount, mastered }
              : p
          )
        );
      }
    },
    [childId, language, progress, supabase]
  );

  const masteredCount = progress.filter((p) => p.mastered).length;

  return { progress, masteredCount, recordHeard, recordTraced, loading };
}
