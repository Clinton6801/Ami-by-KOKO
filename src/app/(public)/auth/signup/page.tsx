"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    // Eye open
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    // Eye closed
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export default function SignupPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (signUpError) {
      setError(`${signUpError.message} (status: ${signUpError.status})`);
      setLoading(false);
      return;
    }

    // Trigger handle_new_user() creates the profile row automatically.
    // No manual insert needed here.

    // If email confirmation is required, data.session will be null.
    if (!data.session) {
      setLoading(false);
      window.location.href = "/auth/confirm";
      return;
    }

    window.location.href = "/home";
  }

  const passwordsTyped = password.length > 0 && confirmPassword.length > 0;
  const passwordMatch = password === confirmPassword;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-amber-50 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-amber-500">
          Join Àmì by Kòkò
        </h1>
        <p className="mb-6 text-center text-sm text-stone-500">
          Free to start — English phonics included
        </p>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          {/* Full name */}
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-stone-700">
              Your name
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              placeholder="Ngozi Adeyemi"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-stone-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              placeholder="parent@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-stone-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-4 py-3 pr-12 text-stone-900 placeholder-stone-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-md p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-stone-700">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 pr-12 text-stone-900 placeholder-stone-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  passwordsTyped
                    ? passwordMatch
                      ? "border-green-400"
                      : "border-red-400"
                    : "border-stone-200"
                }`}
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-md p-1"
                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {/* Inline match feedback */}
            {passwordsTyped && (
              <p className={`mt-1 text-xs ${passwordMatch ? "text-green-600" : "text-red-500"}`}>
                {passwordMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || (passwordsTyped && !passwordMatch)}
            className="mt-2 rounded-2xl bg-amber-500 py-4 text-lg font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {loading ? "Creating account…" : "Create Free Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <a href="/auth/login" className="font-medium text-amber-600 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}
