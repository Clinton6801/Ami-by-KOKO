"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
      <line x1="2" x2="22" y1="2" y2="22"/>
    </svg>
  );
}

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const match = password === confirm;

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!match) { setError("Passwords do not match."); return; }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); return; }

    setDone(true);
    setTimeout(() => { window.location.href = "/home"; }, 2000);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-amber-50 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg">
        {done ? (
          <div className="text-center flex flex-col items-center gap-4">
            <div className="text-5xl">✅</div>
            <h1 className="text-2xl font-bold text-green-600">Password updated!</h1>
            <p className="text-stone-500 text-sm">Taking you home…</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🔒</div>
              <h1 className="text-2xl font-bold text-amber-500">Set new password</h1>
            </div>

            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              {["New password", "Confirm password"].map((label, i) => {
                const val = i === 0 ? password : confirm;
                const set = i === 0 ? setPassword : setConfirm;
                return (
                  <div key={label}>
                    <label className="mb-1 block text-sm font-medium text-stone-700">{label}</label>
                    <div className="relative">
                      <input type={showPw ? "text" : "password"} required minLength={8}
                        value={val} onChange={e => set(e.target.value)}
                        className={`w-full rounded-xl border px-4 py-3 pr-12 text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                          i === 1 && confirm.length > 0
                            ? match ? "border-green-400" : "border-red-400"
                            : "border-stone-200"
                        }`}
                        placeholder="At least 8 characters"/>
                      {i === 0 && (
                        <button type="button" onClick={() => setShowPw(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1">
                          <EyeIcon open={showPw}/>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

              <button type="submit" disabled={loading || !match}
                className="rounded-2xl bg-amber-500 py-4 text-lg font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60">
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
