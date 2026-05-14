/**
 * Numeracy mode — language selector.
 * Mirrors /phonics/page.tsx structure.
 */
import Link from "next/link";

export default function NumeracyPage() {
  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-stone-800">Numbers & Shapes</h1>
        <p className="text-stone-500 text-sm mt-1">Pick a language to start counting!</p>
      </div>
      <div className="flex flex-col gap-3 max-w-sm mx-auto w-full">
        <Link href="/numeracy/english"
          className="flex items-center justify-between bg-white rounded-3xl p-5 shadow-md ring-1 ring-violet-100 transition hover:scale-[1.02] active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🇬🇧</span>
            <div>
              <p className="font-bold text-stone-800">English</p>
              <p className="text-xs text-stone-500">Numbers 1–10</p>
            </div>
          </div>
          <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">Free</span>
        </Link>
      </div>
    </div>
  );
}
