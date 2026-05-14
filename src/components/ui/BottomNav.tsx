"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/home",     emoji: "🏠", label: "Home"     },
  { href: "/literacy", emoji: "🔤", label: "Literacy"  },
  { href: "/numeracy", emoji: "🔢", label: "Numbers"   },
  { href: "/world",    emoji: "🌍", label: "My World"  },
  { href: "/settings", emoji: "👤", label: "Me"        },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-100 shadow-lg"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch max-w-2xl mx-auto">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition ${
                active ? "text-amber-600" : "text-stone-400 hover:text-stone-600"
              }`}
              aria-current={active ? "page" : undefined}
              style={{ minHeight: 56 }}
            >
              <span className={`text-xl leading-none transition-transform ${active ? "scale-110" : ""}`}>
                {item.emoji}
              </span>
              <span className={`text-[10px] font-semibold leading-none ${active ? "text-amber-600" : ""}`}>
                {item.label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-amber-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
