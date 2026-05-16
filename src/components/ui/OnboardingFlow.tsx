"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  {
    emoji: "👋",
    title: "Welcome to Àmì by Kòkò!",
    body: "Your child is about to go on a phonics adventure with Àmì and her talking parrot Kòkò.",
    image: "/ami-koko.svg",
    cta: "Next →",
  },
  {
    emoji: "🔤",
    title: "Learn letters the fun way",
    body: "Tap any letter to hear Kòkò say it, trace it with your finger, and unlock it in the story.",
    image: null,
    visual: (
      <div className="grid grid-cols-4 gap-2 w-full max-w-[200px] mx-auto">
        {["A","B","C","D","E","F","G","H"].map((l, i) => (
          <div key={l} className={`aspect-square rounded-xl flex items-center justify-center text-white font-extrabold text-lg
            ${["from-amber-400 to-orange-400","from-green-400 to-emerald-500","from-rose-400 to-pink-500","from-violet-400 to-purple-500"][i % 4]}
            bg-gradient-to-br`}>
            {l}
          </div>
        ))}
      </div>
    ),
    cta: "Next →",
  },
  {
    emoji: "📖",
    title: "Help Kòkò find his voice",
    body: "Kòkò lost his voice! Every letter your child masters restores one sound shard. Collect all 10 to bring Kòkò back!",
    image: null,
    visual: (
      <div className="flex flex-col items-center gap-3">
        <div className="text-5xl">🦜</div>
        <div className="grid grid-cols-5 gap-2">
          {["A","B","C","?","?","?","?","?","?","?"].map((l, i) => (
            <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold
              ${i < 3 ? "bg-amber-400 text-white" : "bg-stone-100 text-stone-400"}`}>
              {l}
            </div>
          ))}
        </div>
      </div>
    ),
    cta: "Let's go! 🎉",
  },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center pt-5 pb-2">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? "w-6 bg-amber-500" : "w-1.5 bg-stone-200"
            }`}/>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="px-6 pb-6 flex flex-col items-center gap-4 text-center"
          >
            <div className="text-4xl">{current.emoji}</div>

            {current.image && (
              <div className="w-40 h-40 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current.image} alt="Àmì and Kòkò"
                  className="w-full h-full object-contain" />
              </div>
            )}

            {current.visual && current.visual}

            <h2 className="text-xl font-extrabold text-stone-900">{current.title}</h2>
            <p className="text-stone-500 text-sm leading-relaxed">{current.body}</p>

            <button
              onClick={() => isLast ? onComplete() : setStep(s => s + 1)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl transition shadow-md shadow-amber-200 text-base"
            >
              {current.cta}
            </button>

            {!isLast && (
              <button onClick={onComplete}
                className="text-xs text-stone-400 hover:text-stone-600 transition">
                Skip intro
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
