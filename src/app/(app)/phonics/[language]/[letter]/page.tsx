/**
 * Letter detail page — server component.
 * Redirects to the phonics grid if the letter is locked and user has no paid access.
 */
import { notFound, redirect } from "next/navigation";
import { MVP_LANGUAGES, type Language } from "@/types";
import { LETTER_DATA } from "@/lib/audio/clips";
import LetterDetail from "@/components/phonics/LetterDetail";
import { getAccessContext } from "@/lib/supabase/getAccessContext";
import { isLetterFree } from "@/lib/access-utils";

interface Props {
  params: Promise<{ language: string; letter: string }>;
}

export default async function LetterPage({ params }: Props) {
  const { language, letter } = await params;

  if (!MVP_LANGUAGES.includes(language as Language)) notFound();

  const upperLetter = letter.toUpperCase();
  const letterData = LETTER_DATA[upperLetter];
  if (!letterData) notFound();

  // Gate: locked letters redirect to the grid
  if (!isLetterFree(upperLetter)) {
    const { hasPaid } = await getAccessContext();
    if (!hasPaid) {
      redirect(`/phonics/${language}`);
    }
  }

  return (
    <LetterDetail
      letter={upperLetter}
      language={language as Language}
      letterData={letterData}
    />
  );
}
