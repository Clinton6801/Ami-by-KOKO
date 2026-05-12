/**
 * Letter detail page — shows the letter, word associations,
 * illustration, and triggers Kòkò audio on tap.
 */
import { notFound } from "next/navigation";
import { MVP_LANGUAGES, type Language } from "@/types";
import { LETTER_DATA } from "@/lib/audio/clips";
import LetterDetail from "@/components/phonics/LetterDetail";
import type { LetterConfig } from "@/types";

interface Props {
  params: Promise<{ language: string; letter: string }>;
}

export default async function LetterPage({ params }: Props) {
  const { language, letter } = await params;

  if (!MVP_LANGUAGES.includes(language as Language)) {
    notFound();
  }

  const upperLetter = letter.toUpperCase();
  const letterData = LETTER_DATA[upperLetter];

  if (!letterData) {
    notFound();
  }

  return (
    <LetterDetail
      letter={upperLetter}
      language={language as Language}
      letterData={letterData}
    />
  );
}
