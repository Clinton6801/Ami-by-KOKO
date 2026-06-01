"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { openPaystackPopup, generateReference, PRICING } from "@/lib/paystack/client";

const LANGUAGES = [
  { code: "english", label: "English", emoji: "🇬🇧", free: true,  description: "Full A–Z phonics",          comingSoon: false },
  { code: "yoruba",  label: "Yorùbá",  emoji: "🇳🇬", free: false, description: "₦1,500/month · Launching soon", comingSoon: true  },
  { code: "french",  label: "Français", emoji: "🇫🇷", free: false, description: "₦1,500/month · Launching soon", comingSoon: true  },
];

export default function PhonicsLanguagePage() {
  const supabase = createClient();
  const [hasYoruba, setHasYoruba] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isStudent, setIsStudent] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setChecking(false); return; }

      setUserEmail(user.email ?? null);

      // Detect student account — never show pricing to students
      const studentAccount = user.email?.endsWith("@amibykoko.app") ?? false;
      setIsStudent(studentAccount);

      if (studentAccount) {
        // Check school subscription for Yorùbá access
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: child } = await (supabase as any)
          .from("children")
          .select("school_id, schools(subscription_active)")
          .eq("auth_user_id", user.id)
          .limit(1)
          .single();
        setHasYoruba(child?.schools?.subscription_active ?? false);
      } else {
        // Check parent subscription
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
          .from("subscriptions")
          .select("active")
          .eq("profile_id", user.id)
          .eq("active", true)
          .maybeSingle();
        setHasYoruba(!!data);
      }

      setChecking(false);
    }
    check();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleUnlock() {
    if (!userEmail || isStudent) return;
    openPaystackPopup({
      email: userEmail,
      amount: PRICING.individual_monthly,
      reference: generateReference("yoruba"),
      onSuccess: (ref) => {
        console.log("Payment ref:", ref);
        alert("Payment successful! Yorùbá is now unlocked. Please refresh.");
      },
      onClose: () => {},
    });
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-stone-800">Pick a Language</h1>
        <p className="text-stone-500 text-sm mt-1">Which language do you want to learn today?</p>
      </div>

      <div className="flex flex-col gap-3 max-w-sm mx-auto w-full">
        {LANGUAGES.map(lang => {
          const unlocked = lang.free || hasYoruba;

          if (unlocked) {
            return (
              <Link key={lang.code} href={`/phonics/${lang.code}`}
                className="flex items-center justify-between bg-white rounded-3xl p-5 shadow-md ring-1 ring-amber-100 transition hover:scale-[1.02] active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{lang.emoji}</span>
                  <div>
                    <p className="font-bold text-stone-800">{lang.label}</p>
                    <p className="text-xs text-stone-500">
                      {lang.code === "yoruba" ? "Full Yorùbá phonics" : lang.description}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                  {lang.free ? "Free" : "Unlocked ✓"}
                </span>
              </Link>
            );
          }

          // Locked — student vs parent render
          if (isStudent) {
            // Student: no pricing, no unlock button, just "Launching soon"
            return (
              <div key={lang.code}
                className="flex items-center justify-between bg-white rounded-3xl p-5 shadow-md ring-1 ring-stone-100 w-full opacity-75">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{lang.emoji}</span>
                  <div>
                    <p className="font-bold text-stone-800">{lang.label}</p>
                    <p className="text-xs text-stone-500">
                      {lang.comingSoon ? "Ask your teacher to unlock" : "Locked"}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
                  🔜 Soon
                </span>
              </div>
            );
          }

          // Parent: show unlock button with pricing
          return (
            <button key={lang.code} onClick={handleUnlock} disabled={checking}
              className="flex items-center justify-between bg-white rounded-3xl p-5 shadow-md ring-1 ring-stone-100 transition hover:scale-[1.02] active:scale-[0.98] w-full text-left opacity-90">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{lang.emoji}</span>
                <div>
                  <p className="font-bold text-stone-800">{lang.label}</p>
                  <p className="text-xs text-stone-500">{lang.description}</p>
                  {lang.comingSoon && (
                    <p className="text-xs text-amber-600 font-semibold mt-0.5">🎙️ Recordings in progress</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-xs font-bold text-white bg-amber-500 px-3 py-1 rounded-full">
                  🔒 Unlock
                </span>
                {lang.comingSoon && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Launching soon
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
