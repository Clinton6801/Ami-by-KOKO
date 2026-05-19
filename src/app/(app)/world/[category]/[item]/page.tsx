"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Koko from "@/components/characters/Koko";
import Certificate from "@/components/ui/Certificate";
import { WORLD_ITEMS, WORLD_CATEGORIES, getItemsByCategory } from "@/lib/content/world";
import { awardCertificate } from "@/lib/awardCertificate";
import { CERTIFICATE_CONFIGS } from "@/types";
import { useChild } from "@/hooks/useChild";
import { useProgress } from "@/hooks/useProgress";

const TOTAL_WORLD_ITEMS = Object.keys(WORLD_ITEMS).length; // 24

interface Props { params: Promise<{ category: string; item: string }> }

export default function WorldItemPage({ params }: Props) {
  const { category, item: itemKey } = use(params);
  const item = WORLD_ITEMS[itemKey];
  const cat = WORLD_CATEGORIES.find(c => c.key === category);
  if (!item || !cat) notFound();

  const [speaking, setSpeaking] = useState(false);
  const [known, setKnown] = useState(false);
  const [certToShow, setCertToShow] = useState<string | null>(null);
  const { activeChild } = useChild();
  const { masteredWorldItems } = useProgress(activeChild?.id ?? null, "english");

  const items = getItemsByCategory(category);
  const idx = items.findIndex(i => i.key === itemKey);
  const nextItem = idx < items.length - 1 ? items[idx + 1] : null;
  const prevItem = idx > 0 ? items[idx - 1] : null;

  function speak() {
    if (speaking || typeof window === "undefined") return;
    setSpeaking(true);
    window.speechSynthesis.cancel();
    // Say English name then Yorùbá name
    const u = new SpeechSynthesisUtterance(`${item.englishName}`);
    u.lang = "en-NG"; u.rate = 0.8; u.pitch = 1.2;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  return (
    <div className="flex flex-col items-center gap-5 pb-10">

      {/* Item card */}
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className={`w-full max-w-sm rounded-3xl bg-gradient-to-br ${cat.colour} shadow-xl p-6 flex flex-col items-center gap-4`}>
        <div className="w-28 h-28 bg-white/25 rounded-3xl p-3 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt={item.englishName}
            className="w-full h-full object-contain" />
        </div>
        <div className="text-center">
          <p className="text-white font-extrabold text-3xl">{item.englishName}</p>
          <p className="text-white/70 text-lg mt-1">{item.yorubaName}</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">🇬🇧 {item.englishName}</span>
          <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">🇳🇬 {item.yorubaName}</span>
        </div>
      </motion.div>

      {/* Kòkò sound button */}
      <motion.button onClick={speak} disabled={speaking} whileTap={{ scale: 0.93 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-md ring-1 ring-amber-100 p-4 flex items-center gap-4 transition hover:shadow-lg disabled:opacity-70"
        aria-label={`Hear Kòkò say ${item.englishName}`}>
        <div className="w-12 h-12 flex-shrink-0"><Koko speaking={speaking}/></div>
        <div className="flex-1 text-left">
          <p className="font-bold text-stone-800 text-sm">{speaking ? "Kòkò is speaking…" : "Tap to hear Kòkò!"}</p>
          <p className="text-stone-500 text-xs">English + Yorùbá</p>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0 ${speaking ? "bg-amber-300" : "bg-amber-500"}`}>
          {speaking ? "🔊" : "▶"}
        </div>
      </motion.button>

      {/* I know this! */}
      <div className="w-full max-w-sm">
        {!known ? (
          <button onClick={async () => {
            setKnown(true);
            if (activeChild?.id) {
              await fetch("/api/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  childId: activeChild.id,
                  language: "english",
                  letter: itemKey,
                  subject: "world",
                  patch: { mastered: true, heard_count: 1 },
                }),
              });

              // Check world_explorer — all 24 items mastered (include this one)
              const allMastered = new Set([...masteredWorldItems, itemKey]);
              if (allMastered.size >= TOTAL_WORLD_ITEMS) {
                const awarded = await awardCertificate(activeChild.id, "world_explorer");
                if (awarded) { setCertToShow("world_explorer"); return; }
              }
            }
          }}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-extrabold text-lg py-4 rounded-3xl transition shadow-md shadow-green-200 active:scale-95">
            ✅ Yes, I know this!
          </button>
        ) : (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-green-50 border-2 border-green-300 rounded-3xl p-5 text-center">
            <p className="text-5xl mb-2">🎉</p>
            <p className="font-extrabold text-green-700 text-lg">Well done!</p>
            {nextItem && (
              <Link href={`/world/${category}/${nextItem.key}`}
                className="inline-flex items-center gap-2 mt-3 bg-green-500 text-white font-bold px-5 py-2.5 rounded-2xl transition hover:bg-green-600">
                Next: {nextItem.englishName} →
              </Link>
            )}
          </motion.div>
        )}
      </div>

      {/* Prev / All / Next */}
      <div className="w-full max-w-sm flex items-center gap-2">
        {prevItem ? (
          <Link href={`/world/${category}/${prevItem.key}`}
            className="flex-1 bg-white rounded-2xl shadow-sm ring-1 ring-stone-100 py-3 text-center font-bold text-stone-600 hover:bg-amber-50 transition text-xs">
            ← {prevItem.englishName}
          </Link>
        ) : <div className="flex-1"/>}
        <Link href={`/world/${category}`}
          className="flex-1 bg-green-500 rounded-2xl py-3 text-center font-bold text-white hover:bg-green-600 transition shadow-md text-sm">
          All
        </Link>
        {nextItem ? (
          <Link href={`/world/${category}/${nextItem.key}`}
            className="flex-1 bg-white rounded-2xl shadow-sm ring-1 ring-stone-100 py-3 text-center font-bold text-stone-600 hover:bg-amber-50 transition text-xs">
            {nextItem.englishName} →
          </Link>
        ) : <div className="flex-1"/>}
      </div>

      {/* Certificate celebration */}
      {certToShow && CERTIFICATE_CONFIGS[certToShow as keyof typeof CERTIFICATE_CONFIGS] && (
        <Certificate
          childName={activeChild?.name ?? "Champion"}
          achievement={CERTIFICATE_CONFIGS[certToShow as keyof typeof CERTIFICATE_CONFIGS].achievement}
          subject={CERTIFICATE_CONFIGS[certToShow as keyof typeof CERTIFICATE_CONFIGS].subject}
          onClose={() => setCertToShow(null)}
        />
      )}
    </div>
  );
}
