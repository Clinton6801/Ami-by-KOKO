"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import TracingCanvas from "./TracingCanvas";
import Koko from "@/components/characters/Koko";
import { playLetterSound } from "@/lib/audio/speech";
import type { Language, LetterConfig } from "@/types";

interface LetterDetailProps {
  letter: string;
  language: Language;
  letterData: LetterConfig;
}

type CheckState = "idle" | "correct" | "incorrect";

export default function LetterDetail({ letter, language, letterData }: LetterDetailProps) {
  const router = useRouter();
  const [speaking, setSpeaking] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [checkState, setCheckState] = useState<CheckState>("idle");

  const word = language === "yoruba" ? letterData.localWord : letterData.englishWord;
  const meaning = language === "yoruba" ? `(${letterData.localWordMeaning})` : "";

  const nextLetter = letter < "Z"
    ? String.fromCharCode(letter.charCodeAt(0) + 1)
    : null;
  const prevLetter = letter > "A"
    ? String.fromCharCode(letter.charCodeAt(0) - 1)
    : null;

  async function handlePlay() {
    if (speaking) return;
    setSpeaking(true);
    await playLetterSound({ letter, language, audioClipUrl: letterData.audioClipPath });
    setSpeaking(false);
  }

  function handleCorrect() {
    setCheckState("correct");
    // Auto-navigate to next letter after a short celebration
    if (nextLetter) {
      setTimeout(() => {
        router.push(`/phonics/${language}/${nextLetter.toLowerCase()}`);
      }, 1200);
    }
  }

  function handleIncorrect() {
    setCheckState("incorrect");
    // Reset after a moment so they can try again
    setTimeout(() => setCheckState("idle"), 1500);
  }

  return (
    <div className="flex flex-col items-center gap-5 pb-10">

      {/* ── Letter card — uppercase + lowercase ── */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-amber-400 to-orange-400 shadow-xl shadow-amber-200 p-8 flex flex-col items-center gap-3"
      >
        {/* Big letter — uppercase and lowercase side by side */}
        <div className="flex items-end gap-4 leading-none">
          <span className="text-7xl sm:text-8xl font-extrabold text-white drop-shadow-lg">
            {letter}
          </span>
          <span className="text-5xl sm:text-6xl font-extrabold text-white/70 drop-shadow mb-1">
            {letter.toLowerCase()}
          </span>
        </div>

        {/* Object image */}
        {letterData.imageUrl && (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-2xl p-2">
            <Image
              src={letterData.imageUrl}
              alt={word}
              fill
              className="object-contain p-1"
              sizes="96px"
              unoptimized
            />
          </div>
        )}

        <div className="text-center">
          <p className="text-white font-bold text-xl">
            {letter} is for{" "}
            <span className="underline decoration-white/60">{word}</span>
          </p>
          {meaning && (
            <p className="text-orange-100 text-sm mt-0.5">{meaning}</p>
          )}
        </div>

        {/* Both language pills */}
        <div className="flex gap-3 mt-1 flex-wrap justify-center">
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
        className="w-full max-w-sm bg-white rounded-3xl shadow-md ring-1 ring-amber-100 p-5 flex items-center gap-4 transition hover:shadow-lg disabled:opacity-70"
        aria-label={`Hear Kòkò say the letter ${letter}`}
      >
        <div className="w-14 h-14 flex-shrink-0">
          <Koko speaking={speaking} />
        </div>
        <div className="flex-1 text-left">
          <p className="font-bold text-stone-800">
            {speaking ? "Kòkò is speaking…" : "Tap to hear Kòkò!"}
          </p>
          <p className="text-stone-500 text-sm">
            Phonetic:{" "}
            <span className="font-mono text-amber-600">/{letterData.phonetic}/</span>
          </p>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0 ${speaking ? "bg-amber-300" : "bg-amber-500"}`}>
          {speaking ? "🔊" : "▶"}
        </div>
      </motion.button>

      {/* ── Did you get it right? ── */}
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {checkState === "idle" && (
            <motion.div
              key="check"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl shadow-md ring-1 ring-stone-100 p-5"
            >
              <p className="text-center font-bold text-stone-700 mb-4">
                Did you get it right?
              </p>
              <div className="flex gap-3">
                {/* Incorrect */}
                <button
                  onClick={handleIncorrect}
                  className="flex-1 flex flex-col items-center gap-2 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-2xl py-4 transition active:scale-95"
                  aria-label="I got it wrong"
                >
                  <span className="text-3xl">❌</span>
                  <span className="text-sm font-semibold text-red-600">Not yet</span>
                </button>

                {/* Correct */}
                <button
                  onClick={handleCorrect}
                  className="flex-1 flex flex-col items-center gap-2 bg-green-50 hover:bg-green-100 border-2 border-green-300 rounded-2xl py-4 transition active:scale-95"
                  aria-label="I got it right"
                >
                  <span className="text-3xl">✅</span>
                  <span className="text-sm font-semibold text-green-600">Got it!</span>
                </button>
              </div>
            </motion.div>
          )}

          {checkState === "correct" && (
            <motion.div
              key="correct"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-green-50 border-2 border-green-300 rounded-3xl p-6 flex flex-col items-center gap-2"
            >
              <span className="text-5xl">🎉</span>
              <p className="font-extrabold text-green-700 text-lg">Amazing!</p>
              <p className="text-green-600 text-sm">
                {nextLetter
                  ? `Moving to ${nextLetter}…`
                  : "You've finished the alphabet! 🏆"}
              </p>
            </motion.div>
          )}

          {checkState === "incorrect" && (
            <motion.div
              key="incorrect"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 flex flex-col items-center gap-2"
            >
              <span className="text-5xl">💪</span>
              <p className="font-extrabold text-amber-700 text-lg">Keep trying!</p>
              <p className="text-amber-600 text-sm">
                Tap Kòkò to hear it again
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Tracing (collapsible) ── */}
      <div className="w-full max-w-sm">
        <button
          onClick={() => setShowTrace(v => !v)}
          className="w-full bg-white rounded-3xl shadow-md ring-1 ring-green-100 p-4 flex items-center justify-between transition hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center text-xl">
              ✏️
            </span>
            <div className="text-left">
              <p className="font-bold text-stone-800">Trace the letter</p>
              <p className="text-stone-500 text-sm">
                Draw {letter} &amp; {letter.toLowerCase()} with your finger
              </p>
            </div>
          </div>
          <span className="text-stone-400 text-lg">{showTrace ? "▲" : "▼"}</span>
        </button>

        <AnimatePresence>
          {showTrace && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-3 flex justify-center">
                <TracingCanvas letter={letter} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Prev / All / Next navigation ── */}
      <div className="w-full max-w-sm flex items-center gap-3">
        {prevLetter ? (
          <Link
            href={`/phonics/${language}/${prevLetter.toLowerCase()}`}
            className="flex-1 bg-white rounded-2xl shadow-sm ring-1 ring-stone-100 py-3 text-center font-bold text-stone-600 hover:bg-amber-50 transition"
          >
            ← {prevLetter}{prevLetter.toLowerCase()}
          </Link>
        ) : <div className="flex-1" />}

        <Link
          href={`/phonics/${language}`}
          className="flex-1 bg-amber-500 rounded-2xl py-3 text-center font-bold text-white hover:bg-amber-600 transition shadow-md"
        >
          All
        </Link>

        {nextLetter ? (
          <Link
            href={`/phonics/${language}/${nextLetter.toLowerCase()}`}
            className="flex-1 bg-white rounded-2xl shadow-sm ring-1 ring-stone-100 py-3 text-center font-bold text-stone-600 hover:bg-amber-50 transition"
          >
            {nextLetter}{nextLetter.toLowerCase()} →
          </Link>
        ) : <div className="flex-1" />}
      </div>

    </div>
  );
}
