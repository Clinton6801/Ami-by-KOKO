"use client";

/**
 * AssignmentModal — Create or edit an assignment.
 *
 * Steps:
 *   1. Basic details (title, class, term, subject, activity type, due date)
 *   2. Content picker (free A–Z / 1–10 / world items with quick-select)
 *   3. Review & confirm
 *
 * Templates pre-fill common combinations for busy teachers.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CLASS_LABELS, SUBJECT_LABELS, SUBJECT_EMOJIS,
  type ClassLevel, type Term, type Subject, type ActivityType, type Assignment,
} from "@/types";
import { WORLD_CATEGORIES, WORLD_ITEMS } from "@/lib/content/world";

// ─── Constants ────────────────────────────────────────────────────────────────

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const NUMBERS  = ["1","2","3","4","5","6","7","8","9","10"];

const ACTIVITY_TYPES: { value: ActivityType; label: string; emoji: string }[] = [
  { value: "tracing",   label: "Tracing",   emoji: "✏️" },
  { value: "listening", label: "Listening", emoji: "👂" },
  { value: "matching",  label: "Matching",  emoji: "🔗" },
  { value: "counting",  label: "Counting",  emoji: "🔢" },
];

interface Template {
  label: string;
  emoji: string;
  cls: ClassLevel;
  term: Term;
  subject: Subject;
  activityType: ActivityType;
  contentKeys: string[];
  titleSuggestion: string;
}

const TEMPLATES: Template[] = [
  {
    label: "Sprout 1 letters A–F",
    emoji: "🔤",
    cls: "sprout_1", term: 1, subject: "literacy", activityType: "tracing",
    contentKeys: ["A","B","C","D","E","F"],
    titleSuggestion: "Trace your letters this week!",
  },
  {
    label: "Numbers revision 1–5",
    emoji: "🔢",
    cls: "sprout_1", term: 1, subject: "numeracy", activityType: "counting",
    contentKeys: ["1","2","3","4","5"],
    titleSuggestion: "Count with Kòkò — numbers 1 to 5!",
  },
  {
    label: "Body parts review",
    emoji: "🫀",
    cls: "sprout_1", term: 1, subject: "world", activityType: "listening",
    contentKeys: ["head","eyes","nose","mouth","hands","feet"],
    titleSuggestion: "Learn your body parts with Àmì!",
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface AssignmentModalProps {
  schoolId: string;
  adminId: string;
  assignment?: Assignment | null;
  onSaved: () => void;
  onClose: () => void;
}

// ─── Content picker sub-components ───────────────────────────────────────────

function LiteracyPicker({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  function toggle(l: string) {
    onChange(selected.includes(l) ? selected.filter(x => x !== l) : [...selected, l]);
  }
  return (
    <div className="flex flex-col gap-3">
      {/* Quick-select */}
      <div className="flex gap-1.5 flex-wrap">
        {[
          { label: "All", keys: ALPHABET },
          { label: "A–F", keys: ALPHABET.slice(0, 6) },
          { label: "G–Z", keys: ALPHABET.slice(6) },
          { label: "Clear", keys: [] },
        ].map(({ label, keys }) => (
          <button key={label} type="button" onClick={() => onChange(keys)}
            className="text-xs font-bold px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-600 transition">
            {label}
          </button>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {ALPHABET.map(l => (
          <button key={l} type="button" onClick={() => toggle(l)}
            className={`aspect-square rounded-xl text-sm font-extrabold border-2 transition ${
              selected.includes(l)
                ? "border-amber-400 bg-amber-100 text-amber-700"
                : "border-stone-200 text-stone-600 hover:border-amber-200"
            }`}>
            {l}
          </button>
        ))}
      </div>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map(l => (
            <span key={l} className="text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function NumeracyPicker({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  function toggle(n: string) {
    onChange(selected.includes(n) ? selected.filter(x => x !== n) : [...selected, n]);
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1.5 flex-wrap">
        {[
          { label: "All", keys: NUMBERS },
          { label: "1–3", keys: ["1","2","3"] },
          { label: "4–10", keys: ["4","5","6","7","8","9","10"] },
          { label: "Clear", keys: [] },
        ].map(({ label, keys }) => (
          <button key={label} type="button" onClick={() => onChange(keys)}
            className="text-xs font-bold px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-600 transition">
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {NUMBERS.map(n => (
          <button key={n} type="button" onClick={() => toggle(n)}
            className={`aspect-square rounded-xl text-sm font-extrabold border-2 transition ${
              selected.includes(n)
                ? "border-amber-400 bg-amber-100 text-amber-700"
                : "border-stone-200 text-stone-600 hover:border-amber-200"
            }`}>
            {n}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map(n => (
            <span key={n} className="text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">{n}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function WorldPicker({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  function toggle(key: string) {
    onChange(selected.includes(key) ? selected.filter(x => x !== key) : [...selected, key]);
  }
  function toggleCategory(catKey: string) {
    const items = Object.values(WORLD_ITEMS).filter(i => i.category === catKey).map(i => i.key);
    const allSelected = items.every(k => selected.includes(k));
    if (allSelected) {
      onChange(selected.filter(k => !items.includes(k)));
    } else {
      const merged = [...new Set([...selected, ...items])];
      onChange(merged);
    }
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1.5 flex-wrap">
        <button type="button" onClick={() => onChange(Object.keys(WORLD_ITEMS))}
          className="text-xs font-bold px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-600 transition">
          Select All
        </button>
        <button type="button" onClick={() => onChange([])}
          className="text-xs font-bold px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-600 transition">
          Clear
        </button>
      </div>
      {WORLD_CATEGORIES.map(cat => {
        const items = Object.values(WORLD_ITEMS).filter(i => i.category === cat.key);
        const allSelected = items.every(i => selected.includes(i.key));
        return (
          <div key={cat.key}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-bold text-stone-600">{cat.emoji} {cat.label}</p>
              <button type="button" onClick={() => toggleCategory(cat.key)}
                className={`text-xs font-bold px-2 py-0.5 rounded-lg transition ${
                  allSelected ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-500 hover:bg-amber-50"
                }`}>
                {allSelected ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {items.map(item => (
                <button key={item.key} type="button" onClick={() => toggle(item.key)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold border-2 transition capitalize ${
                    selected.includes(item.key)
                      ? "border-amber-400 bg-amber-100 text-amber-700"
                      : "border-stone-200 text-stone-600 hover:border-amber-200"
                  }`}>
                  {item.englishName}
                </button>
              ))}
            </div>
          </div>
        );
      })}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map(k => (
            <span key={k} className="text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full capitalize">{k}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function AssignmentModal({ schoolId, adminId, assignment, onSaved, onClose }: AssignmentModalProps) {
  const isEdit = !!assignment;
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showTemplates, setShowTemplates] = useState(false);

  // Form state
  const [title, setTitle]               = useState(assignment?.title ?? "");
  const [cls, setCls]                   = useState<ClassLevel>(assignment?.class ?? "sprout_1");
  const [term, setTerm]                 = useState<Term>(assignment?.term ?? 1);
  const [subject, setSubject]           = useState<Subject>(assignment?.subject ?? "literacy");
  const [activityType, setActivityType] = useState<ActivityType>(assignment?.activity_type ?? "tracing");
  const [selected, setSelected]         = useState<string[]>(assignment?.content_keys ?? []);
  const [dueDate, setDueDate]           = useState(assignment?.due_date ?? "");
  const [autoAssign, setAutoAssign]     = useState(true);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);

  function applyTemplate(t: Template) {
    setTitle(t.titleSuggestion);
    setCls(t.cls);
    setTerm(t.term);
    setSubject(t.subject);
    setActivityType(t.activityType);
    setSelected(t.contentKeys);
    setShowTemplates(false);
    setStep(1);
  }

  function contentSummary(): string {
    if (selected.length === 0) return "Nothing selected";
    if (subject === "literacy") return `Letters ${selected.join(", ")}`;
    if (subject === "numeracy") return `Numbers ${selected.join(", ")}`;
    return selected.map(k => WORLD_ITEMS[k]?.englishName ?? k).join(", ");
  }

  async function handleSave() {
    if (!title.trim() || selected.length === 0) {
      setError("Add a title and select at least one item.");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch("/api/school/assignments", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schoolId,
        assignmentId: isEdit ? assignment!.id : undefined,
        cls,
        subject,
        term,
        title,
        activityType,
        contentKeys: selected,
        dueDate: dueDate || null,
        autoAssign: !isEdit && autoAssign,
      }),
    });

    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Something went wrong."); setLoading(false); return; }
    onSaved();
  }

  const canProceedStep1 = title.trim().length > 0;
  const canProceedStep2 = selected.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-5 pt-4 pb-5 text-center relative flex-shrink-0">
          <button onClick={onClose}
            className="absolute top-3 right-4 text-white/70 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition"
            aria-label="Close">✕</button>
          <div className="text-2xl mb-0.5">📝</div>
          <h2 className="text-base font-extrabold text-white">
            {isEdit ? "Edit Assignment" : "Create Assignment"}
          </h2>
          {/* Step indicator */}
          {!isEdit && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {[1,2,3].map(s => (
                <div key={s} className={`h-1.5 rounded-full transition-all ${
                  step === s ? "w-6 bg-white" : step > s ? "w-3 bg-white/70" : "w-3 bg-white/30"
                }`}/>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">

          {/* Templates button — step 1 only */}
          {step === 1 && !isEdit && (
            <div>
              <button type="button" onClick={() => setShowTemplates(v => !v)}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 py-2.5 rounded-2xl transition border border-amber-200">
                ⚡ Use a template
              </button>
              <AnimatePresence>
                {showTemplates && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-2 flex flex-col gap-2">
                    {TEMPLATES.map(t => (
                      <button key={t.label} type="button" onClick={() => applyTemplate(t)}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-white ring-1 ring-amber-100 hover:bg-amber-50 transition text-left">
                        <span className="text-xl">{t.emoji}</span>
                        <div>
                          <p className="font-bold text-stone-800 text-sm">{t.label}</p>
                          <p className="text-xs text-stone-400">{t.titleSuggestion}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ── Step 1: Basic details ── */}
          {step === 1 && (
            <>
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1 block">Title *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Trace your letters this week!"
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"/>
              </div>

              {/* Class */}
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2 block">Class</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["sprout_1","sprout_2","sprout_3","stepping_stone"] as ClassLevel[]).map(c => (
                    <button key={c} type="button" onClick={() => { setCls(c); setSelected([]); }}
                      className={`py-2 px-3 rounded-2xl text-xs font-semibold border-2 transition ${
                        cls === c ? "border-amber-400 bg-amber-50 text-amber-700" : "border-stone-200 text-stone-600 hover:border-amber-200"
                      }`}>
                      {CLASS_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Term */}
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2 block">Term</label>
                <div className="flex gap-2">
                  {([1,2,3] as Term[]).map(t => (
                    <button key={t} type="button" onClick={() => { setTerm(t); setSelected([]); }}
                      className={`flex-1 py-2 rounded-2xl text-sm font-bold border-2 transition ${
                        term === t ? "border-amber-400 bg-amber-50 text-amber-700" : "border-stone-200 text-stone-600 hover:border-amber-200"
                      }`}>
                      Term {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2 block">Subject</label>
                <div className="flex gap-2">
                  {(["literacy","numeracy","world"] as Subject[]).map(s => (
                    <button key={s} type="button" onClick={() => { setSubject(s); setSelected([]); }}
                      className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-2xl text-xs font-bold border-2 transition ${
                        subject === s ? "border-amber-400 bg-amber-50 text-amber-700" : "border-stone-200 text-stone-600 hover:border-amber-200"
                      }`}>
                      <span className="text-lg">{SUBJECT_EMOJIS[s]}</span>
                      {s === "literacy" ? "Literacy" : s === "numeracy" ? "Numbers" : "World"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity type */}
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2 block">Activity type</label>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITY_TYPES.map(a => (
                    <button key={a.value} type="button" onClick={() => setActivityType(a.value)}
                      className={`flex items-center gap-2 py-2 px-3 rounded-2xl text-xs font-semibold border-2 transition ${
                        activityType === a.value ? "border-amber-400 bg-amber-50 text-amber-700" : "border-stone-200 text-stone-600 hover:border-amber-200"
                      }`}>
                      <span>{a.emoji}</span>{a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due date */}
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1 block">
                  Due date <span className="text-stone-400 font-normal normal-case">(optional)</span>
                </label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"/>
              </div>
            </>
          )}

          {/* ── Step 2: Content picker ── */}
          {step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                  Select content *
                </label>
                <span className="text-xs text-stone-400">{selected.length} selected</span>
              </div>
              {subject === "literacy"  && <LiteracyPicker  selected={selected} onChange={setSelected} />}
              {subject === "numeracy"  && <NumeracyPicker  selected={selected} onChange={setSelected} />}
              {subject === "world"     && <WorldPicker     selected={selected} onChange={setSelected} />}
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="bg-amber-50 rounded-2xl p-4 ring-1 ring-amber-200 flex flex-col gap-2">
                <p className="font-extrabold text-stone-800">{title}</p>
                <p className="text-sm text-stone-600">
                  {SUBJECT_EMOJIS[subject]} {contentSummary()}
                </p>
                <p className="text-xs text-stone-500">
                  {CLASS_LABELS[cls]} · Term {term} · {ACTIVITY_TYPES.find(a => a.value === activityType)?.emoji} {activityType}
                </p>
                {dueDate && (
                  <p className="text-xs text-stone-500">
                    📅 Due {new Date(dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>

              {!isEdit && (
                <label className="flex items-center gap-3 cursor-pointer bg-stone-50 rounded-2xl p-3">
                  <input type="checkbox" checked={autoAssign} onChange={e => setAutoAssign(e.target.checked)}
                    className="w-5 h-5 rounded accent-amber-500 flex-shrink-0"/>
                  <span className="text-sm text-stone-700">
                    Auto-assign to all <strong>{CLASS_LABELS[cls]}</strong> students
                  </span>
                </label>
              )}

              {error && <p role="alert" className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-2">{error}</p>}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="px-5 pb-5 pt-3 flex gap-3 flex-shrink-0 border-t border-stone-100">
          {step === 1 && (
            <>
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition text-sm">
                Cancel
              </button>
              {isEdit ? (
                <button type="button" onClick={() => setStep(2)} disabled={!canProceedStep1}
                  className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition disabled:opacity-60 text-sm">
                  Next: Content →
                </button>
              ) : (
                <button type="button" onClick={() => setStep(2)} disabled={!canProceedStep1}
                  className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition disabled:opacity-60 text-sm">
                  Next →
                </button>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition text-sm">
                ← Back
              </button>
              <button type="button" onClick={() => setStep(3)} disabled={!canProceedStep2}
                className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition disabled:opacity-60 text-sm">
                Review →
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button type="button" onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition text-sm">
                ← Back
              </button>
              <button type="button" onClick={handleSave} disabled={loading}
                className="flex-1 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold transition disabled:opacity-60 text-sm">
                {loading ? "Saving…" : isEdit ? "Save changes" : "✅ Assign"}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
