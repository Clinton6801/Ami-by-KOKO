"use client";

/**
 * OnboardingTour — 4-step guided tour for school admins.
 * Shown only when profiles.onboarding_complete = false AND role = school_admin.
 * After completion, sets onboarding_complete = true in profiles table.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface OnboardingTourProps {
  schoolCode: string;
  schoolId: string;
  userId: string;
  onComplete: () => void;
}

export default function OnboardingTour({ schoolCode, schoolId, userId, onComplete }: OnboardingTourProps) {
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  const TOTAL_STEPS = 4;

  async function uploadLogo() {
    if (!logoFile) { nextStep(); return; }
    setLogoUploading(true);
    try {
      const ext = logoFile.name.split(".").pop();
      const path = `${schoolId}/logo.${ext}`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any).storage
        .from("school-logos")
        .upload(path, logoFile, { upsert: true });
      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: urlData } = (supabase as any).storage.from("school-logos").getPublicUrl(path);
        const url = urlData?.publicUrl;
        if (url) {
          setLogoUrl(url);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from("schools").update({ logo_url: url }).eq("id", schoolId);
        }
      }
    } catch { /* non-fatal */ }
    setLogoUploading(false);
    nextStep();
  }

  function nextStep() {
    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1);
    } else {
      handleComplete();
    }
  }

  async function handleComplete() {
    setCompleting(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({ onboarding_complete: true }).eq("id", userId);
    setCompleting(false);
    onComplete();
  }

  const steps = [
    // Step 0 — Welcome
    <motion.div key="welcome" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
      className="flex flex-col items-center gap-5 text-center px-2">
      <div className="text-6xl">🏫</div>
      <h2 className="text-xl font-extrabold text-stone-900">Welcome to Àmì by Kòkò!</h2>
      <p className="text-stone-500 text-sm leading-relaxed">
        Let&apos;s set up your school in 4 quick steps. Your students will be learning in minutes.
      </p>
      <div className="w-full bg-amber-50 rounded-2xl p-4 ring-1 ring-amber-200">
        <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Your School Code</p>
        <p className="text-3xl font-extrabold tracking-widest text-amber-600">{schoolCode}</p>
        <p className="text-xs text-stone-500 mt-1">Share this with parents so students can log in at home</p>
      </div>
      <button onClick={nextStep}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl transition shadow-md shadow-amber-200">
        Next →
      </button>
    </motion.div>,

    // Step 1 — Upload logo
    <motion.div key="logo" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
      className="flex flex-col items-center gap-5 text-center px-2">
      <div className="text-6xl">📸</div>
      <h2 className="text-xl font-extrabold text-stone-900">Add your school logo</h2>
      <p className="text-stone-500 text-sm leading-relaxed">
        Your students will see it every time they log in. You can skip this and add it later in Settings.
      </p>
      {logoUrl ? (
        <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-green-400">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt="School logo" className="w-full h-full object-cover" />
        </div>
      ) : (
        <label className="w-full flex flex-col items-center gap-2 bg-stone-50 border-2 border-dashed border-stone-300 rounded-2xl p-6 cursor-pointer hover:border-amber-400 transition">
          <span className="text-3xl">📁</span>
          <span className="text-sm font-semibold text-stone-600">
            {logoFile ? logoFile.name : "Tap to upload logo"}
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={e => setLogoFile(e.target.files?.[0] ?? null)} />
        </label>
      )}
      <div className="flex gap-3 w-full">
        <button onClick={nextStep}
          className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition text-sm">
          Skip for now
        </button>
        <button onClick={uploadLogo} disabled={logoUploading}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-2xl transition disabled:opacity-60">
          {logoUploading ? "Uploading…" : logoFile ? "Upload & Next →" : "Next →"}
        </button>
      </div>
    </motion.div>,

    // Step 2 — Add first student
    <motion.div key="student" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
      className="flex flex-col items-center gap-5 text-center px-2">
      <div className="text-6xl">👦🏾</div>
      <h2 className="text-xl font-extrabold text-stone-900">Add your first student</h2>
      <p className="text-stone-500 text-sm leading-relaxed">
        Head to the Students tab to add your class. Each student gets a 4-digit PIN to log in.
      </p>
      <div className="w-full bg-green-50 rounded-2xl p-4 ring-1 ring-green-200 text-left">
        <p className="text-xs font-bold text-green-700 mb-2">What you&apos;ll need for each student:</p>
        <ul className="text-sm text-stone-600 flex flex-col gap-1">
          <li>✅ Student&apos;s name</li>
          <li>✅ Class (Sprout 1)</li>
          <li>✅ Term (1, 2, or 3)</li>
          <li>✅ 4-digit PIN (they use this to log in)</li>
        </ul>
      </div>
      <button onClick={nextStep}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition shadow-md shadow-green-200">
        Got it — Next →
      </button>
    </motion.div>,

    // Step 3 — Create first assignment
    <motion.div key="assignment" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
      className="flex flex-col items-center gap-5 text-center px-2">
      <div className="text-6xl">📝</div>
      <h2 className="text-xl font-extrabold text-stone-900">Create your first assignment</h2>
      <p className="text-stone-500 text-sm leading-relaxed">
        Set a tracing or listening activity for your class. Students see it on their home screen.
      </p>
      <div className="w-full bg-amber-50 rounded-2xl p-4 ring-1 ring-amber-200 text-left">
        <p className="text-xs font-bold text-amber-700 mb-2">Assignment types available:</p>
        <ul className="text-sm text-stone-600 flex flex-col gap-1">
          <li>🔤 Literacy — trace letters s, a, t, i, p, n</li>
          <li>🔢 Numeracy — count numbers 1, 2, 3</li>
          <li>🌍 My World — learn body parts</li>
        </ul>
      </div>
      <button onClick={nextStep} disabled={completing}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl transition shadow-md shadow-amber-200 disabled:opacity-60">
        {completing ? "Setting up…" : "Done — Let\'s go! 🎉"}
      </button>
    </motion.div>,
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center pt-5 pb-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? "w-6 bg-amber-500" : i < step ? "w-1.5 bg-amber-300" : "w-1.5 bg-stone-200"
            }`}/>
          ))}
        </div>
        <p className="text-center text-xs text-stone-400 mb-2">Step {step + 1} of {TOTAL_STEPS}</p>

        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            {steps[step]}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
