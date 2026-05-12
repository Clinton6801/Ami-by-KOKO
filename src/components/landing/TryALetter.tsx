"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// Subset of letters for the demo — pick the most visually interesting ones
const DEMO_LETTERS = [
  { letter: "A", english: "Apple",     yoruba: "Àgbàdo",  meaning: "corn",       image: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F34E.svg", colour: "from-red-400 to-rose-500" },
  { letter: "B", english: "Ball",      yoruba: "Bàtà",    meaning: "drum",       image: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/26BD.svg",  colour: "from-blue-400 to-indigo-500" },
  { letter: "C", english: "Cat",       yoruba: "Ẹkùn",    meaning: "leopard",    image: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F431.svg", colour: "from-orange-400 to-amber-500" },
  { letter: "D", english: "Dog",       yoruba: "Ẹja",     meaning: "fish",       image: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F436.svg", colour: "from-amber-400 to-yellow-500" },
  { letter: "E", english: "Egg",       yoruba: "Ẹyin",    meaning: "egg",        image: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F95A.svg", colour: "from-yellow-400 to-amber-400" },
  { letter: "M", english: "Mango",     yoruba: "Màngoro", meaning: "mango",      image: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F96D.svg", colour: "from-yellow-500 to-orange-400" },
  { letter: "S", english: "Sun",       yoruba: "Òòrùn",   meaning: "sun",        image: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/2600.svg",  colour: "from-amber-400 to-orange-400" },
  { letter: "T", english: "Tree",      yoruba: "Igi",     meaning: "tree",       image: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F333.svg", colour: "from-green-500 to-emerald-400" },
  { letter: "Y", english: "Yam",       yoruba: "Isu",     meaning: "yam",        image: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F360.svg", colour: "from-orange-400 to-amber-500" },
  { letter: "P", english: "Parrot",    yoruba: "Ọ̀pẹ",    meaning: "palm tree",  image: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F99C.svg", colour: "from-green-400 to-teal-500" },
];

type DemoLetter = typeof DEMO_LETTERS[number];

function speakLetter(letter: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(letter);
  u.lang = "en-NG";
  u.rate = 0.75;
  u.pitch = 1.3;
  window.speechSynthesis.speak(u);
}

// Kòkò SVG — inline so it animates without an img tag
function KokoFace({ speaking }: { speaking: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 80 80"
      className="w-full h-full"
      animate={speaking ? { scale: [1, 1.08, 1], rotate: [0, -4, 4, 0] } : {}}
      transition={{ duration: 0.4, repeat: speaking ? Infinity : 0 }}
    >
      {/* Body */}
      <ellipse cx="40" cy="48" rx="22" ry="26" fill="#22C55E"/>
      {/* Chest */}
      <ellipse cx="44" cy="52" rx="12" ry="14" fill="#FCD34D"/>
      {/* Head */}
      <circle cx="44" cy="28" r="20" fill="#22C55E"/>
      {/* Red patch */}
      <ellipse cx="44" cy="20" rx="11" ry="8" fill="#DC2626"/>
      {/* Yellow cheek */}
      <ellipse cx="52" cy="30" rx="8" ry="5" fill="#FCD34D"/>
      {/* Eye */}
      <circle cx="52" cy="25" r="7" fill="white"/>
      <circle cx="53" cy="25" r="4.5" fill="#1C1917"/>
      <circle cx="54" cy="24" r="1.8" fill="white"/>
      <circle cx="52" cy="25" r="7" stroke="#FCD34D" stroke-width="1.5" fill="none"/>
      {/* Beak — opens when speaking */}
      {speaking ? (
        <>
          <path d="M58 28 Q68 24 66 30Z" fill="#F59E0B"/>
          <path d="M58 32 Q68 36 66 30Z" fill="#D97706"/>
        </>
      ) : (
        <path d="M58 28 Q68 26 66 32 Q62 34 58 30Z" fill="#F59E0B"/>
      )}
      {/* Sound waves when speaking */}
      {speaking && (
        <>
          <motion.path d="M70 24 Q75 28 70 32" stroke="#F59E0B" stroke-width="2" fill="none" stroke-linecap="round"
            animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.6 }}/>
          <motion.path d="M73 21 Q80 28 73 35" stroke="#F59E0B" stroke-width="1.5" fill="none" stroke-linecap="round"
            animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}/>
        </>
      )}
    </motion.svg>
  );
}

export default function TryALetter() {
  const [selected, setSelected] = useState<DemoLetter>(DEMO_LETTERS[0]);
  const [speaking, setSpeaking] = useState(false);
  const [tapped, setTapped] = useState(false);

  const handleLetterClick = useCallback((item: DemoLetter) => {
    setSelected(item);
    setTapped(true);
    setSpeaking(true);
    speakLetter(`${item.letter} is for ${item.english}`);
    setTimeout(() => setSpeaking(false), 1800);
  }, []);

  const handleKokoClick = useCallback(() => {
    setSpeaking(true);
    speakLetter(`${selected.letter} is for ${selected.english}`);
    setTimeout(() => setSpeaking(false), 1800);
  }, [selected]);

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8 sm:mb-10"
      >
        <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs sm:text-sm font-bold px-4 py-2 rounded-full mb-4 border border-amber-200">
          ✨ Try it right now — no sign-up needed
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mb-3">
          Tap a letter. Hear Kòkò.
        </h2>
        <p className="text-stone-500 max-w-md mx-auto text-sm sm:text-base">
          This is exactly what your child will experience. Tap any letter below.
        </p>
      </motion.div>

      <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* Left — letter display + Kòkò */}
          <div className={`bg-gradient-to-br ${selected.colour} p-6 sm:p-8 flex flex-col items-center gap-4 min-h-[320px] justify-center relative overflow-hidden`}>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white opacity-10"/>
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white opacity-10"/>

            <AnimatePresence mode="wait">
              <motion.div
                key={selected.letter}
                initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-end gap-3 leading-none"
              >
                <span className="text-8xl sm:text-9xl font-extrabold text-white drop-shadow-lg">
                  {selected.letter}
                </span>
                <span className="text-6xl sm:text-7xl font-extrabold text-white/60 drop-shadow mb-2">
                  {selected.letter.toLowerCase()}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Object image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selected.letter + "-img"}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-20 h-20 bg-white/25 rounded-2xl p-2"
              >
                <Image src={selected.image} alt={selected.english} fill
                  className="object-contain p-1" unoptimized sizes="80px"/>
              </motion.div>
            </AnimatePresence>

            {/* Word association */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selected.letter + "-word"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <p className="text-white font-bold text-lg sm:text-xl drop-shadow">
                  {selected.letter} is for <span className="underline decoration-white/50">{selected.english}</span>
                </p>
                <div className="flex gap-2 mt-2 justify-center flex-wrap">
                  <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
                    🇬🇧 {selected.english}
                  </span>
                  <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
                    🌍 {selected.yoruba} ({selected.meaning})
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right — Kòkò + letter grid */}
          <div className="p-5 sm:p-6 flex flex-col gap-5">

            {/* Kòkò tap button */}
            <div className="flex items-center gap-4 bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <motion.button
                onClick={handleKokoClick}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 flex-shrink-0 cursor-pointer"
                aria-label="Tap Kòkò to hear the letter"
              >
                <KokoFace speaking={speaking} />
              </motion.button>
              <div>
                <p className="font-bold text-stone-800 text-sm">
                  {speaking ? "Kòkò is speaking…" : tapped ? "Tap Kòkò again!" : "Tap a letter to start!"}
                </p>
                <p className="text-stone-500 text-xs mt-0.5">
                  {speaking ? "🔊 Listen carefully…" : "Kòkò will say the letter for you"}
                </p>
              </div>
              {speaking && (
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="ml-auto text-2xl"
                >
                  🔊
                </motion.div>
              )}
            </div>

            {/* Letter grid */}
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">
                Tap any letter
              </p>
              <div className="grid grid-cols-5 gap-2">
                {DEMO_LETTERS.map((item) => (
                  <motion.button
                    key={item.letter}
                    onClick={() => handleLetterClick(item)}
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.08 }}
                    className={`
                      aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5
                      text-white font-extrabold text-sm shadow-sm transition
                      bg-gradient-to-br ${item.colour}
                      ${selected.letter === item.letter ? "ring-3 ring-offset-2 ring-amber-400 scale-110" : ""}
                    `}
                    aria-label={`Letter ${item.letter}`}
                    aria-pressed={selected.letter === item.letter}
                  >
                    <span className="text-base leading-none">{item.letter}</span>
                    <span className="text-[9px] opacity-75 leading-none">{item.letter.toLowerCase()}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-auto pt-2 border-t border-stone-100">
              <p className="text-xs text-stone-500 mb-3">
                🎉 Like what you see? The full app has all 26 letters, story mode, DJ booth, and progress tracking.
              </p>
              <Link
                href="/auth/signup"
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-2xl transition shadow-md shadow-amber-200 active:scale-95 text-sm sm:text-base"
              >
                Get the full experience — it&apos;s free →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
