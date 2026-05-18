"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TracingCanvas from "./TracingCanvas";
import Koko from "@/components/characters/Koko";
import SongButton from "@/components/ui/SongButton";
import Certificate from "@/components/ui/Certificate";
import { playLetterSound } from "@/lib/audio/speech";
import { getLetterSong } from "@/lib/audio/songs";
import { isLetterFree } from "@/lib/access";
import { useProgress } from "@/hooks/useProgress";
import { useChild } from "@/hooks/useChild";
import { useAccess } from "@/hooks/useAccess";
import { useCertificates } from "@/hooks/useCertificates";
import { CERTIFICATE_CONFIGS } from "@/types";
import type { Language, LetterConfig, CertificateType } from "@/types";

interface LetterDetailProps {
  letter: string;
  language: Language;
  letterData: LetterConfig;
}

type CheckState = "idle" | "correct" | "incorrect";

export default function LetterDetail({ letter, language, letterData }: LetterDetailProps) {
  const router = useRouter();
  const { activeChild } = useChild();
  const { progress, recordHeard, recordCorrect, recordTraced, newMilestone, clearMilestone } = useProgress(
    activeChild?.id ?? null,
    language
  );
  const { hasPaid } = useAccess(activeChild);
  const { awardCertificate } = useCertificates(activeChild?.id ?? null);

  const [speaking, setSpeaking] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [showCertificate, setShowCertificate] = useState<CertificateType | null>(null);
  const milestoneShowing = useRef(false);

  const song = getLetterSong(letter);
  const songLocked = !hasPaid && !isLetterFree(letter);

  // When a milestone fires here (on the letter page), award it and show the cert
  useEffect(() => {
    if (!newMilestone || !activeChild?.id) return;
    async function handle() {
      const awarded = await awardCertificate(newMilestone!);
      if (awarded) {
        milestoneShowing.current = true;
        setShowCertificate(newMilestone);
      }
      clearMilestone();
    }
    handle();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMilestone]);

  const word = language === "yoruba" ? letterData.localWord : letterData.englishWord;
  const meaning = language === "yoruba" ? `(${letterData.localWordMeaning})` : "";
  const isAlreadyMastered = progress.some(p => p.letter === letter && p.mastered);

  const nextLetter = letter < "Z" ? String.fromCharCode(letter.charCodeAt(0) + 1) : null;
  const prevLetter = letter > "A" ? String.fromCharCode(letter.charCodeAt(0) - 1) : null;

  // Record heard when page loads
  useEffect(() => {
    if (activeChild?.id) recordHeard(letter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter, activeChild?.id]);

  async function handlePlay() {
    if (speaking) return;
    setSpeaking(true);
    await playLetterSound({ letter, language, audioClipUrl: letterData.audioClipPath });
    setSpeaking(false);
  }

  async function handleCorrect() {
    setCheckState("correct");
    await recordCorrect(letter);
    // Auto-navigate after 1.2s — but only if no milestone cert fires.
    // If a cert fires, the useEffect sets milestoneShowing.current = true
    // and the cert's onClose handles navigation instead.
    if (nextLetter) {
      setTimeout(() => {
        if (!milestoneShowing.current) {
          router.push(`/phonics/${language}/${nextLetter.toLowerCase()}`);
        }
      }, 1200);
    }
  }

  function handleIncorrect() {
    setCheckState("incorrect");
    setTimeout(() => setCheckState("idle"), 1500);
  }

  return (
    <div className="flex flex-col items-center gap-5 pb-10">

      {/* ── Letter card ── */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-amber-400 to-orange-400 shadow-xl shadow-amber-200 p-6 sm:p-8 flex flex-col items-center gap-3"
      >
        {isAlreadyMastered && (
          <span className="bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full">
            ⭐ Mastered!
          </span>
        )}

        <div className="flex items-end gap-4 leading-none">
          <span className="text-7xl sm:text-8xl font-extrabold text-white drop-shadow-lg">
            {letter}
          </span>
          <span className="text-5xl sm:text-6xl font-extrabold text-white/70 drop-shadow mb-1">
            {letter.toLowerCase()}
          </span>
        </div>

        {letterData.imageUrl && (
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-2xl p-2 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={letterData.imageUrl} alt={word}
              className="w-full h-full object-contain p-1" />
          </div>
        )}

        <div className="text-center">
          <p className="text-white font-bold text-lg sm:text-xl">
            {letter} is for <span className="underline decoration-white/60">{word}</span>
          </p>
          {meaning && <p className="text-orange-100 text-sm mt-0.5">{meaning}</p>}
        </div>

        <div className="flex gap-2 mt-1 flex-wrap justify-center">
          <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
            🇬🇧 {letterData.englishWord}
          </span>
          <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
            🇳🇬 {letterData.localWord}
          </span>
        </div>
      </motion.div>

      {/* ── Kòkò sound button ── */}
      <motion.button
        onClick={handlePlay}
        disabled={speaking}
        whileTap={{ scale: 0.93 }}
        animate={speaking ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: speaking ? Infinity : 0, duration: 0.5 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-md ring-1 ring-amber-100 p-4 sm:p-5 flex items-center gap-4 transition hover:shadow-lg disabled:opacity-70"
        aria-label={`Hear Kòkò say the letter ${letter}`}
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
          <Koko speaking={speaking} />
        </div>
        <div className="flex-1 text-left">
          <p className="font-bold text-stone-800 text-sm sm:text-base">
            {speaking ? "Kòkò is speaking…" : "Tap to hear Kòkò!"}
          </p>
          <p className="text-stone-500 text-xs sm:text-sm">
            Phonetic: <span className="font-mono text-amber-600">/{letterData.phonetic}/</span>
          </p>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0 ${speaking ? "bg-amber-300" : "bg-amber-500"}`}>
          {speaking ? "🔊" : "▶"}
        </div>
      </motion.button>

      {/* ── Sing with Kòkò ── */}
      <SongButton
        song={song}
        label="🎵 Sing with Kòkò"
        locked={songLocked}
      />

      {/* ── Did you get it right? ── */}
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {checkState === "idle" && (
            <motion.div key="check"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl shadow-md ring-1 ring-stone-100 p-4 sm:p-5"
            >
              <p className="text-center font-bold text-stone-700 mb-3 text-sm sm:text-base">
                Did you get it right?
              </p>
              <div className="flex gap-3">
                <button onClick={handleIncorrect}
                  className="flex-1 flex flex-col items-center gap-1.5 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-2xl py-3 sm:py-4 transition active:scale-95"
                  aria-label="I got it wrong">
                  <span className="text-2xl sm:text-3xl">❌</span>
                  <span className="text-xs sm:text-sm font-semibold text-red-600">Not yet</span>
                </button>
                <button onClick={handleCorrect}
                  className="flex-1 flex flex-col items-center gap-1.5 bg-green-50 hover:bg-green-100 border-2 border-green-300 rounded-2xl py-3 sm:py-4 transition active:scale-95"
                  aria-label="I got it right">
                  <span className="text-2xl sm:text-3xl">✅</span>
                  <span className="text-xs sm:text-sm font-semibold text-green-600">Got it!</span>
                </button>
              </div>
            </motion.div>
          )}

          {checkState === "correct" && (
            <motion.div key="correct"
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-green-50 border-2 border-green-300 rounded-3xl p-5 flex flex-col items-center gap-2">
              <span className="text-5xl">🎉</span>
              <p className="font-extrabold text-green-700 text-lg">Amazing!</p>
              <p className="text-green-600 text-sm">
                {nextLetter ? `Moving to ${nextLetter}…` : "You've finished the alphabet! 🏆"}
              </p>
            </motion.div>
          )}

          {checkState === "incorrect" && (
            <motion.div key="incorrect"
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 flex flex-col items-center gap-2">
              <span className="text-5xl">💪</span>
              <p className="font-extrabold text-amber-700 text-lg">Keep trying!</p>
              <p className="text-amber-600 text-sm">Tap Kòkò to hear it again</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Tracing ── */}
      <div className="w-full max-w-sm">
        <button onClick={() => setShowTrace(v => !v)}
          className="w-full bg-white rounded-3xl shadow-md ring-1 ring-green-100 p-4 flex items-center justify-between transition hover:shadow-lg">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-green-100 flex items-center justify-center text-lg sm:text-xl">✏️</span>
            <div className="text-left">
              <p className="font-bold text-stone-800 text-sm sm:text-base">Trace the letter</p>
              <p className="text-stone-500 text-xs sm:text-sm">Draw {letter} &amp; {letter.toLowerCase()}</p>
            </div>
          </div>
          <span className="text-stone-400">{showTrace ? "▲" : "▼"}</span>
        </button>

        <AnimatePresence>
          {showTrace && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
              className="overflow-hidden">
              <div className="pt-3 flex justify-center">
                <TracingCanvas letter={letter} onTraced={() => recordTraced(letter)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Prev / All / Next ── */}
      <div className="w-full max-w-sm flex items-center gap-2 sm:gap-3">
        {prevLetter ? (
          <Link href={`/phonics/${language}/${prevLetter.toLowerCase()}`}
            className="flex-1 bg-white rounded-2xl shadow-sm ring-1 ring-stone-100 py-3 text-center font-bold text-stone-600 hover:bg-amber-50 transition text-sm">
            ← {prevLetter}{prevLetter.toLowerCase()}
          </Link>
        ) : <div className="flex-1" />}

        <Link href={`/phonics/${language}`}
          className="flex-1 bg-amber-500 rounded-2xl py-3 text-center font-bold text-white hover:bg-amber-600 transition shadow-md text-sm">
          All
        </Link>

        {nextLetter ? (
          <Link href={`/phonics/${language}/${nextLetter.toLowerCase()}`}
            className="flex-1 bg-white rounded-2xl shadow-sm ring-1 ring-stone-100 py-3 text-center font-bold text-stone-600 hover:bg-amber-50 transition text-sm">
            {nextLetter}{nextLetter.toLowerCase()} →
          </Link>
        ) : <div className="flex-1" />}
      </div>

      {/* ── Milestone certificate ── */}
      <AnimatePresence>
        {showCertificate && (
          <Certificate
            childName={activeChild?.name ?? "Champion"}
            achievement={CERTIFICATE_CONFIGS[showCertificate].achievement}
            subject={CERTIFICATE_CONFIGS[showCertificate].subject}
            onClose={() => {
              setShowCertificate(null);
              // Navigate to next letter after closing cert
              if (nextLetter) {
                router.push(`/phonics/${language}/${nextLetter.toLowerCase()}`);
              }
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
