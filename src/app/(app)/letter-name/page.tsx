"use client"

import { useAuth } from "@/hooks/useAuth"
import { SubjectPage } from "@/components/subjects/SubjectPage"
import { SPROUT_2_CURRICULUM, SPROUT_3_CURRICULUM } from "@/lib/content/curriculum"

export default function LetterNamePage() {
  const { child } = useAuth()
  const curriculum = child?.class === 'sprout_3' ? SPROUT_3_CURRICULUM : SPROUT_2_CURRICULUM

  return (
    <SubjectPage
      title="Letter Names & Spelling"
      emoji="📝"
      description="Learn to spell words correctly"
      headerGradient="from-blue-500 to-cyan-400"
      kokoEmoji="🦜📝"
      curriculum={curriculum}
      subject="letter_name"
      child={child}
    />
  )
}
