"use client"

import { useAuth } from "@/hooks/useAuth"
import { SubjectPage } from "@/components/subjects/SubjectPage"
import { SPROUT_2_CURRICULUM, SPROUT_3_CURRICULUM } from "@/lib/content/curriculum"

export default function PracticalLifePage() {
  const { child } = useAuth()
  const curriculum = child?.class === 'sprout_3' ? SPROUT_3_CURRICULUM : SPROUT_2_CURRICULUM

  return (
    <SubjectPage
      title="Practical Life"
      emoji="🏠"
      description="Learn life skills and responsibility"
      headerGradient="from-amber-700 to-amber-600"
      kokoEmoji="🦜🏠"
      curriculum={curriculum}
      subject="practical_life"
      child={child}
    />
  )
}
