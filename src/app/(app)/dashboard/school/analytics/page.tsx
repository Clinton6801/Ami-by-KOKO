"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSchoolAnalytics } from "@/hooks/useSchoolAnalytics";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import type { StudentStat } from "@/hooks/useSchoolAnalytics";

type SortKey = "name" | "lettersCount" | "numbersCount" | "worldCount" | "assignmentsCompleted" | "lastActive";

export default function SchoolAnalyticsPage() {
  const supabase = createClient();
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("lettersCount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from("profiles").select("school_id").eq("id", user.id).single();
      if (profile?.school_id) setSchoolId(profile.school_id);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { analytics, loading } = useSchoolAnalytics(schoolId);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sortedStudents = analytics
    ? [...analytics.studentStats].sort((a, b) => {
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      })
    : [];

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  if (loading || !analytics) {
    return (
      <div className="flex flex-col gap-4 pb-10">
        {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-3xl h-32 animate-pulse ring-1 ring-stone-100"/>)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <h1 className="text-2xl font-extrabold text-stone-800">📊 Analytics</h1>

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Students", value: analytics.totalStudents, icon: "👥", colour: "text-green-600" },
          { label: "Active this week", value: analytics.activeThisWeek, icon: "🔥", colour: "text-amber-500" },
          { label: "Avg letters", value: analytics.avgLettersMastered, icon: "⭐", colour: "text-violet-500" },
          { label: "Avg completion", value: `${analytics.avgAssignmentCompletion}%`, icon: "📝", colour: "text-rose-500" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-stone-100 flex flex-col items-center gap-1">
            <span className="text-2xl">{s.icon}</span>
            <span className={`text-2xl font-extrabold ${s.colour}`}>{s.value}</span>
            <span className="text-xs text-stone-500 text-center">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Letter mastery bar chart */}
      <div className="bg-white rounded-3xl p-5 shadow-sm ring-1 ring-stone-100">
        <p className="font-bold text-stone-700 mb-4">Letter Mastery (% of class)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={analytics.letterMastery} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="letter" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="pct" fill="#F59E0B" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-stone-400 mt-2">Letters below 50% may need extra attention in class</p>
      </div>

      {/* Weekly progress line chart */}
      <div className="bg-white rounded-3xl p-5 shadow-sm ring-1 ring-stone-100">
        <p className="font-bold text-stone-700 mb-4">Weekly Progress (avg letters mastered)</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={analytics.weeklyProgress} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="avg" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Student table */}
      <div className="bg-white rounded-3xl shadow-sm ring-1 ring-stone-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100">
          <p className="font-bold text-stone-700">Student Progress</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-xs text-stone-500 uppercase tracking-wide">
                {[
                  { key: "name" as SortKey, label: "Student" },
                  { key: "lettersCount" as SortKey, label: "Letters" },
                  { key: "numbersCount" as SortKey, label: "Numbers" },
                  { key: "worldCount" as SortKey, label: "World" },
                  { key: "assignmentsCompleted" as SortKey, label: "Assignments" },
                  { key: "lastActive" as SortKey, label: "Last Active" },
                ].map(col => (
                  <th key={col.key} onClick={() => toggleSort(col.key)}
                    className="px-4 py-2 text-left cursor-pointer hover:text-stone-700 select-none whitespace-nowrap">
                    {col.label}<SortIcon k={col.key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {sortedStudents.map(s => (
                <tr key={s.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 flex items-center gap-2">
                    <span className="text-xl">{s.avatar_url ?? "🧒🏾"}</span>
                    <span className="font-semibold text-stone-800">{s.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min((s.lettersCount / 26) * 100, 100)}%` }}/>
                      </div>
                      <span className="text-stone-600">{s.lettersCount}/26</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{s.numbersCount}/10</td>
                  <td className="px-4 py-3 text-stone-600">{s.worldCount}/24</td>
                  <td className="px-4 py-3 text-stone-600">{s.assignmentsCompleted}</td>
                  <td className="px-4 py-3 text-stone-400 text-xs">
                    {s.lastActive ? new Date(s.lastActive).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment report */}
      <div className="bg-white rounded-3xl shadow-sm ring-1 ring-stone-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100">
          <p className="font-bold text-stone-700">Assignment Report</p>
        </div>
        {analytics.assignments.length === 0 ? (
          <p className="px-4 py-6 text-stone-400 text-sm text-center">No assignments yet.</p>
        ) : (
          <div className="divide-y divide-stone-50">
            {analytics.assignments.map(a => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-800 text-sm truncate">{a.title}</p>
                  <p className="text-xs text-stone-400">{a.subject} · {a.class} · Term {a.term}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full" style={{ width: `${a.completionRate}%` }}/>
                  </div>
                  <span className="text-xs font-bold text-stone-600">{a.completionRate}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
