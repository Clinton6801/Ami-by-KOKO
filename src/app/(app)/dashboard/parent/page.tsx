"use client";

import { useState } from "react";
import { useChild } from "@/hooks/useChild";
import { useProgress } from "@/hooks/useProgress";
import { useStreak } from "@/hooks/useStreak";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LETTER_DATA } from "@/lib/audio/clips";
import EditChildModal from "@/components/ui/EditChildModal";
import type { Child } from "@/types";

const ALPHABET = Object.keys(LETTER_DATA);

export default function ParentDashboardPage() {
  const { children, activeChild, selectChild, updateChild, refresh } = useChild();
  const { progress, masteredCount, loading } = useProgress(activeChild?.id ?? null, "english");
  const { streak } = useStreak(activeChild?.id);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  const totalLetters = ALPHABET.length;
  const pct = Math.round((masteredCount / totalLetters) * 100);

  return (
    <div className="flex flex-col gap-5 pb-10">
      <h1 className="text-2xl font-extrabold text-stone-800">Dashboard</h1>

      {/* Child switcher */}
      {children.length > 0 && (
        <div className="flex gap-2 flex-wrap items-center">
          {children.map(child => (
            <button key={child.id} onClick={() => selectChild(child)}
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-semibold transition ${
                activeChild?.id === child.id
                  ? "bg-amber-500 text-white shadow-md"
                  : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-amber-50"
              }`}>
              <span>{child.avatar_url ?? "🧒🏾"}</span>
              {child.name}
            </button>
          ))}

          {/* Edit active child */}
          {activeChild && (
            <button onClick={() => setEditingChild(activeChild)}
              className="flex items-center gap-1 px-3 py-2 rounded-2xl text-xs font-semibold text-stone-500 bg-white ring-1 ring-stone-200 hover:bg-stone-50 transition">
              ✏️ Edit
            </button>
          )}
        </div>
      )}

      {!activeChild ? (
        <div className="bg-white rounded-3xl p-6 text-center shadow-sm ring-1 ring-stone-100">
          <p className="text-stone-500 mb-3">No child profile yet.</p>
          <Link href="/home" className="text-amber-600 font-semibold text-sm hover:underline">
            Add a child profile →
          </Link>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Mastered", value: masteredCount, colour: "text-amber-500", icon: "⭐" },
              { label: "Day streak", value: streak > 0 ? `${streak}🔥` : "0", colour: "text-green-500", icon: "🔥" },
              { label: "Progress",  value: `${pct}%`,   colour: "text-rose-400",  icon: "📈" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-3 shadow-sm ring-1 ring-stone-100 flex flex-col items-center gap-1">
                <span className="text-xl">{s.icon}</span>
                <span className={`text-xl font-extrabold ${s.colour}`}>{s.value}</span>
                <span className="text-xs text-stone-500">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="bg-white rounded-3xl p-4 shadow-sm ring-1 ring-stone-100">
            <div className="flex justify-between text-xs font-semibold text-stone-500 mb-2">
              <span>English Phonics</span>
              <span>{masteredCount}/{totalLetters} letters</span>
            </div>
            <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}/>
            </div>
          </div>

          {/* Streak info */}
          {streak > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-4 ring-1 ring-green-100 flex items-center gap-3">
              <span className="text-3xl">🔥</span>
              <div>
                <p className="font-extrabold text-green-800">
                  {streak} day streak!
                </p>
                <p className="text-green-600 text-xs">
                  {streak >= 7 ? "Amazing consistency! Keep it up!" :
                   streak >= 3 ? "Great habit forming!" :
                   "Keep coming back every day!"}
                </p>
              </div>
            </div>
          )}

          {/* Letter grid */}
          <div className="bg-white rounded-3xl p-4 shadow-sm ring-1 ring-stone-100">
            <p className="text-sm font-bold text-stone-700 mb-3">Letter Progress</p>
            {loading ? (
              <p className="text-stone-400 text-sm">Loading…</p>
            ) : (
              <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5">
                {ALPHABET.map(letter => {
                  const p = progress.find(x => x.letter === letter);
                  const mastered = p?.mastered ?? false;
                  const heard = (p?.heard_count ?? 0) > 0;
                  return (
                    <div key={letter}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold cursor-default
                        ${mastered ? "bg-amber-400 text-white" : heard ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-400"}`}
                      title={mastered ? "Mastered" : heard ? "In progress" : "Not started"}>
                      {letter}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex gap-3 mt-3 text-xs text-stone-500 flex-wrap">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400 inline-block"/> Mastered</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 inline-block"/> In progress</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-stone-100 inline-block"/> Not started</span>
            </div>
          </div>

          {/* Subscription */}
          <div className="bg-white rounded-3xl p-4 shadow-sm ring-1 ring-stone-100">
            <p className="text-sm font-bold text-stone-700 mb-2">Subscription</p>
            <p className="text-stone-500 text-sm">Free plan — English phonics included.</p>
            <Link href="/settings" className="inline-flex items-center gap-1 mt-2 text-amber-600 font-semibold text-sm hover:underline">
              Upgrade to unlock Yorùbá →
            </Link>
          </div>
        </>
      )}

      {/* Edit child modal */}
      <AnimatePresence>
        {editingChild && (
          <EditChildModal
            child={editingChild}
            onSaved={(updated) => {
              updateChild(updated);
              setEditingChild(null);
            }}
            onClose={() => setEditingChild(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
