"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useChild } from "@/hooks/useChild";
import { useProgress } from "@/hooks/useProgress";
import { useAccess } from "@/hooks/useAccess";
import { isShardFree } from "@/lib/access";
import Certificate from "@/components/ui/Certificate";
import UpgradePrompt from "@/components/ui/UpgradePrompt";
import SongButton from "@/components/ui/SongButton";
import type { SongData } from "@/lib/audio/songs";

const STORY_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const TOTAL = STORY_LETTERS.length;

// Narrative scenes — one per shard milestone
const SCENES = [
  { shards: 0,  title: "Kòkò has lost his voice!",         body: "One morning, Àmì woke up to find Kòkò completely silent. His voice had scattered into 10 sound shards, hidden inside the letters of the alphabet.",  bg: "from-stone-100 to-stone-200",   koko: "😢" },
  { shards: 2,  title: "The first shards glow!",            body: "Àmì found the first two shards! Kòkò can whisper now. \"A… B…\" he breathes softly. Keep going!",                                                       bg: "from-amber-50 to-yellow-100",   koko: "😮" },
  { shards: 4,  title: "Kòkò is getting stronger!",         body: "Four shards collected! Kòkò's beak is moving more. He can say \"C, D\" now. Àmì cheers him on!",                                                         bg: "from-amber-100 to-orange-100",  koko: "😊" },
  { shards: 6,  title: "Halfway there!",                    body: "Six shards! Kòkò can sing a little tune now. The forest animals are gathering to listen. Don't stop!",                                                    bg: "from-orange-100 to-amber-200",  koko: "😄" },
  { shards: 8,  title: "Almost there — Kòkò can sing!",     body: "Eight shards! Kòkò is dancing on Àmì's arm. His feathers are glowing bright green. Just two more shards to go!",                                        bg: "from-green-100 to-emerald-100", koko: "🥳" },
  { shards: 10, title: "Kòkò has his voice back!",          body: "All 10 shards collected! Kòkò bursts into song — the most beautiful sound in the whole forest. Àmì and Kòkò dance together. You did it!",               bg: "from-amber-300 to-orange-300",  koko: "🎉" },
];

// Celebration song — always free, plays when story is complete
const CELEBRATION_SONG: SongData = {
  key: "koko-restored",
  lyrics: "Kòkò has his voice back! Kòkò has his voice back! Sing and dance and shout hooray — Kòkò sings again today! A, B, C, D, E, F, G — Kòkò sings for you and me! Thank you for restoring Kòkò's voice — you made the very best choice!",
  audioPath: "/audio/songs/koko-restored.mp3",
};

function getCurrentScene(shards: number) {
  return [...SCENES].reverse().find(s => shards >= s.shards) ?? SCENES[0];
}

export default function StoryPage() {
  const { activeChild } = useChild();
  const { masteredLetters } = useProgress(activeChild?.id ?? null, "english");
  const { hasPaid } = useAccess(activeChild);

  const shardsCollected = STORY_LETTERS.filter(l => masteredLetters.includes(l)).length;
  // Free users can only complete first 3 shards
  const effectiveShards = hasPaid ? shardsCollected : Math.min(shardsCollected, 3);
  const completed = hasPaid && shardsCollected >= TOTAL;
  const pct = Math.round((effectiveShards / TOTAL) * 100);
  const scene = getCurrentScene(effectiveShards);
  const [showCert, setShowCert] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-5 pb-10 max-w-sm mx-auto w-full">

      {/* ── Scene card ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scene.shards}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`w-full rounded-3xl bg-gradient-to-br ${scene.bg} p-6 text-center shadow-md`}
        >
          <motion.div
            animate={completed ? { scale: [1, 1.15, 1], rotate: [0, -8, 8, 0] } : { scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: completed ? 1.5 : 3 }}
            className="text-6xl mb-3"
          >
            {scene.koko}
          </motion.div>
          <h2 className="font-extrabold text-stone-800 text-lg mb-2">{scene.title}</h2>
          <p className="text-stone-600 text-sm leading-relaxed">{scene.body}</p>
        </motion.div>
      </AnimatePresence>

      {/* ── Progress bar ── */}
      <div className="w-full">
        <div className="flex justify-between text-xs font-semibold text-stone-500 mb-1.5">
          <span>{shardsCollected}/{TOTAL} shards found</span>
          <span>{pct}%</span>
        </div>
        <div className="h-4 bg-stone-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* ── Shard grid ── */}
      <div className="w-full">
        <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2 text-center">
          Voice Shards
        </p>
        <div role="list" aria-label="Voice shards" className="grid grid-cols-5 gap-2">
          {STORY_LETTERS.map((letter, idx) => {
            const collected = masteredLetters.includes(letter);
            const shardLocked = !hasPaid && !isShardFree(idx);
            return (
              <motion.div
                key={letter}
                role="listitem"
                aria-label={shardLocked ? `Shard ${idx + 1} — locked` : `Shard ${letter}${collected ? ", collected" : ", not yet found"}`}
                animate={collected && !shardLocked ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.4 }}
                onClick={shardLocked ? () => setUpgradeOpen(true) : undefined}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-0.5 text-sm font-extrabold shadow-sm transition cursor-${shardLocked ? "pointer" : "default"}
                  ${shardLocked
                    ? "bg-stone-100 text-stone-300"
                    : collected
                    ? "bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-amber-200"
                    : "bg-stone-100 text-stone-400"
                  }`}
              >
                {shardLocked ? (
                  <span className="text-base">🔒</span>
                ) : (
                  <>
                    <span className="text-base">{collected ? letter : "?"}</span>
                    {collected && <span className="text-xs opacity-80">{letter.toLowerCase()}</span>}
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
        {!hasPaid && (
          <p className="text-center text-xs text-amber-600 font-semibold mt-2">
            🔒 Shards 4–10 locked ·{" "}
            <button onClick={() => setUpgradeOpen(true)} className="underline">Unlock Explorer</button>
          </p>
        )}
      </div>

      {/* ── Milestone badges ── */}
      <div className="w-full bg-white rounded-3xl p-4 shadow-sm ring-1 ring-stone-100">
        <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-3">Story milestones</p>
        <div className="flex flex-col gap-2">
          {SCENES.slice(1).map(s => {
            const reached = shardsCollected >= s.shards;
            return (
              <div key={s.shards} className={`flex items-center gap-3 p-2 rounded-xl transition ${reached ? "bg-amber-50" : "opacity-40"}`}>
                <span className="text-xl">{reached ? s.koko : "🔒"}</span>
                <div>
                  <p className={`text-xs font-bold ${reached ? "text-stone-800" : "text-stone-400"}`}>
                    {s.shards} shards — {s.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CTA ── */}
      {!completed && (
        <div className="w-full bg-white rounded-3xl shadow-md ring-1 ring-amber-100 p-5 text-center">
          <p className="text-stone-700 font-semibold mb-3 text-sm">
            {shardsCollected === 0
              ? "Start learning letters to collect shards!"
              : `${TOTAL - shardsCollected} more letter${TOTAL - shardsCollected > 1 ? "s" : ""} to go!`}
          </p>
          <Link href="/phonics/english"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-2xl transition shadow-md shadow-amber-200">
            Go to Phonics
          </Link>
        </div>
      )}

      {/* ── Completed — certificate ── */}
      {completed && (
        <div className="w-full bg-gradient-to-br from-amber-400 to-orange-400 rounded-3xl shadow-xl p-6 text-center flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: [-5, 5, -5], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-6xl"
          >
            🏆
          </motion.div>
          <div>
            <p className="font-extrabold text-white text-xl">Story Complete!</p>
            <p className="text-orange-100 text-sm mt-1">
              {activeChild?.name ?? "You"} restored Kòkò&apos;s voice!
            </p>
          </div>
          {/* Celebration song — always free */}
          <SongButton song={CELEBRATION_SONG} label="🎵 Hear Kòkò sing!" />
          <button
            onClick={() => setShowCert(true)}
            className="bg-white text-amber-600 font-extrabold px-8 py-3 rounded-2xl transition hover:bg-amber-50 shadow-md active:scale-95"
          >
            🎓 Get Certificate
          </button>
        </div>
      )}

      {showCert && (
        <Certificate
          childName={activeChild?.name ?? "Champion"}
          achievement="restored Kòkò's voice by mastering 10 letters"
          subject="Story Mode — English Phonics"
          onClose={() => setShowCert(false)}
        />
      )}

      <UpgradePrompt isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} feature="the full story (all 10 shards)" />

    </div>
  );
}
