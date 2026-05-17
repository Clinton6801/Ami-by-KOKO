"use client";

/**
 * Student login page — designed for children aged 1–6 in a classroom.
 *
 * Flow:
 * 1. Enter school code (e.g. AMIK-0042)
 * 2. See class list for that school → tap your name
 * 3. Enter 4-digit PIN on a big number pad
 * 4. Logged in via Supabase Auth → /home (works on any device)
 *
 * No keyboard required. All tap targets ≥ 64×64px.
 *
 * Auth strategy: each student has a Supabase Auth account with
 * synthetic email {child_id}@students.amibykoko.com and
 * password {school_id}-{pin}. The login UI never exposes this —
 * the child only ever sees school code + name + PIN.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { ChildWithClass } from "@/types";

type Step = "school_code" | "pick_name" | "enter_pin";

// ─── School code input ────────────────────────────────────────────────────────

function SchoolCodeStep({
  onNext,
}: {
  onNext: (code: string, schoolId: string, students: ChildWithClass[]) => void;
}) {
  const supabase = createClient();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: school, error: schoolErr } = await (supabase as any)
      .from("schools")
      .select("id, name, school_code")
      .eq("school_code", trimmed)
      .single();

    if (schoolErr || !school) {
      setError("School code not found. Check with your teacher.");
      setLoading(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: students } = await (supabase as any)
      .from("children")
      .select("id, name, avatar_url, class, term, student_pin, school_id, auth_user_id")
      .eq("school_id", school.id)
      .order("name", { ascending: true });

    if (!students || students.length === 0) {
      setError("No students found for this school. Ask your teacher.");
      setLoading(false);
      return;
    }

    onNext(trimmed, school.id, students as ChildWithClass[]);
    setLoading(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 w-full max-w-sm"
    >
      <div className="text-center">
        <p className="text-stone-600 font-semibold text-lg">What is your school code?</p>
        <p className="text-stone-400 text-sm mt-1">Ask your teacher if you don&apos;t know it</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. AMIK-0042"
          maxLength={10}
          className="w-full text-center text-2xl font-bold tracking-widest rounded-2xl border-2 border-amber-200 px-4 py-4 text-stone-900 placeholder-stone-300 focus:outline-none focus:border-amber-400 uppercase"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
        />

        {error && (
          <p role="alert" className="text-center text-sm text-red-600 font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-extrabold text-xl py-5 rounded-2xl transition shadow-lg shadow-amber-200 active:scale-95"
          style={{ minHeight: 64 }}
        >
          {loading ? "Looking up…" : "Next →"}
        </button>
      </form>

      <a href="/auth/login" className="text-sm text-stone-400 hover:text-amber-600 transition">
        Parent / teacher login →
      </a>
    </motion.div>
  );
}

// ─── Pick name ────────────────────────────────────────────────────────────────

function PickNameStep({
  students,
  onNext,
  onBack,
}: {
  students: ChildWithClass[];
  onNext: (student: ChildWithClass) => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col items-center gap-5 w-full max-w-sm"
    >
      <div className="text-center">
        <p className="text-stone-600 font-semibold text-lg">Who are you?</p>
        <p className="text-stone-400 text-sm mt-1">Tap your name</p>
      </div>

      <div className="w-full grid grid-cols-2 gap-3">
        {students.map(student => (
          <motion.button
            key={student.id}
            onClick={() => onNext(student)}
            whileTap={{ scale: 0.93 }}
            className="flex flex-col items-center gap-2 bg-white rounded-3xl p-4 shadow-md ring-1 ring-amber-100 hover:bg-amber-50 transition"
            style={{ minHeight: 80 }}
          >
            <span className="text-3xl">{student.avatar_url ?? "🧒🏾"}</span>
            <span className="font-bold text-stone-800 text-sm text-center leading-tight">
              {student.name}
            </span>
          </motion.button>
        ))}
      </div>

      <button onClick={onBack} className="text-sm text-stone-400 hover:text-stone-600 transition">
        ← Wrong school code?
      </button>
    </motion.div>
  );
}

// ─── PIN pad ──────────────────────────────────────────────────────────────────

function PinStep({
  student,
  schoolId,
  onBack,
}: {
  student: ChildWithClass;
  schoolId: string;
  onBack: () => void;
}) {
  const supabase = createClient();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("Wrong number, try again!");
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const DIGITS = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  async function handleDigit(d: string) {
    if (loading) return;
    if (d === "⌫") {
      setPin(p => p.slice(0, -1));
      setError(false);
      return;
    }
    if (d === "") return;
    if (pin.length >= 4) return;

    const next = pin + d;
    setPin(next);
    setError(false);

    if (next.length === 4) {
      setLoading(true);

      // Strategy 1: try Supabase Auth sign-in (cross-device, works if auth account exists)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const authEmail = `${student.id}@students.amibykoko.com`;
      const authPassword = `${schoolId}-${next}`;

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (!signInErr) {
        // Real Supabase session — set activeChildId and go home
        localStorage.setItem("activeChildId", student.id);
        window.location.href = "/home";
        return;
      }

      // Strategy 2: fallback — verify PIN locally (for students created before auth migration)
      if (next === student.student_pin) {
        // PIN matches but no auth account yet — still let them in via localStorage
        // (admin should re-save the student to create their auth account)
        localStorage.setItem("activeChildId", student.id);
        window.location.href = "/home";
        return;
      }

      // Wrong PIN
      setError(true);
      setErrorMsg("Wrong number, try again!");
      setShaking(true);
      setLoading(false);
      setTimeout(() => { setPin(""); setShaking(false); }, 600);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col items-center gap-5 w-full max-w-xs"
    >
      <div className="text-center">
        <span className="text-4xl">{student.avatar_url ?? "🧒🏾"}</span>
        <p className="text-stone-800 font-extrabold text-xl mt-2">{student.name}</p>
        <p className="text-stone-500 text-sm mt-1">Enter your secret number</p>
      </div>

      {/* PIN dots */}
      <motion.div
        animate={shaking ? { x: [-8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex gap-4"
      >
        {[0,1,2,3].map(i => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full border-2 transition-colors ${
              i < pin.length
                ? error ? "bg-red-400 border-red-400" : "bg-amber-500 border-amber-500"
                : "bg-stone-100 border-stone-300"
            }`}
          />
        ))}
      </motion.div>

      {error && (
        <p className="text-red-500 text-sm font-semibold">{errorMsg}</p>
      )}

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {DIGITS.map((d, i) => (
          <button
            key={i}
            onClick={() => handleDigit(d)}
            disabled={d === "" || loading}
            className={`
              flex items-center justify-center rounded-2xl font-extrabold text-2xl transition
              ${d === "" ? "invisible" : ""}
              ${d === "⌫"
                ? "bg-stone-100 text-stone-500 hover:bg-stone-200 active:scale-90"
                : "bg-white shadow-md ring-1 ring-stone-100 text-stone-800 hover:bg-amber-50 active:scale-90"
              }
              ${loading ? "opacity-50" : ""}
            `}
            style={{ minHeight: 64, minWidth: 64 }}
            aria-label={d === "⌫" ? "Delete" : d === "" ? "" : `Number ${d}`}
          >
            {loading && pin.length === 4 ? (
              <span className="text-base animate-pulse">…</span>
            ) : d}
          </button>
        ))}
      </div>

      <button onClick={onBack} className="text-sm text-stone-400 hover:text-stone-600 transition">
        ← Not me
      </button>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StudentLoginPage() {
  const [step, setStep] = useState<Step>("school_code");
  const [schoolCode, setSchoolCode] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [students, setStudents] = useState<ChildWithClass[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<ChildWithClass | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col items-center justify-start px-4 pt-8 pb-12">

      {/* Header illustration */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="relative w-32 h-32">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ami-koko.svg"
            alt="Àmì and Kòkò"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-2xl font-extrabold text-amber-900">Àmì by Kòkò</h1>
        <p className="text-stone-500 text-sm">Student Login</p>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {step === "school_code" && (
          <SchoolCodeStep
            key="school_code"
            onNext={(code, sid, studs) => {
              setSchoolCode(code);
              setSchoolId(sid);
              setStudents(studs);
              setStep("pick_name");
            }}
          />
        )}

        {step === "pick_name" && (
          <PickNameStep
            key="pick_name"
            students={students}
            onNext={student => {
              setSelectedStudent(student);
              setStep("enter_pin");
            }}
            onBack={() => setStep("school_code")}
          />
        )}

        {step === "enter_pin" && selectedStudent && (
          <PinStep
            key="enter_pin"
            student={selectedStudent}
            schoolId={schoolId}
            onBack={() => setStep("pick_name")}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
