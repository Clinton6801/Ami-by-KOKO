"use client";

import { useState, useEffect } from "react";
import { useChild } from "@/hooks/useChild";
import { useProgress } from "@/hooks/useProgress";
import { useStreak } from "@/hooks/useStreak";
import { useCertificates } from "@/hooks/useCertificates";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LETTER_DATA } from "@/lib/audio/clips";
import { WORLD_CATEGORIES, WORLD_ITEMS } from "@/lib/content/world";
import EditChildModal from "@/components/ui/EditChildModal";
import Certificate from "@/components/ui/Certificate";
import type { Child, CertificateType } from "@/types";
import { CERTIFICATE_CONFIGS } from "@/types";

const ALPHABET = Object.keys(LETTER_DATA);
const NUMBERS = ["1","2","3","4","5","6","7","8","9","10"];
const TOTAL_WORLD = Object.keys(WORLD_ITEMS).length; // 24

// ─── Certificate card ─────────────────────────────────────────────────────────

function CertificateCard({ type, earnedAt, onView }: {
  type: CertificateType; earnedAt: string; onView: () => void;
}) {
  const config = CERTIFICATE_CONFIGS[type];
  const date = new Date(earnedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const ICONS: Record<CertificateType, string> = {
    first_steps: "👣", letter_master: "🔤", number_star: "⭐",
    world_explorer: "🌍", story_hero: "🦜", assignment_champion: "📝", weekly_streak: "🔥",
  };
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 ring-1 ring-amber-200 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{ICONS[type]}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-stone-800 text-sm">{config.title}</p>
          <p className="text-stone-500 text-xs truncate">{config.achievement}</p>
        </div>
      </div>
      <p className="text-xs text-stone-400">Earned {date}</p>
      <button onClick={onView}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2 rounded-xl transition active:scale-95">
        View &amp; Download 📥
      </button>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ParentDashboardPage() {
  const { children, activeChild, selectChild, updateChild, loading: childrenLoading } = useChild();
  const {
    progress,
    literacyProgress,
    numeracyProgress,
    worldProgress,
    masteredCount,
    masteredLetters,
    masteredNumbers,
    masteredWorldItems,
    loading: progressLoading,
    newMilestone,
    clearMilestone,
  } = useProgress(activeChild?.id ?? null, "english");

  const { streak } = useStreak(activeChild?.id);
  const { certificates, loading: certsLoading, awardCertificate } = useCertificates(activeChild?.id ?? null);

  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [showCertificate, setShowCertificate] = useState<CertificateType | null>(null);

  const totalLetters = ALPHABET.length;
  const pct = Math.round((masteredCount / totalLetters) * 100);
  const numPct = Math.round((masteredNumbers.length / NUMBERS.length) * 100);
  const worldPct = Math.round((masteredWorldItems.length / TOTAL_WORLD) * 100);

  // Milestone → award + show cert
  useEffect(() => {
    if (!newMilestone || !activeChild?.id) return;
    async function handleMilestone() {
      const awarded = await awardCertificate(newMilestone!);
      if (awarded) setShowCertificate(newMilestone);
      clearMilestone();
    }
    handleMilestone();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMilestone]);

  const activeCertConfig = showCertificate ? CERTIFICATE_CONFIGS[showCertificate] : null;

  return (
    <div className="flex flex-col gap-5 pb-10">
      <h1 className="text-2xl font-extrabold text-stone-800">Dashboard</h1>

      {/* Loading skeleton */}
      {childrenLoading && (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-3xl p-4 shadow-sm ring-1 ring-stone-100 animate-pulse h-16"/>)}
        </div>
      )}

      {/* Child switcher */}
      {!childrenLoading && children.length > 0 && (
        <div className="flex gap-2 flex-wrap items-center">
          {children.map(child => (
            <button key={child.id} onClick={() => selectChild(child)}
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-semibold transition ${
                activeChild?.id === child.id ? "bg-amber-500 text-white shadow-md" : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-amber-50"
              }`}>
              <span>{child.avatar_url ?? "🧒🏾"}</span>{child.name}
            </button>
          ))}
          {activeChild && (
            <button onClick={() => setEditingChild(activeChild)}
              className="flex items-center gap-1 px-3 py-2 rounded-2xl text-xs font-semibold text-stone-500 bg-white ring-1 ring-stone-200 hover:bg-stone-50 transition">
              ✏️ Edit
            </button>
          )}
        </div>
      )}

      {!childrenLoading && !activeChild ? (
        <div className="bg-white rounded-3xl p-6 text-center shadow-sm ring-1 ring-stone-100">
          <p className="text-stone-500 mb-3">No child profile yet.</p>
          <Link href="/home" className="text-amber-600 font-semibold text-sm hover:underline">Add a child profile →</Link>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Letters", value: masteredCount, colour: "text-amber-500", icon: "⭐" },
              { label: "Day streak", value: streak > 0 ? `${streak}🔥` : "0", colour: "text-green-500", icon: "🔥" },
              { label: "Progress", value: `${pct}%`, colour: "text-rose-400", icon: "📈" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-3 shadow-sm ring-1 ring-stone-100 flex flex-col items-center gap-1">
                <span className="text-xl">{s.icon}</span>
                <span className={`text-xl font-extrabold ${s.colour}`}>{s.value}</span>
                <span className="text-xs text-stone-500">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Streak */}
          {streak > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-4 ring-1 ring-green-100 flex items-center gap-3">
              <span className="text-3xl">🔥</span>
              <div>
                <p className="font-extrabold text-green-800">{streak} day streak!</p>
                <p className="text-green-600 text-xs">
                  {streak >= 7 ? "Amazing consistency!" : streak >= 3 ? "Great habit forming!" : "Keep coming back every day!"}
                </p>
              </div>
            </div>
          )}

          {/* ── Issue 1 fix: Letter Progress — literacy only, filtered correctly ── */}
          <div className="bg-white rounded-3xl p-4 shadow-sm ring-1 ring-stone-100">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-bold text-stone-700">English Phonics</p>
              <span className="text-xs text-stone-500">{masteredCount}/{totalLetters} letters</span>
            </div>
            <div className="h-3 bg-stone-100 rounded-full overflow-hidden mb-3">
              <motion.div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}/>
            </div>
            {progressLoading ? (
              <p className="text-stone-400 text-sm">Loading…</p>
            ) : (
              <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5">
                {ALPHABET.map(letter => {
                  // Fix: only look at literacy rows
                  const p = literacyProgress.find(x => x.letter === letter);
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

          {/* ── Issue 2a: Numbers Progress ── */}
          <div className="bg-white rounded-3xl p-4 shadow-sm ring-1 ring-stone-100">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-bold text-stone-700">English Numbers</p>
              <span className="text-xs text-stone-500">{masteredNumbers.length}/{NUMBERS.length} numbers</span>
            </div>
            <div className="h-3 bg-stone-100 rounded-full overflow-hidden mb-3">
              <motion.div className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full"
                initial={{ width: 0 }} animate={{ width: `${numPct}%` }} transition={{ duration: 0.8 }}/>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {NUMBERS.map(num => {
                const p = numeracyProgress.find(x => x.letter === num);
                const mastered = p?.mastered ?? false;
                const heard = (p?.heard_count ?? 0) > 0;
                return (
                  <div key={num}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold cursor-default
                      ${mastered ? "bg-violet-400 text-white" : heard ? "bg-violet-100 text-violet-700" : "bg-stone-100 text-stone-400"}`}
                    title={mastered ? "Mastered" : heard ? "In progress" : "Not started"}>
                    {num}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Issue 2b: My World Progress ── */}
          <div className="bg-white rounded-3xl p-4 shadow-sm ring-1 ring-stone-100">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-bold text-stone-700">My World</p>
              <span className="text-xs text-stone-500">{masteredWorldItems.length}/{TOTAL_WORLD} items</span>
            </div>
            <div className="h-3 bg-stone-100 rounded-full overflow-hidden mb-4">
              <motion.div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                initial={{ width: 0 }} animate={{ width: `${worldPct}%` }} transition={{ duration: 0.8 }}/>
            </div>
            <div className="flex flex-col gap-3">
              {WORLD_CATEGORIES.map(cat => {
                const items = Object.values(WORLD_ITEMS).filter(i => i.category === cat.key);
                const catMastered = items.filter(i => masteredWorldItems.includes(i.key)).length;
                const catPct = Math.round((catMastered / items.length) * 100);
                return (
                  <div key={cat.key}>
                    <div className="flex justify-between text-xs text-stone-500 mb-1">
                      <span>{cat.emoji} {cat.label}</span>
                      <span>{catMastered}/{items.length}</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-400 rounded-full transition-all duration-700"
                        style={{ width: `${catPct}%` }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Issue 3 fix: Certificates Gallery ── */}
          <div className="bg-white rounded-3xl p-4 shadow-sm ring-1 ring-stone-100">
            <p className="text-sm font-bold text-stone-700 mb-3">🏆 My Certificates</p>
            {certsLoading ? (
              <div className="flex gap-2">
                {[1,2].map(i => <div key={i} className="flex-1 h-24 bg-stone-100 rounded-2xl animate-pulse"/>)}
              </div>
            ) : certificates.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-4xl mb-2">🦜</p>
                <p className="text-stone-500 text-sm">Complete activities with Kòkò to earn certificates!</p>
                <p className="text-stone-400 text-xs mt-1">Master letters A–F to earn your first one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {certificates.map(cert => (
                  <CertificateCard
                    key={cert.id}
                    type={cert.type}
                    earnedAt={cert.earned_at}
                    onView={() => setShowCertificate(cert.type)}
                  />
                ))}
              </div>
            )}
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
            onSaved={(updated) => { updateChild(updated); setEditingChild(null); }}
            onClose={() => setEditingChild(null)}
          />
        )}
      </AnimatePresence>

      {/* Certificate modal */}
      <AnimatePresence>
        {showCertificate && activeCertConfig && (
          <Certificate
            childName={activeChild?.name ?? "Champion"}
            achievement={activeCertConfig.achievement}
            subject={activeCertConfig.subject}
            onClose={() => setShowCertificate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
