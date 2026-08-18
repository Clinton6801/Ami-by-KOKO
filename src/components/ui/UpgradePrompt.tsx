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
  const [userId, setUserId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const email = user?.email ?? null;
      setUserEmail(email);
      setUserId(user?.id ?? null);
      setIsStudent(email?.endsWith("@amibykoko.app") ?? false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Students never see pricing — show SchoolLockedOverlay instead
  if (isStudent) {
    return <SchoolLockedOverlay isOpen={isOpen} onClose={onClose} />;
  }

  async function verifySubscriptionCreated(): Promise<boolean> {
    if (!userId) return false;

    try {
      // Check if subscription was created by the webhook
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: sub, error } = await (supabase as any)
        .from("subscriptions")
        .select("active, expires_at")
        .eq("profile_id", userId)
        .eq("active", true)
        .maybeSingle();

      if (error) {
        console.error("[UpgradePrompt] Error checking subscription:", error);
        return false;
      }

      if (sub) {
        const now = new Date().toISOString();
        const isValid = !sub.expires_at || sub.expires_at > now;
        console.log("[UpgradePrompt] ✓ Subscription found and valid:", isValid);
        return isValid;
      }

      console.log("[UpgradePrompt] Subscription not yet created (polling...)");
      return false;
    } catch (err) {
      console.error("[UpgradePrompt] Exception checking subscription:", err);
      return false;
    }
  }

  function handlePlan(planKey: keyof typeof PAYSTACK_PLANS) {
    if (!userEmail) {
      window.location.href = "/auth/login";
      return;
    }
    const plan = PAYSTACK_PLANS[planKey];
    onClose();
    setPaymentStatus("processing");
    setErrorMessage(null);

    openPaystackPopup({
      email: userEmail,
      amount: plan.amount,
      reference: generateReference(plan.id),
      planId: plan.id,
      onSuccess: async (reference) => {
        console.log("[UpgradePrompt] Payment callback received, reference:", reference);
        console.log("[UpgradePrompt] Waiting for webhook to process subscription...");
        
        // Payment completed on client — webhook is processing asynchronously on server.
        // Poll for subscription creation (max 10 seconds, check every 500ms).
        let attempts = 0;
        const maxAttempts = 20; // 20 * 500ms = 10 seconds

        const checkInterval = setInterval(async () => {
          attempts++;
          const subscriptionExists = await verifySubscriptionCreated();

          if (subscriptionExists) {
            clearInterval(checkInterval);
            console.log("[UpgradePrompt] ✓ Subscription verified after", attempts * 500, "ms");
            setPaymentStatus("success");
            
            // Show success message for 2 seconds, then reload
            setTimeout(() => {
              console.log("[UpgradePrompt] Reloading page to reflect unlocked content...");
              window.location.reload();
            }, 2000);
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            console.error("[UpgradePrompt] ✗ Subscription not created after 10 seconds");
            console.error("[UpgradePrompt] Webhook may have failed. Reference:", reference);
            setPaymentStatus("error");
            setErrorMessage("Payment received but subscription not confirmed. Please refresh the page or contact support.");
          }
        }, 500);
      },
      onClose: () => {
        setPaymentStatus("idle");
      },
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
            onClick={paymentStatus === "idle" ? onClose : undefined}
            className="fixed inset-0 bg-black/40 z-40"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 pb-10 max-w-lg mx-auto"
          >
            {/* ── IDLE STATE (pricing modal) ── */}
            {paymentStatus === "idle" && (
              <>
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
              </>
            )}

            {/* ── PROCESSING STATE (waiting for webhook) ── */}
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
                  Please wait while we confirm your payment and unlock your content...
                </p>
                <p className="text-xs text-stone-400 mt-4">This usually takes a few seconds</p>
              </div>
            )}

            {/* ── SUCCESS STATE (payment confirmed) ── */}
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
                  Your subscription is now active. Reloading to unlock all content...
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

            {/* ── ERROR STATE (subscription not confirmed) ── */}
            {paymentStatus === "error" && (
              <div className="text-center py-8">
                <div className="text-5xl inline-block mb-4">⚠️</div>
                <h2 className="text-xl font-extrabold text-red-700 mb-2">Confirmation Delayed</h2>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  {errorMessage || "Your payment was received but we couldn't confirm it immediately."}
                </p>
                <p className="text-xs text-stone-500 mb-6">
                  Try refreshing the page. If it still doesn't work, your payment may have failed.
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
  );
}
