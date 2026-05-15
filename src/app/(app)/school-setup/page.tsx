"use client";

/**
 * School setup page — for school admins who signed up but have no school linked.
 * Shown automatically when a school_admin visits /dashboard/school with no school_id.
 *
 * School creation goes through /api/school/create (service role) to avoid RLS
 * chicken-and-egg: the user has no school_id yet, so client-side insert would fail.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SchoolSetupPage() {
  const router = useRouter();
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSetup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!schoolName.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/school/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: schoolName.trim() }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

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
