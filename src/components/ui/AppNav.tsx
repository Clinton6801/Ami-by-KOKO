"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

interface AppNavProps {
  profile: Profile;
}

const MODE_LABELS: Record<string, string> = {
  "/phonics":   "Phonics",
  "/dj-booth":  "DJ Booth",
  "/story":     "Story Mode",
  "/dashboard": "Dashboard",
  "/settings":  "Settings",
};

export default function AppNav({ profile }: AppNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const isHome = pathname === "/home";
  const currentLabel = Object.entries(MODE_LABELS).find(([key]) => pathname.startsWith(key))?.[1];

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <>
      <nav className="bg-white border-b border-amber-100 px-3 sm:px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">

        {/* Left */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!isHome && (
            <button onClick={() => router.back()}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition flex-shrink-0"
              aria-label="Go back">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          <Link href="/home" className="flex items-center gap-1.5 hover:opacity-80 transition" aria-label="Home">
            <span className="text-xl" aria-hidden>🦜</span>
            <span className="font-bold text-amber-900 text-sm hidden sm:block">Àmì by Kòkò</span>
          </Link>

          {currentLabel && (
            <span className="text-sm font-semibold text-stone-600 sm:hidden">{currentLabel}</span>
          )}
        </div>

        {/* Centre */}
        {currentLabel && (
          <span className="hidden sm:block text-sm font-semibold text-stone-600 absolute left-1/2 -translate-x-1/2">
            {currentLabel}
          </span>
        )}

        {/* Right */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {!isHome && (
            <Link href="/home"
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition"
              aria-label="Home">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </Link>
          )}

          {/* Avatar / menu button */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 rounded-xl px-2 py-1.5 transition"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <span className="text-base">{profile.role === "school_admin" ? "🏫" : "👩‍👦"}</span>
            <span className="text-xs font-semibold text-stone-600 hidden sm:block max-w-[80px] truncate">
              {profile.full_name.split(" ")[0]}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className="text-stone-400">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Dropdown menu */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />

          {/* Menu */}
          <div className="absolute right-3 sm:right-4 top-14 z-50 bg-white rounded-2xl shadow-xl ring-1 ring-stone-100 py-2 min-w-[180px]">
            <div className="px-4 py-2 border-b border-stone-100">
              <p className="font-semibold text-stone-800 text-sm">{profile.full_name}</p>
              <p className="text-xs text-stone-400 capitalize">{profile.role.replace("_", " ")}</p>
            </div>

            <Link href="/dashboard/parent" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 transition">
              <span>📊</span> Dashboard
            </Link>

            <Link href="/settings" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 transition">
              <span>⚙️</span> Settings
            </Link>

            <div className="border-t border-stone-100 mt-1 pt-1">
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
          </div>
        </>
      )}
    </>
  );
}
