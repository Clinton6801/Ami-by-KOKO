"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

  const isHome = pathname === "/home";

  // Find the label for the current top-level route
  const currentLabel = Object.entries(MODE_LABELS).find(([key]) =>
    pathname.startsWith(key)
  )?.[1];

  return (
    <nav className="bg-white border-b border-amber-100 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">

      {/* Left — back button or logo */}
      <div className="flex items-center gap-3">
        {!isHome ? (
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : null}

        <Link
          href="/home"
          className="flex items-center gap-2 hover:opacity-80 transition"
          aria-label="Go to home"
        >
          <span className="text-xl" aria-hidden>🦜</span>
          <span className="font-bold text-amber-900 text-sm hidden sm:block">
            Àmì by Kòkò
          </span>
        </Link>

        {/* Current page label on mobile */}
        {currentLabel && (
          <span className="text-sm font-semibold text-stone-600 sm:hidden">
            {currentLabel}
          </span>
        )}
      </div>

      {/* Centre — page title on desktop */}
      {currentLabel && (
        <span className="hidden sm:block text-sm font-semibold text-stone-600 absolute left-1/2 -translate-x-1/2">
          {currentLabel}
        </span>
      )}

      {/* Right — home shortcut + user info */}
      <div className="flex items-center gap-2">
        {!isHome && (
          <Link
            href="/home"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition"
            aria-label="Go to home screen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </Link>
        )}

        <span className="text-xs text-stone-500 hidden md:block">
          {profile.full_name}
        </span>

        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            profile.role === "school_admin"
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {profile.role === "school_admin" ? "🏫" : "👩‍👦"}
        </span>
      </div>
    </nav>
  );
}
