"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState(false);

  // Load token from sessionStorage on mount
  useEffect(() => {
    const token = sessionStorage.getItem("passwordResetToken");
    const email = sessionStorage.getItem("passwordResetEmail");
    
    if (!token || !email) {
      router.push("/auth/reset-password");
      return;
    }
    
    setResetToken(token);
    setResetEmail(email);
    setTokenReady(true);
  }, [router]);

  const match = password === confirm;
  const passwordValid = password.length >= 8;

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!match) {
      setError("Passwords do not match.");
      return;
    }
    
    if (!passwordValid) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Verify the OTP token with recovery type
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: resetEmail!,
        token: resetToken!,
        type: "recovery",
      });

      if (verifyError) {
        console.error("Verify error:", verifyError);
        setError("Code expired or invalid. Please request a new code.");
        setLoading(false);
        return;
      }

      // Step 2: Wait for session to be established
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (updateError) {
        console.error("Update error:", updateError);
        
        // Check if error is about same password
        if (updateError.message && updateError.message.toLowerCase().includes("same password")) {
          console.warn("User attempted to use the same password as their current password");
          setError("Please choose a different password than your current one.");
          setLoading(false);
          return;
        }
        
        // Try again in case session wasn't ready
        const { error: retryError } = await supabase.auth.updateUser({
          password: password,
        });
        if (retryError) {
          // Check again for same password error on retry
          if (retryError.message && retryError.message.toLowerCase().includes("same password")) {
            console.warn("User attempted to use the same password as their current password (retry)");
            setError("Please choose a different password than your current one.");
            setLoading(false);
            return;
          }
          
          setError("Failed to update password. Please try again.");
          setLoading(false);
          return;
        }
      }

      // Success - clear stored token and show success
      sessionStorage.removeItem("passwordResetToken");
      sessionStorage.removeItem("passwordResetEmail");

      setDone(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  // Don't render until token is loaded
  if (!tokenReady) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-cream-bg px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg text-center">
          <p className="text-stone-600">Loading…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-cream-bg px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white p-8 shadow-lg">
          {done ? (
            <div className="text-center flex flex-col items-center gap-4">
              <div className="text-6xl mb-4">🦜</div>
              <div className="text-5xl mb-2">✅</div>
              <h1 className="text-2xl font-bold text-green-600">Password updated!</h1>
              <p className="text-stone-500 text-base">Redirecting to login…</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <div className="text-6xl mb-6">🦜</div>
                <h1 className="text-3xl font-bold text-amber-500 mb-2">Create new password</h1>
              </div>

              <form onSubmit={handleUpdate} className="flex flex-col gap-6">
                {["New password", "Confirm password"].map((label, i) => {
                  const val = i === 0 ? password : confirm;
                  const set = i === 0 ? setPassword : setConfirm;
                  const isFilled = val.length > 0;
                  const isConfirmField = i === 1;
                  const showMatch = isConfirmField && isFilled;
                  
                  return (
                    <div key={label}>
                      <label className="mb-1 block text-sm font-medium text-stone-700">
                        {label}
                      </label>
                      <div className="relative">
                        <input
                          type={showPw ? "text" : "password"}
                          required
                          minLength={8}
                          value={val}
                          onChange={(e) => set(e.target.value)}
                          className={`w-full rounded-xl border px-4 py-3 pr-12 text-stone-900 placeholder-stone-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-colors ${
                            showMatch
                              ? match
                                ? "border-green-400 bg-green-50"
                                : "border-red-400 bg-red-50"
                              : "border-stone-200"
                          }`}
                          placeholder="At least 8 characters"
                        />
                        {showMatch && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
                            {match ? "✅" : "❌"}
                          </div>
                        )}
                        {i === 0 && (
                          <button
                            type="button"
                            onClick={() => setShowPw((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
                            aria-label={showPw ? "Hide password" : "Show password"}
                          >
                            <EyeIcon open={showPw} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {error && (
                  <p role="alert" className="text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !match || !passwordValid}
                  className="rounded-2xl bg-amber-500 py-4 text-lg font-semibold text-white transition-all hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 min-h-14 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating…
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
