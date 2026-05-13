"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Child } from "@/types";

export default function SchoolDashboardPage() {
  const supabase = createClient();
  const [pupils, setPupils] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from("profiles").select("school_id").eq("id", user.id).single();

      if (!profile?.school_id) { setLoading(false); return; }
      setSchoolId(profile.school_id);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("children").select("*").eq("school_id", profile.school_id)
        .order("name", { ascending: true });

      setPupils((data ?? []) as Child[]);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exportCSV() {
    const rows = [
      ["Name", "Age", "Created"],
      ...pupils.map(p => [p.name, p.age ?? "", new Date(p.created_at).toLocaleDateString()]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "pupils.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-stone-800">School Dashboard</h1>
        {pupils.length > 0 && (
          <button onClick={exportCSV}
            className="text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-xl transition border border-green-200">
            ⬇ Export CSV
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-stone-100 text-center">
          <p className="text-3xl font-extrabold text-amber-500">{pupils.length}</p>
          <p className="text-xs text-stone-500 mt-1">Total pupils</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-stone-100 text-center">
          <p className="text-3xl font-extrabold text-green-500">
            {schoolId ? "Active" : "—"}
          </p>
          <p className="text-xs text-stone-500 mt-1">School status</p>
        </div>
      </div>

      {/* Pupil list */}
      <div className="bg-white rounded-3xl shadow-sm ring-1 ring-stone-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
          <p className="font-bold text-stone-700 text-sm">Pupils</p>
          <span className="text-xs text-stone-400">{pupils.length} enrolled</span>
        </div>

        {loading ? (
          <div className="p-6 text-center text-stone-400 text-sm">Loading…</div>
        ) : pupils.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-stone-500 text-sm">No pupils enrolled yet.</p>
            <p className="text-stone-400 text-xs mt-1">
              Pupils are added when parents sign up with your school code.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {pupils.map(pupil => (
              <div key={pupil.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-2xl">{pupil.avatar_url ?? "🧒🏾"}</span>
                <div className="flex-1">
                  <p className="font-semibold text-stone-800 text-sm">{pupil.name}</p>
                  {pupil.age && <p className="text-xs text-stone-400">Age {pupil.age}</p>}
                </div>
                <span className="text-xs text-stone-400">
                  {new Date(pupil.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
