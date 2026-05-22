"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import StudentModal from "@/components/school/StudentModal";
import AssignmentModal from "@/components/school/AssignmentModal";
import OnboardingTour from "@/components/ui/OnboardingTour";
import {
  CLASS_LABELS, SUBJECT_LABELS, SUBJECT_EMOJIS,
  type ChildWithClass, type Assignment, type AssignmentProgress,
} from "@/types";

type Tab = "overview" | "students" | "assignments" | "reports" | "live" | "challenges";

interface School {
  id: string;
  name: string;
  school_code: string | null;
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ school, students }: { school: School; students: ChildWithClass[] }) {
  const [backfilling, setBackfilling] = useState(false);
  const [backfillResult, setBackfillResult] = useState<string | null>(null);

  async function handleBackfill() {
    setBackfilling(true);
    setBackfillResult(null);
    const res = await fetch("/api/school/students/backfill-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolId: school.id }),
    });
    const json = await res.json();
    setBackfillResult(json.message ?? "Done");
    setBackfilling(false);
  }
  const classCounts = students.reduce<Record<string, number>>((acc, s) => {
    const c = s.class ?? "sprout_1";
    acc[c] = (acc[c] ?? 0) + 1;
    return acc;
  }, {});

  function exportCSV() {
    const rows = [
      ["Name","Age","Class","Term","PIN","Created"],
      ...students.map(s => [
        s.name, s.age ?? "", CLASS_LABELS[s.class ?? "sprout_1"],
        s.term ?? 1, s.student_pin ?? "", new Date(s.created_at).toLocaleDateString(),
      ]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "students.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* School code */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-3xl p-5 text-white">
        <p className="text-orange-100 text-xs font-semibold uppercase tracking-wide mb-1">School Code</p>
        <p className="text-3xl font-extrabold tracking-widest">
          {school.school_code ?? "Not set"}
        </p>
        <p className="text-orange-100 text-xs mt-1">
          Students use this code to log in at /student-login
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-stone-100 text-center">
          <p className="text-3xl font-extrabold text-amber-500">{students.length}</p>
          <p className="text-xs text-stone-500 mt-1">Total students</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-stone-100 text-center">
          <p className="text-3xl font-extrabold text-green-500">{classCounts["sprout_1"] ?? 0}</p>
          <p className="text-xs text-stone-500 mt-1">Sprout 1</p>
        </div>
      </div>

      {/* Export */}
      {students.length > 0 && (
        <button onClick={exportCSV}
          className="w-full flex items-center justify-center gap-2 text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 py-3 rounded-2xl transition border border-green-200">
          ⬇ Export students CSV
        </button>
      )}

      {/* Fix student logins — creates Supabase auth accounts for students without one */}
      <div className="flex flex-col gap-2">
        <button onClick={handleBackfill} disabled={backfilling}
          className="w-full flex items-center justify-center gap-2 text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 py-3 rounded-2xl transition border border-amber-200 disabled:opacity-60">
          {backfilling ? "⏳ Setting up logins…" : "🔑 Fix student logins"}
        </button>
        {backfillResult && (
          <p className="text-xs text-center text-stone-500 font-medium">{backfillResult}</p>
        )}
        <p className="text-xs text-stone-400 text-center">
          Run this once to enable cross-device student login
        </p>
      </div>
    </div>
  );
}

// ─── Students tab ─────────────────────────────────────────────────────────────

function StudentsTab({
  schoolId, students, onRefresh,
}: {
  schoolId: string;
  students: ChildWithClass[];
  onRefresh: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ChildWithClass | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvResult, setCsvResult] = useState<string | null>(null);

  async function handleDelete(id: string) {
    const res = await fetch("/api/school/students", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolId, studentId: id }),
    });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error ?? "Failed to delete student.");
      return;
    }
    setDeleting(null);
    onRefresh();
  }

  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError(null);
    setCsvResult(null);

    const text = await file.text();
    const lines = text.trim().split("\n").slice(1); // skip header
    let ok = 0; let fail = 0;

    for (const line of lines) {
      const [name, age, cls, term, pin] = line.split(",").map(s => s.trim().replace(/"/g, ""));
      if (!name) { fail++; continue; }
      const validClasses = ["sprout_1","sprout_2","sprout_3","stepping_stone"];

      const res = await fetch("/api/school/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId,
          name,
          age: age || null,
          cls: validClasses.includes(cls) ? cls : "sprout_1",
          term: [1,2,3].includes(parseInt(term)) ? parseInt(term) : 1,
          pin: pin?.length === 4 ? pin : null,
          avatar: "🧒🏾",
        }),
      });

      if (res.ok) ok++; else fail++;
    }

    setCsvResult(`✅ ${ok} imported${fail > 0 ? `, ❌ ${fail} failed` : ""}`);
    onRefresh();
    e.target.value = "";
  }

  // Group by class
  const byClass = students.reduce<Record<string, ChildWithClass[]>>((acc, s) => {
    const c = s.class ?? "sprout_1";
    if (!acc[c]) acc[c] = [];
    acc[c].push(s);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-4 py-2.5 rounded-2xl transition shadow-md">
          ➕ Add student
        </button>

        <label className="flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-sm px-4 py-2.5 rounded-2xl transition ring-1 ring-stone-200 cursor-pointer">
          📥 Import CSV
          <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport}/>
        </label>
      </div>

      {csvResult && (
        <p className="text-sm font-semibold text-green-700 bg-green-50 px-4 py-2 rounded-2xl">{csvResult}</p>
      )}
      {csvError && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-2xl">{csvError}</p>
      )}

      <p className="text-xs text-stone-400">
        CSV format: name, age, class, term, pin (header row required)
      </p>

      {/* Student list grouped by class */}
      {students.length === 0 ? (
        <div className="bg-white rounded-3xl p-6 text-center shadow-sm ring-1 ring-stone-100">
          <p className="text-stone-500 text-sm">No students yet. Add one or import a CSV.</p>
        </div>
      ) : (
        Object.entries(byClass).map(([cls, kids]) => (
          <div key={cls} className="bg-white rounded-3xl shadow-sm ring-1 ring-stone-100 overflow-hidden">
            <div className="px-4 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <p className="font-bold text-stone-700 text-sm">{CLASS_LABELS[cls as keyof typeof CLASS_LABELS]}</p>
              <span className="text-xs text-stone-400">{kids.length} students</span>
            </div>
            <div className="divide-y divide-stone-50">
              {kids.map(kid => (
                <div key={kid.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-2xl">{kid.avatar_url ?? "🧒🏾"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800 text-sm truncate">{kid.name}</p>
                    <p className="text-xs text-stone-400">
                      Age {kid.age ?? "?"} · Term {kid.term ?? 1}
                      {kid.student_pin ? ` · PIN: ${kid.student_pin}` : " · No PIN"}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => { setEditing(kid); setShowModal(true); }}
                      className="text-xs px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-600 transition">
                      ✏️
                    </button>
                    <button onClick={() => setDeleting(kid.id)}
                      className="text-xs px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-red-100 text-stone-600 transition">
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Delete confirm */}
      <AnimatePresence>
        {deleting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl text-center">
              <p className="text-xl mb-1">🗑</p>
              <p className="font-bold text-stone-800 mb-1">Remove student?</p>
              <p className="text-stone-500 text-sm mb-4">This will delete all their progress too.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleting(null)}
                  className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-600 font-semibold">Cancel</button>
                <button onClick={() => handleDelete(deleting)}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold">Remove</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <StudentModal
            schoolId={schoolId}
            student={editing}
            onSaved={() => { setShowModal(false); setEditing(null); onRefresh(); }}
            onClose={() => { setShowModal(false); setEditing(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Assignments tab ──────────────────────────────────────────────────────────

function AssignmentsTab({ schoolId, adminId }: { schoolId: string; adminId: string }) {
  const supabase = createClient();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progress, setProgress] = useState<AssignmentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this assignment? This cannot be undone.")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("assignments").delete().eq("id", id);
    load();
  }

  const load = useCallback(async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: a } = await (supabase as any)
      .from("assignments").select("*").eq("school_id", schoolId)
      .order("created_at", { ascending: false });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: p } = await (supabase as any)
      .from("assignment_progress").select("*");
    setAssignments((a ?? []) as Assignment[]);
    setProgress((p ?? []) as AssignmentProgress[]);
    setLoading(false);
  }, [schoolId, supabase]);

  useEffect(() => { load(); }, [load]);

  const today = new Date().toISOString().slice(0, 10);
  const active = assignments.filter(a => !a.due_date || a.due_date >= today);
  const past   = assignments.filter(a => a.due_date && a.due_date < today);

  function progressFor(id: string) {
    const rows = progress.filter(p => p.assignment_id === id);
    const done = rows.filter(p => p.completed).length;
    return { done, total: rows.length };
  }

  function AssignmentRow({ a }: { a: Assignment }) {
    const { done, total } = progressFor(a.id);
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const activityEmojis: Record<string, string> = { tracing: "✏️", listening: "👂", matching: "🔗", counting: "🔢" };

    // Content summary: first 4 keys + overflow count
    const keys = a.content_keys;
    const preview = keys.slice(0, 5).join(", ");
    const overflow = keys.length > 5 ? ` +${keys.length - 5}` : "";
    const contentSummary = `${preview}${overflow}`;

    return (
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-stone-100 overflow-hidden">
        <div className="flex items-start gap-3 px-4 py-3">
          <span className="text-xl mt-0.5 flex-shrink-0">{SUBJECT_EMOJIS[a.subject]}</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-stone-800 text-sm truncate">{a.title}</p>
            <p className="text-xs text-stone-500 mt-0.5">
              {activityEmojis[a.activity_type] ?? "📋"} {contentSummary}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">
              {CLASS_LABELS[a.class]} · Term {a.term}
              {a.due_date ? ` · Due ${new Date(a.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}
            </p>
            {/* Progress bar */}
            {total > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}/>
                </div>
                <span className="text-xs text-stone-400 flex-shrink-0">{done}/{total}</span>
              </div>
            )}
          </div>
          <div className="flex gap-1.5 flex-shrink-0 mt-0.5">
            <button onClick={() => { setEditing(a); setShowModal(true); }}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-600 transition"
              aria-label="Edit assignment">
              ✏️
            </button>
            <button onClick={() => handleDelete(a.id)}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-red-100 text-stone-600 transition"
              aria-label="Delete assignment">
              🗑
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => { setEditing(null); setShowModal(true); }}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-2xl transition shadow-md shadow-amber-200">
        ➕ Create Assignment
      </button>

      {loading ? (
        <div className="text-center text-stone-400 text-sm py-6">Loading…</div>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Active</p>
              <div className="flex flex-col gap-2">
                {active.map(a => <AssignmentRow key={a.id} a={a}/>)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Past</p>
              <div className="flex flex-col gap-2 opacity-70">
                {past.map(a => <AssignmentRow key={a.id} a={a}/>)}
              </div>
            </div>
          )}
          {assignments.length === 0 && (
            <div className="bg-white rounded-3xl p-6 text-center shadow-sm ring-1 ring-stone-100">
              <p className="text-stone-500 text-sm">No assignments yet. Create one above.</p>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {showModal && (
          <AssignmentModal
            schoolId={schoolId}
            adminId={adminId}
            assignment={editing}
            onSaved={() => { setShowModal(false); setEditing(null); load(); }}
            onClose={() => { setShowModal(false); setEditing(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Live Class tab ───────────────────────────────────────────────────────────

function LiveClassTab({ schoolId, students }: { schoolId: string; students: ChildWithClass[] }) {
  const supabase = createClient();
  const [subject, setSubject] = useState<"literacy" | "numeracy" | "world">("literacy");
  const [contentKey, setContentKey] = useState("");
  const [classLevel, setClassLevel] = useState("sprout_1");
  const [isLive, setIsLive] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);

  const channelName = `live-class-${schoolId}-${classLevel}`;

  const LITERACY_KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const NUMERACY_KEYS = ["1","2","3","4","5","6","7","8","9","10"];
  const WORLD_KEYS = ["head","eyes","nose","mouth","hands","feet","dog","cat","cow","goat","chicken","parrot","mango","orange","banana","cup","book","bag","shoe","ball","spoon","sun","rain","cloud"];

  const contentOptions = subject === "literacy" ? LITERACY_KEYS
    : subject === "numeracy" ? NUMERACY_KEYS
    : WORLD_KEYS;

  async function broadcast(type: "start" | "navigate" | "end") {
    setBroadcasting(true);
    const channel = supabase.channel(channelName);
    await channel.subscribe();
    await channel.send({
      type: "broadcast",
      event: "live_class",
      payload: {
        type,
        subject,
        contentKey: contentKey || contentOptions[0],
        teacherId: "teacher",
        title: type === "start" ? `Live Class — ${subject}` : undefined,
      },
    });
    await supabase.removeChannel(channel);
    setBroadcasting(false);
    if (type === "start") setIsLive(true);
    if (type === "end") setIsLive(false);
  }

  const studentCount = students.filter(s => (s as ChildWithClass & { class?: string }).class === classLevel).length;

  return (
    <div className="flex flex-col gap-5">
      {/* Status banner */}
      <div className={`rounded-3xl p-4 flex items-center gap-3 ${isLive ? "bg-green-50 ring-1 ring-green-300" : "bg-stone-50 ring-1 ring-stone-200"}`}>
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isLive ? "bg-green-500" : "bg-stone-300"}`}/>
        <div>
          <p className="font-bold text-stone-800 text-sm">{isLive ? "🔴 Live class in progress" : "No live class running"}</p>
          <p className="text-xs text-stone-500">{studentCount} students in {classLevel.replace("_", " ")}</p>
        </div>
      </div>

      {/* Class selector */}
      <div>
        <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2 block">Class</label>
        <div className="flex gap-2">
          {["sprout_1","sprout_2","sprout_3"].map(c => (
            <button key={c} onClick={() => setClassLevel(c)}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-bold border-2 transition ${
                classLevel === c ? "border-amber-400 bg-amber-50 text-amber-700" : "border-stone-200 text-stone-600"
              }`}>
              {c.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Subject selector */}
      <div>
        <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2 block">Subject</label>
        <div className="flex gap-2">
          {(["literacy","numeracy","world"] as const).map(s => (
            <button key={s} onClick={() => { setSubject(s); setContentKey(""); }}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-bold border-2 transition capitalize ${
                subject === s ? "border-amber-400 bg-amber-50 text-amber-700" : "border-stone-200 text-stone-600"
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Content key selector */}
      <div>
        <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2 block">
          Content — {contentKey || "select below"}
        </label>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {contentOptions.map(k => (
            <button key={k} onClick={() => setContentKey(k)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition ${
                contentKey === k ? "border-amber-400 bg-amber-100 text-amber-700" : "border-stone-200 text-stone-600 hover:border-amber-200"
              }`}>
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3">
        {!isLive ? (
          <button
            onClick={() => broadcast("start")}
            disabled={broadcasting || !contentKey}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-extrabold py-4 rounded-2xl transition shadow-md shadow-green-200"
          >
            {broadcasting ? "Starting…" : "🚀 Start Live Class"}
          </button>
        ) : (
          <>
            <button
              onClick={() => broadcast("navigate")}
              disabled={broadcasting || !contentKey}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition shadow-md shadow-amber-200"
            >
              {broadcasting ? "Sending…" : `➡ Show ${contentKey || "content"} to all students`}
            </button>
            <button
              onClick={() => broadcast("end")}
              disabled={broadcasting}
              className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold py-3 rounded-2xl transition"
            >
              ⏹ End Live Class
            </button>
          </>
        )}
      </div>

      {/* Student join link */}
      <div className="bg-stone-50 rounded-2xl p-4 ring-1 ring-stone-200">
        <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Student join link</p>
        <p className="text-sm font-mono text-stone-700 break-all">
          ami-by-koko.vercel.app/live-class/{schoolId}
        </p>
        <p className="text-xs text-stone-400 mt-1">Students logged in will see the live class banner automatically</p>
      </div>
    </div>
  );
}

function ReportsTab({ students }: { students: ChildWithClass[] }) {
  const supabase = createClient();
  const [progressData, setProgressData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (students.length === 0) { setLoading(false); return; }
      const ids = students.map(s => s.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("progress").select("child_id, mastered")
        .in("child_id", ids).eq("mastered", true);

      const counts: Record<string, number> = {};
      (data ?? []).forEach((row: { child_id: string }) => {
        counts[row.child_id] = (counts[row.child_id] ?? 0) + 1;
      });
      setProgressData(counts);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students]);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-3xl shadow-sm ring-1 ring-stone-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100">
          <p className="font-bold text-stone-700 text-sm">Student Progress</p>
        </div>
        {loading ? (
          <div className="p-6 text-center text-stone-400 text-sm">Loading…</div>
        ) : students.length === 0 ? (
          <div className="p-6 text-center text-stone-500 text-sm">No students yet.</div>
        ) : (
          <div className="divide-y divide-stone-50">
            {students.map(s => {
              const mastered = progressData[s.id] ?? 0;
              const pct = Math.round((mastered / 26) * 100);
              return (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xl">{s.avatar_url ?? "🧒🏾"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800 text-sm">{s.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }}/>
                      </div>
                      <span className="text-xs text-stone-400 flex-shrink-0">{mastered}/26</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Challenges tab ───────────────────────────────────────────────────────────

function ChallengesTab({ schoolId, students }: { schoolId: string; students: ChildWithClass[] }) {
  const supabase = createClient();
  const [challenges, setChallenges] = useState<Array<{
    id: string; title: string; class: string; metric: string;
    target_count: number; week_start: string; week_end: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "", cls: "sprout_1", metric: "letters_mastered", target: "5",
  });

  const today = new Date().toISOString().slice(0, 10);

  async function loadChallenges() {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("challenges").select("*").eq("school_id", schoolId)
      .order("week_start", { ascending: false }).limit(20);
    setChallenges(data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadChallenges(); }, [schoolId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function createChallenge(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);

    // Calculate week bounds (Mon–Sun)
    const now = new Date();
    const day = now.getDay();
    const mon = new Date(now); mon.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("challenges").insert({
      school_id: schoolId,
      class: form.cls,
      title: form.title,
      metric: form.metric,
      target_count: parseInt(form.target),
      week_start: mon.toISOString().slice(0, 10),
      week_end: sun.toISOString().slice(0, 10),
    });

    setForm({ title: "", cls: "sprout_1", metric: "letters_mastered", target: "5" });
    setCreating(false);
    loadChallenges();
  }

  const classCounts = students.reduce<Record<string, number>>((acc, s) => {
    const c = s.class ?? "sprout_1";
    acc[c] = (acc[c] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-5">
      {/* Create challenge form */}
      <div className="bg-white rounded-3xl p-5 shadow-sm ring-1 ring-stone-100">
        <p className="font-bold text-stone-700 mb-4">Create Weekly Challenge</p>
        <form onSubmit={createChallenge} className="flex flex-col gap-3">
          <input
            type="text" required value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Master 5 new letters this week!"
            className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-bold text-stone-500 mb-1 block">Class</label>
              <select value={form.cls} onChange={e => setForm(f => ({ ...f, cls: e.target.value }))}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option value="sprout_1">Sprout 1 ({classCounts["sprout_1"] ?? 0})</option>
                <option value="sprout_2">Sprout 2 ({classCounts["sprout_2"] ?? 0})</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 mb-1 block">Metric</label>
              <select value={form.metric} onChange={e => setForm(f => ({ ...f, metric: e.target.value }))}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option value="letters_mastered">Letters</option>
                <option value="assignments_complete">Assignments</option>
                <option value="sessions">Sessions</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 mb-1 block">Target</label>
              <input type="number" min={1} max={26} value={form.target}
                onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"/>
            </div>
          </div>
          <button type="submit" disabled={creating || !form.title}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold py-3 rounded-2xl transition">
            {creating ? "Creating…" : "➕ Create Challenge"}
          </button>
        </form>
      </div>

      {/* Challenge list */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">Recent Challenges</p>
        {loading ? (
          <div className="bg-white rounded-3xl h-20 animate-pulse ring-1 ring-stone-100"/>
        ) : challenges.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center shadow-sm ring-1 ring-stone-100">
            <p className="text-stone-500 text-sm">No challenges yet. Create one above.</p>
          </div>
        ) : (
          challenges.map(c => {
            const isActive = c.week_start <= today && c.week_end >= today;
            return (
              <div key={c.id} className={`bg-white rounded-2xl p-4 shadow-sm ring-1 ${isActive ? "ring-amber-200" : "ring-stone-100"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-stone-800 text-sm truncate">{c.title}</p>
                    <p className="text-xs text-stone-400">
                      {c.class.replace("_", " ")} · {c.metric.replace(/_/g, " ")} · target {c.target_count}
                    </p>
                    <p className="text-xs text-stone-400">{c.week_start} → {c.week_end}</p>
                  </div>
                  {isActive && (
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full flex-shrink-0 ml-2">Active</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "overview",    label: "Overview",    emoji: "🏫" },
  { id: "students",    label: "Students",    emoji: "👥" },
  { id: "assignments", label: "Assignments", emoji: "📝" },
  { id: "reports",     label: "Reports",     emoji: "📊" },
  { id: "live",        label: "Live",        emoji: "🔴" },
  { id: "challenges",  label: "Challenges",  emoji: "🎯" },
];

export default function SchoolDashboardPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("overview");
  const [school, setSchool] = useState<School | null>(null);
  const [adminId, setAdminId] = useState<string>("");
  const [students, setStudents] = useState<ChildWithClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setAdminId(user.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from("profiles").select("school_id, onboarding_complete").eq("id", user.id).single();
    if (!profile?.school_id) { setLoading(false); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: schoolData } = await (supabase as any)
      .from("schools").select("id, name, school_code").eq("id", profile.school_id).single();
    setSchool(schoolData as School);

    // Show onboarding tour for new admins
    if (profile.onboarding_complete === false) {
      setShowTour(true);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: kids } = await (supabase as any)
      .from("children").select("*").eq("school_id", profile.school_id)
      .order("name", { ascending: true });
    setStudents((kids ?? []) as ChildWithClass[]);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 pb-10">
        {[1,2,3].map(i => <div key={i} className="bg-white rounded-3xl h-16 animate-pulse ring-1 ring-stone-100"/>)}
      </div>
    );
  }

  if (!school) {
    return (
      <div className="bg-white rounded-3xl p-6 text-center shadow-sm ring-1 ring-stone-100">
        <div className="text-4xl mb-3">🏫</div>
        <p className="font-bold text-stone-800 mb-1">No school linked yet</p>
        <p className="text-stone-500 text-sm mb-4">Set up your school to add students and create assignments.</p>
        <a href="/school-setup"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-2xl transition shadow-md">
          Set up my school →
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-10">
      <h1 className="text-2xl font-extrabold text-stone-800">{school.name}</h1>

      {/* Tab bar */}
      <div className="flex gap-1 bg-stone-100 rounded-2xl p-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs font-bold transition ${
              tab === t.id ? "bg-white text-amber-600 shadow-sm" : "text-stone-500 hover:text-stone-700"
            }`}>
            <span className="text-base">{t.emoji}</span>
            <span className="hidden sm:block">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {tab === "overview"    && <OverviewTab school={school} students={students}/>}
          {tab === "students"    && <StudentsTab schoolId={school.id} students={students} onRefresh={loadData}/>}
          {tab === "assignments" && <AssignmentsTab schoolId={school.id} adminId={adminId}/>}
          {tab === "reports"     && <ReportsTab students={students}/>}
          {tab === "live"        && <LiveClassTab schoolId={school.id} students={students}/>}
          {tab === "challenges"  && <ChallengesTab schoolId={school.id} students={students}/>}
        </motion.div>
      </AnimatePresence>

      {/* Onboarding tour for new admins */}
      <AnimatePresence>
        {showTour && school && (
          <OnboardingTour
            schoolCode={school.school_code ?? ""}
            schoolId={school.id}
            userId={adminId}
            onComplete={() => setShowTour(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
