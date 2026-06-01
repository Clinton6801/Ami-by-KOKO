"use client";

/**
 * LanguagePicker — reusable language selector component.
 */
import type { Language } from "@/types";

const LANGUAGE_LABELS: Record<Language, string> = {
  english: "English",
  yoruba: "Yorùbá",
  igbo: "Igbo",
  hausa: "Hausa",
  french: "Français",
};

interface LanguagePickerProps {
  available: Language[];
  selected: Language;
  onChange: (lang: Language) => void;
}

export default function LanguagePicker({
  available,
  selected,
  onChange,
}: LanguagePickerProps) {
  return (
    <div role="group" aria-label="Language selection" className="flex gap-2 flex-wrap">
      {available.map((lang) => (
        <button
          key={lang}
          onClick={() => onChange(lang)}
          aria-pressed={selected === lang}
          className={`
            focus-ring rounded-full px-4 py-2 text-sm font-medium transition
            ${selected === lang
              ? "bg-amber-500 text-white"
              : "bg-stone-100 text-stone-600 hover:bg-amber-100"
            }
          `}
        >
          {LANGUAGE_LABELS[lang]}
        </button>
      ))}
    </div>
  );
}
