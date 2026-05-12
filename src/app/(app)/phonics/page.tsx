/**
 * Phonics language selector — child picks English or Yoruba.
 */
import Link from "next/link";
import { MVP_LANGUAGES } from "@/types";

const LANGUAGE_META: Record<string, { label: string; emoji: string; free: boolean }> = {
  english: { label: "English", emoji: "🇬🇧", free: true },
  yoruba: { label: "Yorùbá", emoji: "🇳🇬", free: false },
};

export default function PhonicsLanguagePage() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-8 px-4 py-12">
      <h1 className="text-3xl font-bold text-stone-800">
        Pick a Language
      </h1>
      <p className="text-stone-600">Which language do you want to learn today?</p>

      <div className="grid w-full max-w-sm gap-4">
        {MVP_LANGUAGES.map((lang) => {
          const meta = LANGUAGE_META[lang];
          return (
            <Link
              key={lang}
              href={`/phonics/${lang}`}
              className="focus-ring flex items-center justify-between rounded-3xl border-2 border-amber-200 bg-amber-50 p-5 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{meta.emoji}</span>
                <span className="text-xl font-semibold text-stone-800">
                  {meta.label}
                </span>
              </div>
              {meta.free ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Free
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  Premium
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
