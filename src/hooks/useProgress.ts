"use client";

/**
 * useProgress — reads and writes progress per child per language.
 *
 * Makes THREE separate DB queries — one per subject — so there is
 * zero chance of cross-subject contamination in the counts.
 *
 * masteredCount / masteredLetters = literacy only (for phonics dashboard)
 * masteredNumbers                 = numeracy only
 * masteredWorldItems              = world only
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LetterProgress, Language, CertificateType } from "@/types";

const FREE_LETTERS = ["A","B","C","D","E","F"];
const ALL_LETTERS  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function useProgress(childId: string | null, language: Language) {
  const supabase = createClient();

  // Three separate state buckets — one per subject
  const [literacyProgress,  setLiteracyProgress]  = useState<LetterProgress[]>([]);
  const [numeracyProgress,  setNumeracyProgress]  = useState<LetterProgress[]>([]);
  const [worldProgress,     setWorldProgress]     = useState<LetterProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newMilestone, setNewMilestone] = useState<CertificateType | null>(null);
  const firedMilestones = useRef<Set<CertificateType>>(new Set());

  useEffect(() => {
    if (!childId) return;
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError(null);

      // ── Literacy ──────────────────────────────────────────────────────────
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: lit, error: litErr } = await (supabase as any)
        .from("progress")
        .select("*")
        .eq("child_id", childId)
        .eq("language", language)
        .eq("subject", "literacy");

      if (litErr) {
        console.error("[useProgress] literacy fetch failed:", litErr);
        setError(litErr.message);
        setLoading(false);
        return;
      }

      console.log("[useProgress] literacy rows:", lit?.length ?? 0, "ok",
        "mastered:", lit?.filter((r: LetterProgress) => r.mastered).map((r: LetterProgress) => r.letter));

      // ── Numeracy ──────────────────────────────────────────────────────────
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: num, error: numErr } = await (supabase as any)
        .from("progress")
        .select("*")
        .eq("child_id", childId)
        .eq("language", language)
        .eq("subject", "numeracy");

      if (numErr) {
        console.error("[useProgress] numeracy fetch failed:", numErr);
        setError(numErr.message);
        setLoading(false);
        return;
      }

      console.log("[useProgress] numeracy rows:", num?.length ?? 0, "ok");

      // ── World ─────────────────────────────────────────────────────────────
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: wld, error: wldErr } = await (supabase as any)
        .from("progress")
        .select("*")
        .eq("child_id", childId)
        .eq("language", language)
        .eq("subject", "world");

      if (wldErr) {
        console.error("[useProgress] world fetch failed:", wldErr);
        setError(wldErr.message);
        setLoading(false);
        return;
      }

      console.log("[useProgress] world rows:", wld?.length ?? 0, "ok");

      if (!cancelled) {
        setLiteracyProgress((lit as LetterProgress[]) ?? []);
        setNumeracyProgress((num as LetterProgress[]) ?? []);
        setWorldProgress((wld as LetterProgress[]) ?? []);
        setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, language]);

  // ── Write ─────────────────────────────────────────────────────────────────

  const upsertProgress = useCallback(
    async (
      letter: string,
      patch: Partial<Omit<LetterProgress, "id" | "child_id" | "language" | "letter">>,
      subject = "literacy"
    ) => {
      if (!childId) return;

      // Optimistic update to the correct bucket
      const updateBucket = (prev: LetterProgress[]): LetterProgress[] => {
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
            id: `temp-${subject}-${letter}-${Date.now()}`,
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
      };

      let updatedLiteracy = literacyProgress;

      if (subject === "literacy") {
        const next = updateBucket(literacyProgress);
        updatedLiteracy = next;
        setLiteracyProgress(next);
      } else if (subject === "numeracy") {
        setNumeracyProgress(prev => updateBucket(prev));
      } else if (subject === "world") {
        setWorldProgress(prev => updateBucket(prev));
      }

      // Persist
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, language, letter, subject, patch }),
      });

      // Milestone check — literacy only
      if (patch.mastered && subject === "literacy") {
        // Letters are stored UPPERCASE in the DB (A, B, C...)
        const masteredNow = updatedLiteracy
          .filter(p => p.mastered)
          .map(p => p.letter.toUpperCase());

        console.log("[useProgress] milestone check — mastered literacy:", masteredNow.length, masteredNow);

        if (
          !firedMilestones.current.has("first_steps") &&
          FREE_LETTERS.every(l => masteredNow.includes(l))
        ) {
          console.log("[useProgress] 🎉 first_steps milestone!");
          firedMilestones.current.add("first_steps");
          setNewMilestone("first_steps");
        }

        if (
          !firedMilestones.current.has("letter_master") &&
          (masteredNow.length >= 26 || ALL_LETTERS.every(l => masteredNow.includes(l)))
        ) {
          console.log("[useProgress] 🎉 letter_master milestone!");
          firedMilestones.current.add("letter_master");
          setNewMilestone("letter_master");
        }
      }
    },
    [childId, language, literacyProgress]
  );

  // ── Convenience writers ───────────────────────────────────────────────────

  const recordHeard = useCallback((letter: string, subject = "literacy") => {
    const bucket = subject === "numeracy" ? numeracyProgress
                 : subject === "world"    ? worldProgress
                 : literacyProgress;
    const existing = bucket.find(p => p.letter === letter);
    return upsertProgress(letter, { heard_count: (existing?.heard_count ?? 0) + 1 }, subject);
  }, [literacyProgress, numeracyProgress, worldProgress, upsertProgress]);

  const recordCorrect = useCallback((letter: string, subject = "literacy") => {
    const bucket = subject === "numeracy" ? numeracyProgress
                 : subject === "world"    ? worldProgress
                 : literacyProgress;
    const existing = bucket.find(p => p.letter === letter);
    return upsertProgress(letter, { heard_count: (existing?.heard_count ?? 0) + 1, mastered: true }, subject);
  }, [literacyProgress, numeracyProgress, worldProgress, upsertProgress]);

  const recordTraced = useCallback((letter: string, subject = "literacy") => {
    const bucket = subject === "numeracy" ? numeracyProgress
                 : subject === "world"    ? worldProgress
                 : literacyProgress;
    const existing = bucket.find(p => p.letter === letter);
    const newCount = (existing?.traced_count ?? 0) + 1;
    return upsertProgress(letter, { traced_count: newCount, mastered: newCount >= 3 }, subject);
  }, [literacyProgress, numeracyProgress, worldProgress, upsertProgress]);

  // ── Derived values ────────────────────────────────────────────────────────

  // Literacy — for phonics dashboard (ONLY literacy rows)
  const masteredLetters = literacyProgress.filter(p => p.mastered).map(p => p.letter);
  const masteredCount   = masteredLetters.length; // max 26

  // Numeracy — for numbers dashboard
  const masteredNumbers = numeracyProgress.filter(p => p.mastered).map(p => p.letter);

  // World — for world dashboard
  const masteredWorldItems = worldProgress.filter(p => p.mastered).map(p => p.letter);

  // Combined for legacy callers that just need all progress
  const progress = [...literacyProgress, ...numeracyProgress, ...worldProgress];

  return {
    progress,
    literacyProgress,
    numeracyProgress,
    worldProgress,
    masteredCount,       // literacy only — use this for letter stats
    masteredLetters,     // literacy only
    masteredNumbers,     // numeracy only
    masteredWorldItems,  // world only
    recordHeard,
    recordCorrect,
    recordTraced,
    loading,
    error,
    newMilestone,
    clearMilestone: () => setNewMilestone(null),
  };
}
