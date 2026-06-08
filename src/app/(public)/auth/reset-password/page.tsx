"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequestOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (error) {
      console.error("Sign in with OTP error:", error);
      if (error.status === 500) {
        setError("Unable to send code right now. Please try again.");
      } else if (error.status === 422 || error.status === 400) {
        setError("No account found with this email address.");
      } else if (error.status === 429) {
        setError("Too many requests. Please wait a few minutes.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
      return;
    }

    // Navigate to verify OTP page with email as query param
    router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-cream-bg px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🦜</div>
          <h1 className="text-2xl font-bold text-amber-500">Forgot your password?</h1>
          <p className="text-stone-600 text-sm mt-2">
            Enter your email and we&apos;ll send you an 8-digit code
          </p>
        </div>

        <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-stone-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              placeholder="parent@example.com"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-amber-500 py-4 text-lg font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending…
              </>
            ) : (
              "Send Code"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          <a href="/auth/login" className="font-medium text-amber-600 hover:underline">
            Back to login
          </a>
        </p>
      </div>
    </main>
  );
}
