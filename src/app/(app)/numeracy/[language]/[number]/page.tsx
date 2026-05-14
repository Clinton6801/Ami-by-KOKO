"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import TracingCanvas from "@/components/phonics/TracingCanvas";
import Koko from "@/components/characters/Koko";

// Inline number data (avoid circular import)
const NUMBER_DATA: Record<string, { numeral: string; word: string; yorubaWord: string; imageUrl: string; colour: string }> = {
  "1": { numeral:"1", word:"One",   yorubaWord:"Ọkan", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F96D.svg", colour:"from-amber-400 to-orange-400" },
  "2": { numeral:"2", word:"Two",   yorubaWord:"Èjì",  imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F34A.svg", colour:"from-green-400 to-emerald-500" },
  "3": { numeral:"3", word:"Three", yorubaWord:"Ẹta",  imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F34C.svg", colour:"from-violet-400 to-purple-500" },
  "4": { numeral:"4", word:"Four",  yorubaWord:"Ẹrin", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F347.svg", colour:"from-rose-400 to-pink-500" },
  "5": { numeral:"5", word:"Five",  yorubaWord:"Àrún", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F353.svg", colour:"from-sky-400 to-blue-500" },
  "6": { numeral:"6", word:"Six",   yorubaWord:"Ẹfà",  imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F360.svg", colour:"from-amber-400 to-yellow-400" },
  "7": { numeral:"7", word:"Seven", yorubaWord:"Èje",  imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F966.svg", colour:"from-teal-400 to-cyan-500" },
  "8": { numeral:"8", word:"Eight", yorubaWord:"Ẹjọ",  imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F955.svg", colour:"from-orange-400 to-red-400" },
  "9": { numeral:"9", word:"Nine",  yorubaWord:"Ẹsàn", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F336.svg", colour:"from-fuchsia-400 to-pink-400" },
  "10":{ numeral:"10",word:"Ten",   yorubaWord:"Ẹwà",  imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F33D.svg", colour:"from-green-500 to-emerald-400" },
};

const NUMBERS = Object.keys(NUMBER_DATA);

interface Props { params: Promise<{ language: string; number: string }> }

type CheckState = "idle" | "correct" | "incorrect";

export default function NumberDetailPage({ params }: Props) {
  const { language, number } = use(params);
  const router = useRouter();
  const data = NUMBER_DATA[number];
  if (!data || language !== "english") notFound();

  const [speaking, setSpeaking] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [checkState, setCheckState] = useState<CheckState>("idle");

  const idx = NUMBERS.indexOf(number);
  const nextNum = idx < NUMBERS.length - 1 ? NUMBERS[idx + 1] : null;
  const prevNum = idx > 0 ? NUMBERS[idx - 1] : null;

  function speak() {
    if (speaking || typeof window === "undefined") return;
    setSpeaking(true);
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(`${data.word}. ${data.numeral}`);
    u.lang = "en-NG"; u.rate = 0.8; u.pitch = 1.2;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  function handleCorrect() {
    setCheckState("correct");
    if (nextNum) setTimeout(() => router.push(`/numeracy/${language}/${nextNum}`), 1200);
  }

  return (
    <div className="flex flex-col items-center gap-5 pb-10">

      {/* Number card */}
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className={`w-full max-w-sm rounded-3xl bg-gradient-to-br ${data.colour} shadow-xl p-6 flex flex-col items-center gap-3`}>
        <div className="flex items-end gap-4 leading-none">
          <span className="text-8xl font-extrabold text-white drop-shadow-lg">{data.numeral}</span>
        </div>
        <div className="relative w-20 h-20 bg-white/20 rounded-2xl p-2">
          <Image src={data.imageUrl} alt={data.word} fill className="object-contain p-1" sizes="80px" unoptimized/>
        </div>
        <p className="text-white font-bold text-xl">{data.word}</p>
        <div className="flex gap-2 flex-wrap justify-center">
          <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">🇬🇧 {data.word}</span>
          <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">🇳🇬 {data.yorubaWord}</span>
        </div>
      </motion.div>

      {/* Kòkò sound button */}
      <motion.button onClick={speak} disabled={speaking} whileTap={{ scale: 0.93 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-md ring-1 ring-amber-100 p-4 flex items-center gap-4 transition hover:shadow-lg disabled:opacity-70"
        aria-label={`Hear Kòkò say ${data.word}`}>
        <div className="w-12 h-12 flex-shrink-0"><Koko speaking={speaking}/></div>
        <div className="flex-1 text-left">
          <p className="font-bold text-stone-800 text-sm">{speaking ? "Kòkò is speaking…" : "Tap to hear Kòkò!"}</p>
          <p className="text-stone-500 text-xs">Hear the number name</p>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0 ${speaking ? "bg-amber-300" : "bg-amber-500"}`}>
          {speaking ? "🔊" : "▶"}
        </div>
      </motion.button>

      {/* Did you get it right? */}
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {checkState === "idle" && (
            <motion.div key="check" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white rounded-3xl shadow-md ring-1 ring-stone-100 p-4">
              <p className="text-center font-bold text-stone-700 mb-3 text-sm">Do you know this number?</p>
              <div className="flex gap-3">
                <button onClick={() => { setCheckState("incorrect"); setTimeout(() => setCheckState("idle"), 1500); }}
                  className="flex-1 flex flex-col items-center gap-1.5 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-2xl py-3 transition active:scale-95">
                  <span className="text-2xl">❌</span>
                  <span className="text-xs font-semibold text-red-600">Not yet</span>
                </button>
                <button onClick={handleCorrect}
                  className="flex-1 flex flex-col items-center gap-1.5 bg-green-50 hover:bg-green-100 border-2 border-green-300 rounded-2xl py-3 transition active:scale-95">
                  <span className="text-2xl">✅</span>
                  <span className="text-xs font-semibold text-green-600">Got it!</span>
                </button>
              </div>
            </motion.div>
          )}
          {checkState === "correct" && (
            <motion.div key="correct" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-green-50 border-2 border-green-300 rounded-3xl p-5 flex flex-col items-center gap-2">
              <span className="text-5xl">🎉</span>
              <p className="font-extrabold text-green-700">Amazing!</p>
              <p className="text-green-600 text-sm">{nextNum ? `Moving to ${NUMBER_DATA[nextNum].word}…` : "You know all the numbers! 🏆"}</p>
            </motion.div>
          )}
          {checkState === "incorrect" && (
            <motion.div key="incorrect" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 flex flex-col items-center gap-2">
              <span className="text-5xl">💪</span>
              <p className="font-extrabold text-amber-700">Keep trying!</p>
              <p className="text-amber-600 text-sm">Tap Kòkò to hear it again</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tracing */}
      <div className="w-full max-w-sm">
        <button onClick={() => setShowTrace(v => !v)}
          className="w-full bg-white rounded-3xl shadow-md ring-1 ring-green-100 p-4 flex items-center justify-between transition hover:shadow-lg">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-green-100 flex items-center justify-center text-lg">✏️</span>
            <div className="text-left">
              <p className="font-bold text-stone-800 text-sm">Trace the number</p>
              <p className="text-stone-500 text-xs">Draw {data.numeral} with your finger</p>
            </div>
          </div>
          <span className="text-stone-400">{showTrace ? "▲" : "▼"}</span>
        </button>
        <AnimatePresence>
          {showTrace && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="pt-3 flex justify-center">
                <TracingCanvas letter={data.numeral}/>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Prev / All / Next */}
      <div className="w-full max-w-sm flex items-center gap-2">
        {prevNum ? (
          <Link href={`/numeracy/${language}/${prevNum}`}
            className="flex-1 bg-white rounded-2xl shadow-sm ring-1 ring-stone-100 py-3 text-center font-bold text-stone-600 hover:bg-amber-50 transition text-sm">
            ← {prevNum}
          </Link>
        ) : <div className="flex-1"/>}
        <Link href={`/numeracy/${language}`}
          className="flex-1 bg-violet-500 rounded-2xl py-3 text-center font-bold text-white hover:bg-violet-600 transition shadow-md text-sm">
          All
        </Link>
        {nextNum ? (
          <Link href={`/numeracy/${language}/${nextNum}`}
            className="flex-1 bg-white rounded-2xl shadow-sm ring-1 ring-stone-100 py-3 text-center font-bold text-stone-600 hover:bg-amber-50 transition text-sm">
            {nextNum} →
          </Link>
        ) : <div className="flex-1"/>}
      </div>
    </div>
  );
}
