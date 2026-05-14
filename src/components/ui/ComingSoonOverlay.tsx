"use client";

/**
 * ComingSoonOverlay — wraps any card to show a locked/coming soon state.
 * Used on Sprout 2, 3, Stepping Stone class cards.
 */
interface ComingSoonOverlayProps {
  children: React.ReactNode;
  label?: string;
}

export default function ComingSoonOverlay({
  children,
  label = "Coming Soon",
}: ComingSoonOverlayProps) {
  return (
    <div className="relative">
      <div className="opacity-40 pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-stone-900/10">
        <span className="bg-stone-800 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
          🔒 {label}
        </span>
      </div>
    </div>
  );
}
