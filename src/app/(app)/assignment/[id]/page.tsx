"use client";

/**
 * Assignment activity page — /assignment/[id]
 *
 * Flow:
 * 1. Load assignment + check which items are already done (from progress table)
 * 2. Show items in sequence — one at a time
 * 3. Each item: hear Kòkò say it, then trace it
 * 4. After tracing complete → auto-advance to next item
 * 5. After all items done → celebration screen + mark assignment_progress as completed
 */

import { use, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useChild } from "@/hooks/useChild";
import TracingCanvas from "@/components/phonics/TracingCanvas";
import Koko from "@/components/characters/Koko";
import Certificate from "@/components/ui/Certificate";
import { awardCertificate } from "@/lib/awardCertificate";
import { CERTIFICATE_CONFIGS } from "@/types";
import type { Assignment } from "@/types";
import { LETTER_DATA } from "@/lib/audio/clips";
import { WORLD_ITEMS } from "@/lib/content/world";

interface Props {
  params: Promise<{ id: string }>;
}

// ─── Resolve display data for a content key ───────────────────────────────────

function getItemData(key: string, subject: string) {
  if (subject === "literacy") {
    const upper = key.toUpperCase();
    const data = LETTER_DATA.english[upper];
    return {
      display: upper,
      subtitle: data ? `${data.englishWord} · ${data.localWord}` : key,
      imageUrl: data?.imageUrl,
      speakText: `${key}. ${data?.englishWord ?? ""}`,
    };
  }
  if (subject === "numeracy") {
    const numberWords: Record<string, string> = {
      "1":"One","2":"Two","3":"Three","4":"Four","5":"Five",
      "6":"Six","7":"Seven","8":"Eight","9":"Nine","10":"Ten",
    };
    return {
      display: key,
      subtitle: numberWords[key] ?? key,
      imageUrl: undefined,
      speakText: `${numberWords[key] ?? key}. ${key}`,
    };
  }
  // world
  const item = WORLD_ITEMS[key];
  return {
    display: item?.englishName ?? key,
    subtitle: item?.yorubaName ?? "",
    imageUrl: item?.imageUrl,
    speakText: item ? `${item.englishName}. ${item.yorubaName}` : key,
  };
}

// ─── Single item activity ─────────────────────────────────────────────────────

interface ItemActivityProps {
  itemKey: string;
  subject: string;
  index: number;
  total: number;
  onComplete: () => void;
}

function ItemActivity({ itemKey, subject, index, total, onComplete }: ItemActivityProps) {
  const [speaking, setSpeaking] = useState(false);
  const [traced, setTraced] = useState(false);
  const data = getItemData(itemKey, subject);

  // Auto-speak when item loads
  useEffect(() => {
    const timer = setTimeout(() => speak(), 600);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemKey]);

  function speak() {
    if (typeof window === "undefined") return;
    setSpeaking(true);
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(data.speakText);
    u.lang = "en-NG"; u.rate = 0.8; u.pitch = 1.2;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  function handleTraced() {
    setTraced(true);
    // Short delay then advance
    setTimeout(() => onComplete(), 1000);
  }

  return (
    <motion.div
      key={itemKey}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-5 w-full"
    >
      {/* Progress indicator */}
      <div className="w-full flex items-center gap-2">
        <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-amber-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((index) / total) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-xs font-bold text-stone-500 flex-shrink-0">
          {index + 1}/{total}
        </span>
      </div>

      {/* Item display card */}
      <div className="w-full max-w-sm bg-gradient-to-br from-amber-400 to-orange-400 rounded-3xl p-6 flex flex-col items-center gap-3 shadow-xl shadow-amber-200">
        {data.imageUrl && (
          <div className="w-20 h-20 bg-white/25 rounded-2xl p-2 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.imageUrl} alt={data.display}
              className="w-full h-full object-contain p-1" />
          </div>
        )}
        <span className="text-6xl font-extrabold text-white drop-shadow-lg">
          {data.display}
        </span>
        {data.subtitle && (
          <p className="text-white/80 text-sm font-medium">{data.subtitle}</p>
        )}
      </div>

      {/* Kòkò speak button */}
      <motion.button
        onClick={speak}
        disabled={speaking}
        whileTap={{ scale: 0.93 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-md ring-1 ring-amber-100 p-4 flex items-center gap-4 transition hover:shadow-lg disabled:opacity-70"
      >
        <div className="w-12 h-12 flex-shrink-0"><Koko speaking={speaking}/></div>
        <div className="flex-1 text-left">
          <p className="font-bold text-stone-800 text-sm">
            {speaking ? "Kòkò is speaking…" : "Tap to hear again"}
          </p>
          <p className="text-stone-400 text-xs">Listen carefully!</p>
        </div>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0 ${speaking ? "bg-amber-300" : "bg-amber-500"}`}>
          {speaking ? "🔊" : "▶"}
        </div>
      </motion.button>

      {/* Tracing */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-md ring-1 ring-green-100 p-4">
        <p className="text-center font-bold text-stone-700 text-sm mb-4">
          Now trace it! ✏️
        </p>
        <TracingCanvas
          letter={subject === "literacy" ? itemKey.toUpperCase() : data.display}
          mode={subject === "numeracy" ? "number" : "letter"}
          onTraced={handleTraced}
        />
      </div>

      {/* Done feedback */}
      <AnimatePresence>
        {traced && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-green-50 border-2 border-green-300 rounded-3xl p-4 text-center"
          >
            <p className="text-2xl mb-1">⭐</p>
            <p className="font-extrabold text-green-700">
              {index + 1 < total ? "Great! Moving on…" : "All done! 🎉"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Celebration screen ───────────────────────────────────────────────────────

function CelebrationScreen({ title, onHome }: { title: string; onHome: () => void }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center gap-6 text-center py-10"
    >
      <motion.div
        animate={{ rotate: [-5, 5, -5], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-7xl"
      >
        🎉
      </motion.div>

      <div>
        <h1 className="text-3xl font-extrabold text-stone-800 mb-2">
          Assignment Complete!
        </h1>
        <p className="text-stone-500 text-base max-w-xs mx-auto">
          You finished <span className="font-bold text-amber-600">{title}</span>. Kòkò is so proud of you!
        </p>
      </div>

      <div className="w-40 h-40 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ami-koko.svg" alt="Àmì and Kòkò celebrating"
          className="w-full h-full object-contain" />
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onHome}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-lg py-4 rounded-2xl transition shadow-lg shadow-amber-200"
        >
          Back to Home 🏠
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AssignmentPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const { activeChild } = useChild();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certToShow, setCertToShow] = useState<string | null>(null);

  const load = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("assignments")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      setError("Assignment not found.");
      setLoading(false);
      return;
    }

    setAssignment(data as Assignment);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleItemComplete() {
    if (!assignment) return;

    const nextIndex = currentIndex + 1;

    // Save progress for this item
    if (activeChild?.id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("progress").upsert({
        child_id: activeChild.id,
        language: "english",
        letter: assignment.content_keys[currentIndex],
        subject: assignment.subject,
        class: assignment.class,
        term: assignment.term,
        mastered: true,
        last_activity: new Date().toISOString(),
      }, { onConflict: "child_id,language,letter" });
    }

    if (nextIndex >= assignment.content_keys.length) {
      // All items done — mark assignment complete
      if (activeChild?.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("assignment_progress").upsert({
          assignment_id: id,
          child_id: activeChild.id,
          completed: true,
          completed_at: new Date().toISOString(),
        }, { onConflict: "assignment_id,child_id" });

        // Notify parent via WhatsApp (fire-and-forget)
        fetch("/api/notifications/whatsapp/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childId: activeChild.id,
            type: "assignment_complete",
            detail: assignment.title,
          }),
        }).catch(() => {});

        // Check assignment_champion — 5+ assignments completed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { count } = await (supabase as any)
          .from("assignment_progress")
          .select("id", { count: "exact", head: true })
          .eq("child_id", activeChild.id)
          .eq("completed", true);

        if ((count ?? 0) >= 5) {
          const awarded = await awardCertificate(activeChild.id, "assignment_champion");
          if (awarded) { setCertToShow("assignment_champion"); return; }
        }
      }
      setCompleted(true);
    } else {
      setCurrentIndex(nextIndex);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3 pb-10">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-3xl h-24 animate-pulse ring-1 ring-stone-100"/>
        ))}
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="bg-white rounded-3xl p-6 text-center shadow-sm ring-1 ring-stone-100">
        <p className="text-stone-500">{error ?? "Assignment not found."}</p>
        <button onClick={() => router.push("/home")}
          className="mt-4 text-amber-600 font-semibold text-sm hover:underline">
          ← Back to Home
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <>
        <CelebrationScreen title={assignment.title} onHome={() => router.push("/home")}/>
        {certToShow && CERTIFICATE_CONFIGS[certToShow as keyof typeof CERTIFICATE_CONFIGS] && (
          <Certificate
            childName={activeChild?.name ?? "Champion"}
            achievement={CERTIFICATE_CONFIGS[certToShow as keyof typeof CERTIFICATE_CONFIGS].achievement}
            subject={CERTIFICATE_CONFIGS[certToShow as keyof typeof CERTIFICATE_CONFIGS].subject}
            onClose={() => setCertToShow(null)}
          />
        )}
      </>
    );
  }

  const currentKey = assignment.content_keys[currentIndex];

  return (
    <div className="flex flex-col gap-4 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/home")}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition flex-shrink-0"
          aria-label="Exit assignment">
          ✕
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-stone-800 text-sm truncate">{assignment.title}</p>
          <p className="text-xs text-stone-400">
            {assignment.content_keys.length} items · {assignment.subject}
          </p>
        </div>
      </div>

      {/* Activity */}
      <AnimatePresence mode="wait">
        <ItemActivity
          key={currentKey}
          itemKey={currentKey}
          subject={assignment.subject}
          index={currentIndex}
          total={assignment.content_keys.length}
          onComplete={handleItemComplete}
        />
      </AnimatePresence>
    </div>
  );
}
