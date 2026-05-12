/**
 * School Admin Panel — manage pupils, view class progress, export CSV.
 */
export default function SchoolDashboardPage() {
  return (
    <main className="flex min-h-screen flex-col gap-6 px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-800">School Dashboard</h1>

      <section aria-labelledby="pupils-heading">
        <h2 id="pupils-heading" className="mb-3 text-xl font-semibold text-stone-700">
          Pupils
        </h2>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-stone-500">Pupil management coming soon.</p>
        </div>
      </section>

      <section aria-labelledby="reports-heading">
        <h2 id="reports-heading" className="mb-3 text-xl font-semibold text-stone-700">
          Class Progress Reports
        </h2>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-stone-500">Progress reports coming soon.</p>
          <button
            disabled
            className="mt-4 rounded-xl bg-stone-100 px-4 py-2 text-sm text-stone-400"
          >
            Export CSV (coming soon)
          </button>
        </div>
      </section>
    </main>
  );
}
