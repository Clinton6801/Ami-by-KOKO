"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { UserRole } from "@/types";

const PARENT_NAV = [
  { href: "/home",             emoji: "🏠", label: "Home"     },
  { href: "/literacy",         emoji: "🔤", label: "Literacy" },
  { href: "/numeracy",         emoji: "🔢", label: "Numbers"  },
  { href: "/world",            emoji: "🌍", label: "World"    },
  { href: "/dashboard/parent", emoji: "👤", label: "Me"       },
];

const SCHOOL_NAV = [
  { href: "/home",                       emoji: "🏠", label: "Home"       },
  { href: "/dashboard/school",           emoji: "🏫", label: "School"     },
  { href: "/dashboard/school",           emoji: "📝", label: "Assign"     },
  { href: "/dashboard/school/analytics", emoji: "📊", label: "Analytics"  },
  { href: "/settings",                   emoji: "👤", label: "Me"         },
];

interface BottomNavProps {
  role?: UserRole;
}

export default function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const isSchoolAdmin = role === "school_admin";
  const items = isSchoolAdmin ? SCHOOL_NAV : PARENT_NAV;

  function isActive(href: string): boolean {
    if (href === "/home") return pathname === "/home";
    if (href === "/literacy") return pathname.startsWith("/phonics") || pathname.startsWith("/literacy");
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-amber-100 shadow-lg"
      aria-label="Main navigation"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch max-w-2xl mx-auto" style={{ height: 64 }}>
        {items.map((item, i) => {
          const active = isActive(item.href);
          return (
            <Link
              key={`${item.href}-${i}`}
              href={item.href}
              className="relative flex-1 flex flex-col items-center justify-center gap-0.5 transition"
              aria-current={active ? "page" : undefined}
              style={{ minHeight: 64 }}
            >
              {/* Filled pill behind active icon */}
              {active && (
                <motion.div
                  layoutId="bottom-nav-pill"
                  className="absolute inset-x-1 top-1.5 bottom-1.5 rounded-2xl bg-amber-100"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <span className={`relative z-10 text-xl leading-none transition-transform ${active ? "scale-110" : ""}`}>
                {item.emoji}
              </span>
              <span className={`relative z-10 text-[10px] font-bold leading-none transition-colors ${
                active
                  ? isSchoolAdmin ? "text-green-700" : "text-amber-700"
                  : "text-stone-400"
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
