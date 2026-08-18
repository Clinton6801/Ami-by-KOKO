"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { openPaystackPopup, generateReference, PRICING } from "@/lib/paystack/client";
import { AnimatePresence, motion } from "framer-motion";

const LANGUAGES = [
  { code: "english", label: "English", emoji: "🇬🇧", free: true,  description: "Full A–Z phonics",          comingSoon: false },
  { code: "yoruba",  label: "Yorùbá",  emoji: "🇳🇬", free: false, description: "₦1,500/month · Launching soon", comingSoon: true  },
  { code: "french",  label: "Français", emoji: "🇫🇷", free: false, description: "₦1,500/month · Launching soon", comingSoon: true  },
];

export default function PhonicsLanguagePage() {
  const supabase = createClient();
  const [hasYoruba, setHasYoruba] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isStudent, setIsStudent] = useState(false);
  const [checking, setChecking] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setChecking(false); return; }

      setUserEmail(user.email ?? null);
      setUserId(user.id ?? null);

      const studentAccount = user.email?.endsWith("@amibykoko.app") ?? false;
      setIsStudent(studentAccount);

      if (studentAccount) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: child } = await (supabase as any)
          .from("children")
          .select("school_id, schools(subscription_active)")
          .eq("auth_user_id", user.id)
          .limit(1)
          .single();
        setHasYoruba(child?.schools?.subscription_active ?? false);
      } else {
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

  async function verifySubscriptionCreated(): Promise<boolean> {
    if (!userId) return false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: sub } = await (supabase as any)
        .from("subscriptions")
        .select("active, expires_at")
        .eq("profile_id", userId)
        .eq("active", true)
        .maybeSingle();

      if (sub) {
        const now = new Date().toISOString();
        const isValid = !sub.expires_at || sub.expires_at > now;
        return isValid;
      }
      return false;
    } catch {
      return false;
    }
  }

  function handleUnlock() {
    if (!userEmail || !userId || isStudent) return;
    setPaymentStatus("processing");
    setPaymentErrorMessage(null);

    openPaystackPopup({
      email: userEmail,
      amount: PRICING.individual_monthly,
      reference: generateReference("yoruba"),
      onSuccess: async () => {
        let attempts = 0;
        const maxAttempts = 20;

        const checkInterval = setInterval(async () => {
          attempts++;
          const subscriptionExists = await verifySubscriptionCreated();

          if (subscriptionExists) {
            clearInterval(checkInterval);
            setPaymentStatus("success");
            setTimeout(() => window.location.reload(), 2000);
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            setPaymentStatus("error");
            setPaymentErrorMessage("Payment received but subscription not confirmed. Please refresh or contact support.");
          }
        }, 500);
      },
      onClose: () => {
        setPaymentStatus("idle");
      },
    });
  }

  return (
    <>
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

            if (isStudent) {
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

      <AnimatePresence>
        {paymentStatus !== "idle" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 pb-10 max-w-lg mx-auto"
            >
              {paymentStatus === "processing" && (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-5xl inline-block mb-4"
                  >
                    ⏳
                  </motion.div>
                  <h2 className="text-xl font-extrabold text-stone-900 mb-2">Processing Payment</h2>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    Please wait while we confirm your payment and unlock Yorùbá...
                  </p>
                  <p className="text-xs text-stone-400 mt-4">This usually takes a few seconds</p>
                </div>
              )}

              {paymentStatus === "success" && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-6xl inline-block mb-4"
                  >
                    ✨
                  </motion.div>
                  <h2 className="text-2xl font-extrabold text-green-700 mb-2">Payment Successful!</h2>
                  <p className="text-stone-600 text-sm leading-relaxed mb-4">
                    Yorùbá is now unlocked. Reloading...
                  </p>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-4xl inline-block"
                  >
                    🎉
                  </motion.div>
                </div>
              )}

              {paymentStatus === "error" && (
                <div className="text-center py-8">
                  <div className="text-5xl inline-block mb-4">⚠️</div>
                  <h2 className="text-xl font-extrabold text-red-700 mb-2">Confirmation Delayed</h2>
                  <p className="text-stone-600 text-sm leading-relaxed mb-4">
                    {paymentErrorMessage}
                  </p>
                  <p className="text-xs text-stone-500 mb-6">
                    Try refreshing the page.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => window.location.reload()}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-2xl transition"
                    >
                      Refresh Page
                    </button>
                    <button
                      onClick={() => setPaymentStatus("idle")}
                      className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold py-3 rounded-2xl transition"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
