/**
 * Email confirmation holding page.
 * Shown after signup when Supabase requires email verification.
 */
export default function ConfirmPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream-bg px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg text-center">
        <div className="text-6xl mb-4">📬</div>
        <h1 className="text-2xl font-bold text-amber-500 mb-2">
          Check your email!
        </h1>
        <p className="text-stone-600 mb-6">
          We sent a confirmation link to your email address. Click it to
          activate your account, then come back to sign in.
        </p>
        <a
          href="/auth/login"
          className="inline-block rounded-2xl bg-amber-500 px-8 py-3 font-semibold text-white transition hover:bg-amber-600"
        >
          Go to Sign In
        </a>
      </div>
    </main>
  );
}
