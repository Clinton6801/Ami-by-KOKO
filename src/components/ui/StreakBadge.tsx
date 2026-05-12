"use client";

/**
 * StreakBadge — displays the child's daily learning streak.
 */
interface StreakBadgeProps {
  days: number;
}

export default function StreakBadge({ days }: StreakBadgeProps) {
  return (
    <div
      className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2"
      aria-label={`${days} day streak`}
    >
      <span className="text-xl" aria-hidden>🔥</span>
      <span className="font-bold text-amber-700">{days}</span>
      <span className="text-sm text-amber-600">
        {days === 1 ? "day" : "days"}
      </span>
    </div>
  );
}
