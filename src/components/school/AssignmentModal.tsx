"use client";

/**
 * AssignmentModal — Create or edit an assignment.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  CLASS_LABELS, SUBJECT_LABELS, SUBJECT_EMOJIS,
  SPROUT1_TERM1_SOUNDS, SPROUT1_TERM2_SOUNDS, SPROUT1_TERM3_SOUNDS,
  SPROUT1_NUMERACY, SPROUT1_WORLD,
  type ClassLevel, type Term, type Subject, type Assignment,
} from "@/types";

interface AssignmentModalProps {
  schoolId: string;
  adminId: string;
  assignment?: Assignment | null;
  onSaved: () => void;
  onClose: () => void;
}

function getContentOptions(cls: ClassLevel, term: Term, subject: Subject): string[] {
  if (cls !== "sprout_1") return [];
  if (subject === "literacy") {
    if (term === 1) return [...SPROUT1_TERM1_SOUNDS];
    if (term === 2) return [...SPROUT1_TERM2_SOUNDS];
    return [...SPROUT1_TERM3_SOUNDS];
  }
  if (subject === "numeracy") return SPROUT1_NUMERACY[term];
  return SPROUT1_WORLD[term];
}

export default function AssignmentModal({ schoolId, adminId, assignment, onSaved, onClose }: AssignmentModalProps) {
  const supabase = createClient();
  const isEdit = !!assignment;

  const [title, setTitle]       = useState(assignment?.title ?? "");
  const [cls, setCls]           = useState<ClassLevel>(assignment?.class ?? "sprout_1");
  const [term, setTerm]         = useState<Term>(assignment?.term ?? 1);
  const [subject, setSubject]   = useState<Subject>(assignment?.subject ?? "literacy");
  const [selected, setSelected] = useState<string[]>(assignment?.content_keys ?? []);
  const [dueDate, setDueDate]   = useState(assignment?.due_date ?? "");
  const [autoAssign, setAutoAssign] = useState(true);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const options = getContentOptions(cls, term, subject);

  function toggleItem(item: string) {
    setSelected(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || selected.length === 0) {
      setError("Add a title and select at least one item.");
      return;
    }
    setLoading(true);
    setError(null);

    const payload = {
      school_id: schoolId,
      class: cls,
      subject,
      term,
      title: title.trim(),
      activity_type: "tracing" as const,
      content_keys: selected,
      due_date: dueDate || null,
      created_by: adminId,
    };

    let assignmentId: string | null = null;

    if (isEdit) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("assignments").update(payload).eq("id", assignment!.id);
      if (error) { setError(error.message); setLoading(false); return; }
      assignmentId = assignment!.id;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("assignments").insert(payload).select("id").single();
      if (error) { setError(error.message); setLoading(false); return; }
      assignmentId = data.id;
    }

    // Auto-assign to all students in this class
    if (autoAssign && assignmentId && !isEdit) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: students } = await (supabase as any)
        .from("children")
        .select("id")
        .eq("school_id", schoolId)
        .eq("class", cls);

      if (students && students.length > 0) {
        const rows = students.map((s: { id: string }) => ({
          assignment_id: assignmentId,
          child_id: s.id,
          completed: false,
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("assignment_progress").insert(rows);
      }
    }

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
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-6 pt-5 pb-6 text-center relative">
          <button onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition"
            aria-label="Close">✕</button>
          <div className="text-3xl mb-1">📝</div>
          <h2 className="text-lg font-extrabold text-white">
            {isEdit ? "Edit Assignment" : "Create Assignment"}
          </h2>
        </div>

        <form onSubmit={handleSave} className="px-5 py-4 flex flex-col gap-4">

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1 block">Title *</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Trace your letters this week!"
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400"/>
          </div>

          {/* Class */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2 block">Class</label>
            <div className="grid grid-cols-2 gap-2">
              {(["sprout_1","sprout_2","sprout_3","stepping_stone"] as ClassLevel[]).map(c => (
                <button key={c} type="button"
                  onClick={() => { setCls(c); setSelected([]); }}
                  disabled={c !== "sprout_1"}
                  className={`py-2 px-3 rounded-2xl text-xs font-semibold border-2 transition ${
                    cls === c ? "border-amber-400 bg-amber-50 text-amber-700"
                    : c !== "sprout_1" ? "border-stone-100 text-stone-300 cursor-not-allowed"
                    : "border-stone-200 text-stone-600 hover:border-amber-200"
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
            <div className="flex flex-col gap-2">
              {(["literacy","numeracy","world"] as Subject[]).map(s => (
                <button key={s} type="button" onClick={() => { setSubject(s); setSelected([]); }}
                  className={`flex items-center gap-2 py-2.5 px-4 rounded-2xl text-sm font-semibold border-2 transition ${
                    subject === s ? "border-amber-400 bg-amber-50 text-amber-700" : "border-stone-200 text-stone-600 hover:border-amber-200"
                  }`}>
                  <span>{SUBJECT_EMOJIS[s]}</span>
                  {SUBJECT_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Content selector */}
          {options.length > 0 && (
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2 block">
                Select content *
                <span className="text-stone-400 font-normal normal-case ml-1">({selected.length} selected)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {options.map(item => (
                  <button key={item} type="button" onClick={() => toggleItem(item)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition ${
                      selected.includes(item)
                        ? "border-amber-400 bg-amber-100 text-amber-700"
                        : "border-stone-200 text-stone-600 hover:border-amber-200"
                    }`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Due date */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1 block">
              Due date <span className="text-stone-400 font-normal normal-case">(optional)</span>
            </label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400"/>
          </div>

          {/* Auto-assign */}
          {!isEdit && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={autoAssign} onChange={e => setAutoAssign(e.target.checked)}
                className="w-5 h-5 rounded accent-amber-500"/>
              <span className="text-sm text-stone-700">
                Assign to all students in {CLASS_LABELS[cls]}
              </span>
            </label>
          )}

          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading || !title.trim() || selected.length === 0}
              className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition disabled:opacity-60">
              {loading ? "Saving…" : isEdit ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
