"use client";

/**
 * ChallengeCard — shows the weekly challenge + class leaderboard on student home screen.
 */
import { motion } from "framer-motion";
import type { Challenge, ChallengeProgress, LeaderboardEntry } from "@/hooks/useChallenges";

interface ChallengeCardProps {
  challenge: Challenge | null;
  myProgress: ChallengeProgress | null;
  leaderboard: LeaderboardEntry[];
  childId: string | null;
  loading: boolean;
}

const METRIC_LABELS: Record<string, string> = {
  letters_mastered: "letters mastered",
  assignments_complete: "assignments completed",
  sessions: "learning sessions",
};

const RANK_EMOJIS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

export default function ChallengeCard({ challenge, myProgress, leaderboard, childId, loading }: ChallengeCardProps) {
  if (loading) {
    return <div className="bg-white rounded-3xl h-32 animate-pulse ring-1 ring-stone-100"/>;
  }

  if (!challenge) return null;

  const current = myProgress?.current_count ?? 0;
  const target = challenge.target_count;
  const pct = Math.min(Math.round((current / target) * 100), 100);
  const completed = myProgress?.completed ?? false;

  return (
    <div className="flex flex-col gap-4">
      {/* Weekly challenge */}
      <div className={`bg-white rounded-3xl p-4 shadow-sm ring-1 ${completed ? "ring-green-300" : "ring-amber-200"}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{completed ? "🏆" : "🎯"}</span>
          <div className="flex-1">
            <p className="font-bold text-stone-800 text-sm">{challenge.title}</p>
            <p className="text-xs text-stone-500">
              {current}/{target} {METRIC_LABELS[challenge.metric] ?? challenge.metric}
            </p>
          </div>
          {completed && (
            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">Done ✅</span>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${completed ? "bg-green-400" : "bg-amber-400"}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <p className="text-xs text-stone-400 mt-1 text-right">{pct}%</p>
      </div>

      {/* Class leaderboard */}
      {leaderboard.length > 0 && (
        <div className="bg-white rounded-3xl p-4 shadow-sm ring-1 ring-stone-100">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-3">🏆 Class Leaderboard</p>
          <div className="flex flex-col gap-2">
            {leaderboard.map((entry, i) => {
              const isMe = entry.child_id === childId;
              return (
                <div key={entry.child_id}
                  className={`flex items-center gap-3 p-2 rounded-2xl transition ${isMe ? "bg-amber-50 ring-1 ring-amber-200" : ""}`}>
                  <span className="text-lg w-6 text-center">{RANK_EMOJIS[i]}</span>
                  <span className="text-xl">{entry.avatar_url ?? "🧒🏾"}</span>
                  <span className={`flex-1 text-sm font-semibold ${isMe ? "text-amber-700" : "text-stone-700"}`}>
                    {entry.name}{isMe ? " (you)" : ""}
                  </span>
                  <span className="text-sm font-extrabold text-amber-500">{entry.score}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
