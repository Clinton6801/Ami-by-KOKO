"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import StudentModal from "@/components/school/StudentModal";
import AssignmentModal from "@/components/school/AssignmentModal";
import {
  CLASS_LABELS, SUBJECT_LABELS, SUBJECT_EMOJIS,
  type ChildWithClass, type Assignment, type AssignmentProgress,
} from "@/types";

type Tab = "overview" | "students" | "assignments" | "reports";

interface School {
  id: string;
  name: string;
  school_code: string | null;
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ school, students }: { school: School; students: ChildWithClass[] }) {
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
  const supabase = createClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ChildWithClass | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvResult, setCsvResult] = useState<string | null>(null);

  async function handleDelete(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("children").delete().eq("id", id);
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
      const payload = {
        name,
        age: age ? parseInt(age) : null,
        class: validClasses.includes(cls) ? cls : "sprout_1",
        term: [1,2,3].includes(parseInt(term)) ? parseInt(term) : 1,
        student_pin: pin?.length === 4 ? pin : null,
        school_id: schoolId,
        avatar_url: "🧒🏾",
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("children").insert(payload);
      if (error) fail++; else ok++;
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
  const [expanded, setExpanded] = useState<string | null>(null);

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
    const isExpanded = expanded === a.id;
    const detail = progress.filter(p => p.assignment_id === a.id);

    return (
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-stone-100 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-xl">{SUBJECT_EMOJIS[a.subject]}</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-stone-800 text-sm truncate">{a.title}</p>
            <p className="text-xs text-stone-400">
              {CLASS_LABELS[a.class]} · Term {a.term} · {SUBJECT_LABELS[a.subject]}
              {a.due_date ? ` · Due ${new Date(a.due_date).toLocaleDateString()}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-bold text-stone-500">{done}/{total}</span>
            <button onClick={() => setExpanded(isExpanded ? null : a.id)}
              className="text-xs px-2 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-600 transition">
              {isExpanded ? "▲" : "▼"}
            </button>
            <button onClick={() => { setEditing(a); setShowModal(true); }}
              className="text-xs px-2 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-600 transition">
              ✏️
            </button>
          </div>
        </div>

        {/* Content keys */}
        <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
          {a.content_keys.map(k => (
            <span key={k} className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">{k}</span>
          ))}
        </div>

        {/* Progress detail */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
              className="overflow-hidden border-t border-stone-100">
              {detail.length === 0 ? (
                <p className="px-4 py-3 text-xs text-stone-400">No students assigned yet.</p>
              ) : (
                <div className="divide-y divide-stone-50">
                  {detail.map(row => (
                    <div key={row.id} className="flex items-center gap-2 px-4 py-2">
                      <span className={`text-sm ${row.completed ? "text-green-500" : "text-stone-300"}`}>
                        {row.completed ? "✅" : "⏳"}
                      </span>
                      <span className="text-xs text-stone-600 flex-1">
                        {row.child_id.slice(0, 8)}…
                      </span>
                      {row.completed_at && (
                        <span className="text-xs text-stone-400">
                          {new Date(row.completed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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

// ─── Reports tab ──────────────────────────────────────────────────────────────

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

// ─── Main page ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "overview",    label: "Overview",    emoji: "🏫" },
  { id: "students",    label: "Students",    emoji: "👥" },
  { id: "assignments", label: "Assignments", emoji: "📝" },
  { id: "reports",     label: "Reports",     emoji: "📊" },
];

export default function SchoolDashboardPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("overview");
  const [school, setSchool] = useState<School | null>(null);
  const [adminId, setAdminId] = useState<string>("");
  const [students, setStudents] = useState<ChildWithClass[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setAdminId(user.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from("profiles").select("school_id").eq("id", user.id).single();
    if (!profile?.school_id) { setLoading(false); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: schoolData } = await (supabase as any)
      .from("schools").select("id, name, school_code").eq("id", profile.school_id).single();
    setSchool(schoolData as School);

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
        <p className="text-stone-500">No school linked to your account.</p>
        <p className="text-stone-400 text-xs mt-1">Contact support to set up your school.</p>
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
