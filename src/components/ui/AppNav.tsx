"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

interface AppNavProps {
  profile: Profile;
}

const MODE_LABELS: Record<string, string> = {
  "/phonics":      "Phonics",
  "/numeracy":     "Numbers",
  "/world":        "My World",
  "/dj-booth":     "DJ Booth",
  "/story":        "Story Mode",
  "/dashboard":    "Dashboard",
  "/settings":     "Settings",
  "/live-class":   "Live Class",
  "/assignment":   "Assignment",
  "/literacy":     "Literacy",
};

export default function AppNav({ profile }: AppNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [childName, setChildName] = useState<string | null>(null);
  const [childAvatar, setChildAvatar] = useState<string | null>(null);

  const isHome = pathname === "/home";
  const currentLabel = Object.entries(MODE_LABELS).find(([key]) => pathname.startsWith(key))?.[1];
  const isSchoolAdmin = profile.role === "school_admin";

  // Load active child for personalisation
  useEffect(() => {
    if (isSchoolAdmin) return;
    const savedId = typeof window !== "undefined" ? localStorage.getItem("activeChildId") : null;
    if (!savedId) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from("children" as any).select("name, avatar_url").eq("id", savedId).single()
      .then(({ data }: { data: { name: string; avatar_url: string | null } | null }) => {
        if (data) { setChildName(data.name); setChildAvatar(data.avatar_url); }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSchoolAdmin]);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <>
      {/* Amber gradient nav */}
      <nav className="sticky top-0 z-50 shadow-sm"
        style={{ background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FEF9C3 100%)", borderBottom: "1px solid #FCD34D" }}>
        <div className="px-3 sm:px-4 py-2.5 flex items-center justify-between">

          {/* Left — back + logo */}
          <div className="flex items-center gap-2">
            {!isHome && (
              <button onClick={() => router.back()}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 transition flex-shrink-0"
                aria-label="Go back">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}

            <Link href="/home" className="flex items-center gap-2 hover:opacity-80 transition" aria-label="Home">
              <span className="text-2xl" aria-hidden>🦜</span>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-extrabold text-amber-900 text-sm">Àmì by Kòkò</span>
                {currentLabel && <span className="text-xs text-amber-700 font-medium">{currentLabel}</span>}
              </div>
            </Link>

            {currentLabel && (
              <span className="text-sm font-bold text-amber-900 sm:hidden">{currentLabel}</span>
            )}
          </div>

          {/* Right — child avatar + menu */}
          <div className="flex items-center gap-2">
            {!isHome && (
              <Link href="/home"
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 transition"
                aria-label="Home">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(v => !v)}
              className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 rounded-xl px-2.5 py-1.5 transition"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              {/* Child avatar or role icon */}
              <span className="text-lg leading-none">
                {isSchoolAdmin ? "🏫" : (childAvatar ?? "👩‍👦")}
              </span>
              <span className="text-xs font-bold text-amber-900 hidden sm:block max-w-[80px] truncate">
                {isSchoolAdmin
                  ? (profile.full_name.split(" ")[0] || "Admin")
                  : (childName ?? profile.full_name.split(" ")[0])}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="text-amber-700">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-3 sm:right-4 top-14 z-50 bg-white rounded-2xl shadow-xl ring-1 ring-amber-100 py-2 min-w-[190px]"
            >
              <div className="px-4 py-2.5 border-b border-amber-50">
                <p className="font-bold text-amber-900 text-sm">{profile.full_name || "Account"}</p>
                <p className="text-xs text-stone-500 capitalize">{profile.role.replace("_", " ")}</p>
                {childName && !isSchoolAdmin && (
                  <p className="text-xs text-amber-600 font-semibold mt-0.5">👶 {childName}</p>
                )}
              </div>

              {isSchoolAdmin ? (
                <Link href="/dashboard/school" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 transition">
                  <span>🏫</span> School Dashboard
                </Link>
              ) : (
                <Link href="/dashboard/parent" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 transition">
                  <span>📊</span> Dashboard
                </Link>
              )}

              <Link href="/settings" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 transition">
                <span>⚙️</span> Settings
              </Link>

              <div className="border-t border-amber-50 mt-1 pt-1">
                {confirmSignOut ? (
                  <div className="px-4 py-2">
                    <p className="text-xs text-stone-600 mb-2 font-medium">Sign out?</p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmSignOut(false)}
                        className="flex-1 text-xs py-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition">
                        Cancel
                      </button>
                      <button onClick={handleSignOut} disabled={signingOut}
                        className="flex-1 text-xs py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-60">
                        {signingOut ? "…" : "Sign out"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setConfirmSignOut(true)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition">
                    <span>🚪</span> Sign out
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
