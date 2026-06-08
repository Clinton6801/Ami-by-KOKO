"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for resend
  useEffect(() => {
    if (timeLeft <= 0) {
      setResendDisabled(false);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").replace(/\D/g, "");
    const newOtp = pastedText.split("").slice(0, 8);
    while (newOtp.length < 8) newOtp.push("");
    setOtp(newOtp as string[]);
    const filledCount = newOtp.filter((d) => d).length;
    inputRefs.current[Math.min(filledCount, 7)]?.focus();
  }

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 8) {
      setError("Please enter all 8 digits.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Just store the token and email - validation will happen on update-password
      sessionStorage.setItem("passwordResetToken", otpCode);
      sessionStorage.setItem("passwordResetEmail", email);
      
      // Navigate to update password page
      router.push("/auth/update-password");
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    // Simple UI reset for resend - actual email is sent by reset-password form
    setTimeLeft(60);
    setResendDisabled(true);
    setOtp(["", "", "", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-cream-bg px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-block text-6xl mb-6">🦜</div>
            <h1 className="text-3xl font-bold text-amber-500 mb-2">Enter your code</h1>
            <p className="text-stone-600 text-base leading-relaxed">
              We sent an 8-digit code to{" "}
              <strong className="block break-all mt-1">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerify} className="flex flex-col gap-8">
            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-2 flex-wrap">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-14 h-14 text-center text-2xl font-bold rounded-2xl border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    error
                      ? "border-red-400 bg-red-50"
                      : digit
                      ? "border-amber-500 bg-amber-50"
                      : "border-stone-200 bg-stone-50"
                  }`}
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600 text-center font-medium">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || otp.join("").length !== 8}
              className="rounded-2xl bg-amber-500 py-4 text-lg font-semibold text-white transition-all hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 min-h-14 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Continuing…
                </>
              ) : (
                "Continue"
              )}
            </button>
          </form>

          {/* Resend section */}
          <div className="mt-8 pt-8 border-t border-stone-200 text-center">
            {resendDisabled ? (
              <p className="text-sm text-stone-600 font-medium">
                Resend code in{" "}
                <span className="text-amber-600 font-bold">{timeLeft}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-sm font-semibold text-amber-600 hover:text-amber-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded px-3 py-2 transition"
              >
                Resend code
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex flex-col items-center justify-center bg-cream-bg px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg text-center">
            <p className="text-stone-600">Loading…</p>
          </div>
        </main>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
