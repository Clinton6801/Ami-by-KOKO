/**
 * Parent Dashboard — child progress, streaks, session time,
 * and subscription management.
 */
export default function ParentDashboardPage() {
  return (
    <main className="flex min-h-screen flex-col gap-6 px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-800">Parent Dashboard</h1>

      {/* Progress section placeholder */}
      <section aria-labelledby="progress-heading">
        <h2 id="progress-heading" className="mb-3 text-xl font-semibold text-stone-700">
          Child Progress
        </h2>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-stone-500">
            Select a child profile to view their letter progress.
          </p>
        </div>
      </section>

      {/* Streak section placeholder */}
      <section aria-labelledby="streak-heading">
        <h2 id="streak-heading" className="mb-3 text-xl font-semibold text-stone-700">
          Daily Streak
        </h2>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-stone-500">Streak data will appear here.</p>
        </div>
      </section>

      {/* Subscription section placeholder */}
      <section aria-labelledby="subscription-heading">
        <h2 id="subscription-heading" className="mb-3 text-xl font-semibold text-stone-700">
          Subscription
        </h2>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-stone-500">
            Free plan — English phonics included.{" "}
            <a href="/settings" className="font-medium text-amber-600 hover:underline">
              Upgrade to unlock Yorùbá →
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
