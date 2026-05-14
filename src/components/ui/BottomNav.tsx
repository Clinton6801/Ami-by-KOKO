"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/types";

const PARENT_NAV = [
  { href: "/home",            emoji: "🏠", label: "Home"      },
  { href: "/literacy",        emoji: "🔤", label: "Literacy"  },
  { href: "/numeracy",        emoji: "🔢", label: "Numbers"   },
  { href: "/world",           emoji: "🌍", label: "My World"  },
  { href: "/dashboard/parent",emoji: "👤", label: "Me"        },
];

const SCHOOL_NAV = [
  { href: "/home",              emoji: "🏠", label: "Home"       },
  { href: "/dashboard/school",  emoji: "🏫", label: "School"     },
  { href: "/dashboard/school",  emoji: "📝", label: "Assign",    tab: "assignments" },
  { href: "/dashboard/school",  emoji: "📊", label: "Reports",   tab: "reports"     },
  { href: "/settings",          emoji: "👤", label: "Me"         },
];

interface BottomNavProps {
  role?: UserRole;
}

export default function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const isSchoolAdmin = role === "school_admin";
  const items = isSchoolAdmin ? SCHOOL_NAV : PARENT_NAV;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-100 shadow-lg"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch max-w-2xl mx-auto">
        {items.map((item, i) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          // For school admin, highlight School tab when on dashboard/school
          const schoolActive = isSchoolAdmin && pathname.startsWith("/dashboard/school");

          return (
            <Link
              key={`${item.href}-${i}`}
              href={item.href}
              className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition ${
                active || (schoolActive && item.href === "/dashboard/school")
                  ? "text-green-600"
                  : "text-stone-400 hover:text-stone-600"
              }`}
              aria-current={active ? "page" : undefined}
              style={{ minHeight: 56 }}
            >
              <span className={`text-xl leading-none transition-transform ${
                active || (schoolActive && item.href === "/dashboard/school") ? "scale-110" : ""
              }`}>
                {item.emoji}
              </span>
              <span className={`text-[10px] font-semibold leading-none ${
                active || (schoolActive && item.href === "/dashboard/school")
                  ? isSchoolAdmin ? "text-green-600" : "text-amber-600"
                  : ""
              }`}>
                {item.label}
              </span>
              {(active || (schoolActive && item.href === "/dashboard/school")) && (
                <span className={`absolute bottom-0 w-8 h-0.5 rounded-full ${
                  isSchoolAdmin ? "bg-green-500" : "bg-amber-500"
                }`} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
