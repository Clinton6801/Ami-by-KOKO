/**
 * Settings page — account, child profiles, language subscriptions.
 */
export default function SettingsPage() {
  return (
    <main className="flex min-h-screen flex-col gap-6 px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-800">Settings</h1>

      <section aria-labelledby="account-heading">
        <h2 id="account-heading" className="mb-3 text-xl font-semibold text-stone-700">
          Account
        </h2>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-stone-500">Account settings coming soon.</p>
        </div>
      </section>

      <section aria-labelledby="children-heading">
        <h2 id="children-heading" className="mb-3 text-xl font-semibold text-stone-700">
          Child Profiles
        </h2>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-stone-500">Add and manage child profiles here.</p>
        </div>
      </section>

      <section aria-labelledby="languages-heading">
        <h2 id="languages-heading" className="mb-3 text-xl font-semibold text-stone-700">
          Language Packs
        </h2>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-stone-500">
            Unlock Yorùbá, Igbo, and Hausa via subscription.
          </p>
        </div>
      </section>
    </main>
  );
}
