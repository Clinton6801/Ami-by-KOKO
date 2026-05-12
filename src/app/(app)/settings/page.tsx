"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useChild } from "@/hooks/useChild";
import CreateChildModal from "@/components/ui/CreateChildModal";
import { AnimatePresence } from "framer-motion";
import { openPaystackPopup, generateReference, PRICING } from "@/lib/paystack/client";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { children, activeChild, selectChild } = useChild();
  const [showAddChild, setShowAddChild] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  // Load user info once
  useState(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); setUserEmail(user.email ?? null); }
    });
  });

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  function handleUpgrade() {
    if (!userEmail) return;
    openPaystackPopup({
      email: userEmail,
      amount: PRICING.individual_monthly,
      reference: generateReference("yoruba"),
      onSuccess: (ref) => {
        console.log("Payment success:", ref);
        // TODO: verify on server and update subscription
        alert("Payment successful! Yorùbá will be unlocked shortly.");
      },
      onClose: () => {},
    });
  }

  return (
    <>
      <div className="flex flex-col gap-5 pb-10">
        <h1 className="text-2xl font-extrabold text-stone-800">Settings</h1>

        {/* Account */}
        <section className="bg-white rounded-3xl p-5 shadow-sm ring-1 ring-stone-100">
          <h2 className="font-bold text-stone-700 mb-3">Account</h2>
          {userEmail && (
            <p className="text-sm text-stone-500 mb-4">
              Signed in as <span className="font-medium text-stone-700">{userEmail}</span>
            </p>
          )}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-2xl transition disabled:opacity-60"
          >
            🚪 {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </section>

        {/* Child profiles */}
        <section className="bg-white rounded-3xl p-5 shadow-sm ring-1 ring-stone-100">
          <h2 className="font-bold text-stone-700 mb-3">Child Profiles</h2>
          <div className="flex flex-col gap-2">
            {children.map(child => (
              <div key={child.id}
                className={`flex items-center justify-between p-3 rounded-2xl transition cursor-pointer ${
                  activeChild?.id === child.id ? "bg-amber-50 ring-1 ring-amber-200" : "bg-stone-50 hover:bg-amber-50"
                }`}
                onClick={() => selectChild(child)}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{child.avatar_url ?? "🧒🏾"}</span>
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">{child.name}</p>
                    {child.age && <p className="text-xs text-stone-400">Age {child.age}</p>}
                  </div>
                </div>
                {activeChild?.id === child.id && (
                  <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Active</span>
                )}
              </div>
            ))}
          </div>
          {userId && (
            <button
              onClick={() => setShowAddChild(true)}
              className="mt-3 w-full flex items-center justify-center gap-2 text-sm font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 py-3 rounded-2xl transition"
            >
              ➕ Add child profile
            </button>
          )}
        </section>

        {/* Language packs */}
        <section className="bg-white rounded-3xl p-5 shadow-sm ring-1 ring-stone-100">
          <h2 className="font-bold text-stone-700 mb-3">Language Packs</h2>
          <div className="flex flex-col gap-3">
            {/* English — free */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-2xl ring-1 ring-green-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇬🇧</span>
                <div>
                  <p className="font-semibold text-stone-800 text-sm">English</p>
                  <p className="text-xs text-stone-500">Full A–Z phonics</p>
                </div>
              </div>
              <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">Free ✓</span>
            </div>

            {/* Yorùbá — paid */}
            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl ring-1 ring-stone-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇳🇬</span>
                <div>
                  <p className="font-semibold text-stone-800 text-sm">Yorùbá</p>
                  <p className="text-xs text-stone-500">₦1,500/month</p>
                </div>
              </div>
              <button
                onClick={handleUpgrade}
                className="text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-full transition"
              >
                Unlock
              </button>
            </div>

            {/* Coming soon */}
            {["Igbo", "Hausa"].map(lang => (
              <div key={lang} className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl ring-1 ring-stone-100 opacity-60">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇳🇬</span>
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">{lang}</p>
                    <p className="text-xs text-stone-400">Coming soon</p>
                  </div>
                </div>
                <span className="text-xs text-stone-400 bg-stone-100 px-2 py-1 rounded-full">Soon</span>
              </div>
            ))}
          </div>
        </section>

        {/* App info */}
        <section className="bg-white rounded-3xl p-5 shadow-sm ring-1 ring-stone-100">
          <h2 className="font-bold text-stone-700 mb-3">About</h2>
          <p className="text-sm text-stone-500">Àmì by Kòkò — v0.1.0 MVP</p>
          <p className="text-xs text-stone-400 mt-1">Made with ❤️ for Nigerian children.</p>
        </section>
      </div>

      <AnimatePresence>
        {showAddChild && userId && (
          <CreateChildModal
            parentId={userId}
            onCreated={() => { setShowAddChild(false); window.location.reload(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
