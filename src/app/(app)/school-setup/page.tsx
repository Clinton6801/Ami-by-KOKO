"use client";

/**
 * School setup page — for school admins who signed up but have no school linked.
 * Shown automatically when a school_admin visits /dashboard/school with no school_id.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SchoolSetupPage() {
  const supabase = createClient();
  const router = useRouter();
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSetup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!schoolName.trim()) return;
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not logged in."); setLoading(false); return; }

    // Create school
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: school, error: schoolErr } = await (supabase as any)
      .from("schools")
      .insert({ name: schoolName.trim(), subscription_active: false })
      .select("id, school_code")
      .single();

    if (schoolErr) { setError(schoolErr.message); setLoading(false); return; }

    // Link profile to school
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("profiles")
      .update({ school_id: school.id, role: "school_admin" })
      .eq("id", user.id);

    router.push("/dashboard/school");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🏫</div>
          <h1 className="text-2xl font-extrabold text-stone-800">Set up your school</h1>
          <p className="text-stone-500 text-sm mt-1">
            Enter your school name to get started. You&apos;ll get a unique school code to share with students.
          </p>
        </div>

        <form onSubmit={handleSetup} className="flex flex-col gap-4">
          <div>
            <label htmlFor="schoolName" className="text-sm font-semibold text-stone-700 mb-1 block">
              School name
            </label>
            <input
              id="schoolName"
              type="text"
              required
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
              placeholder="e.g. Sunshine Academy"
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || !schoolName.trim()}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold text-lg py-4 rounded-2xl transition shadow-md"
          >
            {loading ? "Setting up…" : "Create School →"}
          </button>
        </form>
      </div>
    </div>
  );
}
