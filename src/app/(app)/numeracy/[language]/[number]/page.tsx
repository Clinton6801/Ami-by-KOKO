/**
 * Number detail page — server component wrapper.
 * Redirects to numeracy grid if number is locked and user has no paid access.
 */
import { notFound, redirect } from "next/navigation";
import { getAccessContext } from "@/lib/supabase/getAccessContext";
import { isNumberFree } from "@/lib/access";
import NumberDetailContent from "./_content";

interface Props { params: Promise<{ language: string; number: string }> }

export default async function NumberDetailPage({ params }: Props) {
  const { language, number } = await params;
  if (language !== "english") notFound();

  if (!isNumberFree(number)) {
    const { hasPaid } = await getAccessContext();
    if (!hasPaid) redirect(`/numeracy/${language}`);
  }

  return <NumberDetailContent language={language} number={number} />;
}
