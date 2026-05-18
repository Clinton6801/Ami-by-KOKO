"use client";

/**
 * StudentModal — Add or Edit a student in the school admin panel.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  CLASS_LABELS,
  type ClassLevel, type Term, type ChildWithClass,
} from "@/types";
import { useClassConfig } from "@/hooks/useClassConfig";

const AVATARS = ["🧒🏾","👦🏾","👧🏾","🧒🏽","👦🏽","👧🏽","🧒🏿","👦🏿","👧🏿"];

interface StudentModalProps {
  schoolId: string;
  student?: ChildWithClass | null;   // null = create mode
  onSaved: () => void;
  onClose: () => void;
}

const ALL_CLASSES: ClassLevel[] = ["sprout_1","sprout_2","sprout_3","stepping_stone"];

export default function StudentModal({ schoolId, student, onSaved, onClose }: StudentModalProps) {
  const { isClassActive } = useClassConfig();
  const isEdit = !!student;

  const [name, setName]     = useState(student?.name ?? "");
  const [age, setAge]       = useState(student?.age?.toString() ?? "");
  const [cls, setCls]       = useState<ClassLevel>(student?.class ?? "sprout_1");
  const [term, setTerm]     = useState<Term>(student?.term ?? 1);
  const [pin, setPin]       = useState(student?.student_pin ?? "");
  const [avatar, setAvatar] = useState(student?.avatar_url ?? AVATARS[2]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    if (pin && (pin.length !== 4 || !/^\d{4}$/.test(pin))) {
      setError("PIN must be exactly 4 digits.");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch("/api/school/students", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schoolId,
        studentId: isEdit ? student!.id : undefined,
        name, age, cls, term,
        pin: pin || null,
        avatar,
      }),
    });

    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Something went wrong."); setLoading(false); return; }

    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-400 px-6 pt-5 pb-6 text-center relative">
          <button onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition"
            aria-label="Close">✕</button>
          <div className="text-4xl mb-1">{avatar}</div>
          <h2 className="text-lg font-extrabold text-white">
            {isEdit ? "Edit Student" : "Add Student"}
          </h2>
        </div>

        <form onSubmit={handleSave} className="px-5 py-4 flex flex-col gap-4">

          {/* Avatar */}
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Avatar</p>
            <div className="flex gap-2 flex-wrap">
              {AVATARS.map(a => (
                <button key={a} type="button" onClick={() => setAvatar(a)}
                  className={`text-2xl w-10 h-10 rounded-xl transition ${
                    avatar === a ? "bg-green-100 ring-2 ring-green-400 scale-110" : "bg-stone-50 hover:bg-green-50"
                  }`}>{a}</button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1 block">Name *</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Tayo"
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-400"/>
          </div>

          {/* Age */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1 block">Age</label>
            <input type="number" min={1} max={8} value={age} onChange={e => setAge(e.target.value)}
              placeholder="e.g. 3"
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-400"/>
          </div>

          {/* Class */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2 block">Class</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_CLASSES.map(c => {
                const active = isClassActive(c);
                return (
                  <button key={c} type="button"
                    onClick={() => active && setCls(c)}
                    className={`py-2.5 px-3 rounded-2xl text-sm font-semibold border-2 transition relative ${
                      cls === c
                        ? "border-green-400 bg-green-50 text-green-700"
                        : active
                        ? "border-stone-200 text-stone-600 hover:border-green-200"
                        : "border-stone-100 text-stone-300 cursor-not-allowed"
                    }`}>
                    {CLASS_LABELS[c]}
                    {!active && (
                      <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-stone-200 text-stone-500 px-1.5 py-0.5 rounded-full font-bold">
                        Soon
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Term */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2 block">Term</label>
            <div className="flex gap-2">
              {([1,2,3] as Term[]).map(t => (
                <button key={t} type="button" onClick={() => setTerm(t)}
                  className={`flex-1 py-2.5 rounded-2xl text-sm font-bold border-2 transition ${
                    term === t ? "border-green-400 bg-green-50 text-green-700" : "border-stone-200 text-stone-600 hover:border-green-200"
                  }`}>
                  Term {t}
                </button>
              ))}
            </div>
          </div>

          {/* PIN */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1 block">
              4-digit PIN <span className="text-stone-400 font-normal normal-case">(student uses this to log in)</span>
            </label>
            <input type="text" inputMode="numeric" pattern="\d{4}" maxLength={4}
              value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 1234"
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 placeholder-stone-400 tracking-widest text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-green-400"/>
          </div>

          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading || !name.trim()}
              className="flex-1 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold transition disabled:opacity-60">
              {loading ? "Saving…" : isEdit ? "Save changes" : "Add student"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
