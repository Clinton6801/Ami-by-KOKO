"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import CreateChildModal from "@/components/ui/CreateChildModal";
import OnboardingFlow from "@/components/ui/OnboardingFlow";
import { useProgress } from "@/hooks/useProgress";
import { useStreak } from "@/hooks/useStreak";
import { useChild } from "@/hooks/useChild";
import { useAssignments } from "@/hooks/useAssignments";
import { SUBJECT_EMOJIS, CLASS_LABELS, type ChildWithClass } from "@/types";

const MODES = [
  { href: "/literacy",  emoji: "🔤", title: "Literacy & Language",  description: "Letters, sounds and tracing",  gradient: "from-amber-400 to-orange-400", shadow: "shadow-amber-200", ring: "ring-amber-200" },
  { href: "/numeracy",  emoji: "🔢", title: "Numbers & Shapes",     description: "Count, trace and explore",     gradient: "from-violet-500 to-purple-400", shadow: "shadow-violet-200", ring: "ring-violet-200" },
  { href: "/world",     emoji: "🌍", title: "My World",             description: "Animals, colours and more",    gradient: "from-green-500 to-emerald-400", shadow: "shadow-green-200", ring: "ring-green-200" },
  { href: "/dj-booth",  emoji: "🎵", title: "DJ Booth",             description: "Mix sounds and make music",    gradient: "from-sky-400 to-blue-500",      shadow: "shadow-sky-200",   ring: "ring-sky-200"   },
  { href: "/story",     emoji: "📖", title: "Story Mode",           description: "Help Kòkò find his voice",     gradient: "from-rose-400 to-pink-400",     shadow: "shadow-rose-200",  ring: "ring-rose-200"  },
];

const STORY_LETTERS = ["A","B","C","D","E","F","G","H","I","J"];

export default function HomePage() {
  const supabase = createClient();
  const { children, activeChild, selectChild, refresh, loading: childrenLoading } = useChild();
  const activeChildWithClass = activeChild as ChildWithClass | null;
  const { masteredCount, masteredLetters } = useProgress(activeChild?.id ?? null, "english");
  const { streak } = useStreak(activeChild?.id);
  const { assignments, isCompleted } = useAssignments(activeChildWithClass);

  const [userId, setUserId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);

  const shardsFound = STORY_LETTERS.filter(l => masteredLetters.includes(l)).length;
  const isSchoolChild = !!activeChildWithClass?.school_id;

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      if (!localStorage.getItem("onboarding_done")) setShowOnboarding(true);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-24">

        {/* ── Hero card ── */}
        <div className="relative overflow-hidden rounded-3xl mx-2 mt-2 bg-gradient-to-br from-amber-400 via-orange-300 to-yellow-300 shadow-xl shadow-amber-200 min-h-[260px]">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white opacity-10" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white opacity-10" />

          <div className="relative z-10 pt-8 pl-6 pr-4 pb-4 max-w-[55%]">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-orange-700 font-semibold text-sm">
                  {childrenLoading ? "Loading…"
                    : activeChild ? `Hi, ${activeChild.name}! 👋`
                    : "Welcome! 👋"}
                </p>
                {children.length > 1 && (
                  <button onClick={() => setShowSwitcher(v => !v)}
                    className="text-orange-600 bg-white/30 hover:bg-white/50 rounded-full px-2 py-0.5 text-xs font-bold transition"
                    aria-label="Switch child">
                    switch ↕
                  </button>
                )}
              </div>

              {/* School context badge */}
              {isSchoolChild && activeChildWithClass?.class && (
                <div className="inline-flex items-center gap-1.5 bg-white/25 rounded-full px-2.5 py-1 mb-2">
                  <span className="text-xs font-bold text-white">
                    🏫 {CLASS_LABELS[activeChildWithClass.class]}
                    {activeChildWithClass.term ? ` · Term ${activeChildWithClass.term}` : ""}
                  </span>
                </div>
              )}

              {/* Child switcher dropdown */}
              <AnimatePresence>
                {showSwitcher && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute top-20 left-6 z-20 bg-white rounded-2xl shadow-xl ring-1 ring-amber-100 py-2 min-w-[160px]">
                    {children.map(c => (
                      <button key={c.id} onClick={() => { selectChild(c); setShowSwitcher(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition ${
                          activeChild?.id === c.id ? "bg-amber-50 font-bold text-amber-700" : "text-stone-700 hover:bg-amber-50"
                        }`}>
                        <span>{c.avatar_url ?? "🧒🏾"}</span>
                        {c.name}
                        {activeChild?.id === c.id && <span className="ml-auto text-amber-500">✓</span>}
                      </button>
                    ))}
                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button onClick={() => { setShowModal(true); setShowSwitcher(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-stone-500 hover:bg-stone-50 transition">
                        ➕ Add child
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <h1 className="text-2xl font-extrabold text-white leading-tight drop-shadow-sm">
                Ready to learn with Kòkò?
              </h1>
              <p className="text-orange-100 text-sm mt-2 leading-relaxed">
                Kòkò has lost his voice…<br/>help him find it!
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-4">
              <Link href="/literacy"
                className="inline-flex items-center gap-2 bg-white text-amber-600 font-bold text-sm px-5 py-2.5 rounded-2xl shadow-md hover:bg-amber-50 transition active:scale-95">
                Start learning →
              </Link>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="absolute right-0 bottom-0 w-44 h-56 sm:w-52 sm:h-64">
            <Image src="/ami-koko.svg" alt="Àmì holding Kòkò the parrot" fill
              className="object-contain object-bottom" priority unoptimized sizes="208px"/>
          </motion.div>
        </div>

        {/* ── Assignments section (school children only) ── */}
        {isSchoolChild && assignments.length > 0 && (
          <div className="px-4 mt-6">
            <h2 className="text-base font-bold text-stone-700 mb-3">📝 This Week&apos;s Assignments</h2>
            <div className="flex flex-col gap-2">
              {assignments.map(a => {
                const done = isCompleted(a.id);
                return (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl bg-white shadow-sm ring-1 ${
                      done ? "ring-green-200" : "ring-amber-100"
                    }`}>
                    <span className="text-2xl">{SUBJECT_EMOJIS[a.subject]}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${done ? "text-stone-400 line-through" : "text-stone-800"}`}>
                        {a.title}
                      </p>
                      <p className="text-xs text-stone-400">
                        {a.content_keys.join(", ")}
                        {a.due_date ? ` · Due ${new Date(a.due_date).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                    {done ? (
                      <span className="text-green-500 font-bold text-sm flex-shrink-0">✅ Done</span>
                    ) : (
                      <Link href={`/assignment/${a.id}`}
                        className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition">
                        Start →
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Mode cards ── */}
        <div className="px-4 mt-6">
          <h2 className="text-base font-bold text-stone-700 mb-3">What do you want to do today?</h2>
          <div className="flex flex-col gap-3">
            {MODES.map((mode, i) => (
              <motion.div key={mode.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}>
                <Link href={mode.href}
                  className={`flex items-center gap-4 p-4 rounded-3xl bg-white shadow-md ${mode.shadow} ring-1 ${mode.ring} transition hover:scale-[1.02] active:scale-[0.98]`}>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center text-2xl shadow-sm flex-shrink-0`}>
                    {mode.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-stone-800 text-sm">{mode.title}</p>
                    <p className="text-stone-500 text-xs">{mode.description}</p>
                  </div>
                  <div className="text-stone-300">›</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Quick stats (hide subscription prompt for school children) ── */}
        <div className="px-4 mt-6">
          <div className="bg-white rounded-3xl p-4 shadow-sm ring-1 ring-stone-100 flex items-center justify-around">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-extrabold text-amber-500">{masteredCount}</span>
              <span className="text-xs text-stone-500">Learnt</span>
            </div>
            <div className="w-px h-10 bg-stone-100" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-extrabold text-green-500">
                {streak > 0 ? `${streak}🔥` : "0"}
              </span>
              <span className="text-xs text-stone-500">Streak</span>
            </div>
            <div className="w-px h-10 bg-stone-100" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-extrabold text-rose-400">{shardsFound}/10</span>
              <span className="text-xs text-stone-500">Shards</span>
            </div>
          </div>
        </div>

        {/* ── No child profile banner ── */}
        {!childrenLoading && children.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 mt-4">
            <div className="bg-white rounded-3xl p-4 shadow-sm ring-1 ring-amber-200 flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-xl flex-shrink-0">👶</span>
              <div className="flex-1">
                <p className="font-bold text-stone-800 text-sm">Add a child profile</p>
                <p className="text-stone-500 text-xs">Track letters, streaks and story progress</p>
              </div>
              <button onClick={() => userId && setShowModal(true)}
                className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition">
                Add
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {showSwitcher && <div className="fixed inset-0 z-10" onClick={() => setShowSwitcher(false)} />}

      <AnimatePresence>
        {showModal && userId && (
          <CreateChildModal parentId={userId}
            onCreated={() => { setShowModal(false); refresh(); }}
            onClose={() => setShowModal(false)}/>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingFlow onComplete={() => {
            localStorage.setItem("onboarding_done", "1");
            setShowOnboarding(false);
          }}/>
        )}
      </AnimatePresence>
    </>
  );
}
