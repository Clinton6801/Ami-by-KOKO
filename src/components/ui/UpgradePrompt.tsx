"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { openPaystackPopup, generateReference, PAYSTACK_PLANS } from "@/lib/paystack/client";
import { useState, useEffect } from "react";
import SchoolLockedOverlay from "@/components/ui/SchoolLockedOverlay";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  /** e.g. "letters G–Z" or "numbers 4–10" */
  feature?: string;
}

export default function UpgradePrompt({ isOpen, onClose, feature }: UpgradePromptProps) {
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const email = user?.email ?? null;
      setUserEmail(email);
      setIsStudent(email?.endsWith("@amibykoko.app") ?? false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Students never see pricing — show SchoolLockedOverlay instead
  if (isStudent) {
    return <SchoolLockedOverlay isOpen={isOpen} onClose={onClose} />;
  }

  function handlePlan(planKey: keyof typeof PAYSTACK_PLANS) {
    if (!userEmail) {
      window.location.href = "/auth/login";
      return;
    }
    const plan = PAYSTACK_PLANS[planKey];
    onClose();
    openPaystackPopup({
      email: userEmail,
      amount: plan.amount,
      reference: generateReference(plan.id),
      planId: plan.id,
      onSuccess: () => {
        setTimeout(() => window.location.reload(), 1500);
      },
      onClose: () => {},
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 pb-10 max-w-lg mx-auto"
          >
            <div className="text-center mb-4">
              <motion.span
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl inline-block"
              >
                🦜
              </motion.span>
              <p className="text-stone-400 text-xs mt-1">Kòkò wants to teach you more!</p>
            </div>

            <h2 className="text-xl font-extrabold text-stone-900 text-center mb-1">
              Unlock {feature ?? "everything"}
            </h2>
            <p className="text-stone-500 text-sm text-center mb-6 leading-relaxed">
              Get full access to all letters, numbers, and languages with an Explorer plan.
            </p>

            <div className="flex flex-col gap-3 mb-5">
              <button
                onClick={() => handlePlan("EXPLORER_MONTHLY")}
                className="w-full flex items-center justify-between bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-3 hover:border-amber-400 transition active:scale-95"
              >
                <div className="text-left">
                  <p className="font-bold text-stone-900">Explorer Monthly</p>
                  <p className="text-xs text-stone-500">1 child · cancel anytime</p>
                </div>
                <p className="font-extrabold text-amber-600 text-lg">
                  ₦1,500<span className="text-xs font-normal">/mo</span>
                </p>
              </button>

              <button
                onClick={() => handlePlan("EXPLORER_YEARLY")}
                className="w-full flex items-center justify-between bg-amber-500 rounded-2xl px-4 py-3 hover:bg-amber-600 transition relative overflow-hidden active:scale-95"
              >
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-bl-xl">
                  BEST VALUE
                </div>
                <div className="text-left">
                  <p className="font-bold text-white">Explorer Annual</p>
                  <p className="text-xs text-amber-100">2 months free · 1 child</p>
                </div>
                <p className="font-extrabold text-white text-lg">
                  ₦15,000<span className="text-xs font-normal">/yr</span>
                </p>
              </button>

              <button
                onClick={() => handlePlan("FAMILY_MONTHLY")}
                className="w-full flex items-center justify-between bg-white border border-stone-200 rounded-2xl px-4 py-3 hover:border-amber-300 transition active:scale-95"
              >
                <div className="text-left">
                  <p className="font-bold text-stone-900">Family Plan</p>
                  <p className="text-xs text-stone-500">Up to 4 children</p>
                </div>
                <p className="font-extrabold text-stone-700 text-lg">
                  ₦2,500<span className="text-xs font-normal">/mo</span>
                </p>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full text-center text-sm text-stone-400 hover:text-stone-600 transition py-2"
            >
              Maybe later
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
