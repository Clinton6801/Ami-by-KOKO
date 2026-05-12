"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import CreateChildModal from "@/components/ui/CreateChildModal";
import { useProgress } from "@/hooks/useProgress";
import type { Child } from "@/types";

const MODES = [
  {
    href: "/phonics",
    emoji: "🔤",
    title: "Phonics",
    description: "Learn letters with Kòkò",
    gradient: "from-amber-400 to-orange-400",
    shadow: "shadow-amber-200",
    ring: "ring-amber-200",
  },
  {
    href: "/dj-booth",
    emoji: "🎵",
    title: "DJ Booth",
    description: "Mix sounds and make music",
    gradient: "from-green-500 to-emerald-400",
    shadow: "shadow-green-200",
    ring: "ring-green-200",
  },
  {
    href: "/story",
    emoji: "📖",
    title: "Story Mode",
    description: "Help Kòkò find his voice",
    gradient: "from-rose-400 to-pink-400",
    shadow: "shadow-rose-200",
    ring: "ring-rose-200",
  },
];

export default function HomePage() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [child, setChild] = useState<Child | null | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

  const { masteredCount, masteredLetters } = useProgress(child?.id ?? null, "english");
  const STORY_LETTERS = ["A","B","C","D","E","F","G","H","I","J"];
  const shardsFound = STORY_LETTERS.filter(l => masteredLetters.includes(l)).length;

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      setChild(data ?? null);
      // Auto-show modal if no child profile exists
      if (!data) setShowModal(true);
    }
    load();
  }, [supabase]);

  function handleChildCreated() {
    setShowModal(false);
    // Reload child
    if (!userId) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("children")
      .select("*")
      .eq("parent_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data }: { data: Child | null }) => setChild(data));
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-10">

        {/* ── Hero card ─────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl mx-2 mt-2 bg-gradient-to-br from-amber-400 via-orange-300 to-yellow-300 shadow-xl shadow-amber-200 min-h-[260px]">

          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white opacity-10" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white opacity-10" />
          <div className="absolute top-4 right-24 w-16 h-16 rounded-full bg-white opacity-10" />

          {/* Text */}
          <div className="relative z-10 pt-8 pl-6 pr-4 pb-4 max-w-[55%]">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {child !== undefined && (
                <p className="text-orange-700 font-semibold text-sm mb-1">
                  {child ? `Hi, ${child.name}! 👋` : "Welcome! 👋"}
                </p>
              )}
              <h1 className="text-2xl font-extrabold text-white leading-tight drop-shadow-sm">
                Ready to learn with Kòkò?
              </h1>
              <p className="text-orange-100 text-sm mt-2 leading-relaxed">
                Kòkò has lost his voice…<br />
                help him find it!
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4"
            >
              <Link
                href="/phonics"
                className="inline-flex items-center gap-2 bg-white text-amber-600 font-bold text-sm px-5 py-2.5 rounded-2xl shadow-md hover:bg-amber-50 transition active:scale-95"
              >
                Start learning →
              </Link>
            </motion.div>
          </div>

          {/* Àmì image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="absolute right-0 bottom-0 w-44 h-56 sm:w-52 sm:h-64"
          >
            <Image
              src="/ami.png"
              alt="Àmì holding Kòkò the parrot"
              fill
              className="object-contain object-bottom"
              priority
              sizes="208px"
            />
          </motion.div>
        </div>

        {/* ── Mode cards ────────────────────────────────────── */}
        <div className="px-4 mt-8">
          <h2 className="text-lg font-bold text-stone-700 mb-4">
            What do you want to do today?
          </h2>

          <div className="flex flex-col gap-4">
            {MODES.map((mode, i) => (
              <motion.div
                key={mode.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              >
                <Link
                  href={mode.href}
                  className={`flex items-center gap-4 p-4 rounded-3xl bg-white shadow-md ${mode.shadow} ring-1 ${mode.ring} transition hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center text-3xl shadow-sm flex-shrink-0`}>
                    {mode.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-stone-800 text-base">{mode.title}</p>
                    <p className="text-stone-500 text-sm">{mode.description}</p>
                  </div>
                  <div className="text-stone-300 text-xl">›</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Quick stats ───────────────────────────────────── */}
        <div className="px-4 mt-8">
          <div className="bg-white rounded-3xl p-4 shadow-sm ring-1 ring-stone-100 flex items-center justify-around">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-extrabold text-amber-500">{masteredCount}</span>
              <span className="text-xs text-stone-500">Letters learnt</span>
            </div>
            <div className="w-px h-10 bg-stone-100" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-extrabold text-green-500">0</span>
              <span className="text-xs text-stone-500">Day streak 🔥</span>
            </div>
            <div className="w-px h-10 bg-stone-100" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-extrabold text-rose-400">{shardsFound}/10</span>
              <span className="text-xs text-stone-500">Shards found</span>
            </div>
          </div>
        </div>

        {/* ── Add child button (if no child yet) ───────────── */}
        {child === null && (
          <div className="px-4 mt-4">
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-white rounded-3xl p-4 shadow-sm ring-1 ring-amber-200 flex items-center gap-3 hover:bg-amber-50 transition"
            >
              <span className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-xl">➕</span>
              <div className="text-left">
                <p className="font-bold text-stone-800 text-sm">Add a child profile</p>
                <p className="text-stone-500 text-xs">Track progress and streaks</p>
              </div>
            </button>
          </div>
        )}

      </div>

      {/* ── Child creation modal ──────────────────────────── */}
      <AnimatePresence>
        {showModal && userId && (
          <CreateChildModal
            parentId={userId}
            onCreated={handleChildCreated}
          />
        )}
      </AnimatePresence>
    </>
  );
}
