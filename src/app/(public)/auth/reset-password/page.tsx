"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-amber-50 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg">
        {sent ? (
          <div className="text-center flex flex-col items-center gap-4">
            <div className="text-5xl">📬</div>
            <h1 className="text-2xl font-bold text-amber-500">Check your email</h1>
            <p className="text-stone-600 text-sm leading-relaxed">
              We sent a password reset link to <strong>{email}</strong>.
              Click it to set a new password.
            </p>
            <a href="/auth/login"
              className="text-amber-600 font-semibold text-sm hover:underline">
              Back to sign in →
            </a>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🔑</div>
              <h1 className="text-2xl font-bold text-amber-500">Forgot password?</h1>
              <p className="text-stone-500 text-sm mt-1">
                Enter your email and we&apos;ll send a reset link.
              </p>
            </div>

            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-stone-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  placeholder="parent@example.com"
                />
              </div>

              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

              <button type="submit" disabled={loading}
                className="rounded-2xl bg-amber-500 py-4 text-lg font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60">
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-stone-500">
              Remember it?{" "}
              <a href="/auth/login" className="font-medium text-amber-600 hover:underline">
                Sign in
              </a>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
