"use client"

import { useAuth } from "@/hooks/useAuth"
import { SubjectPage } from "@/components/subjects/SubjectPage"
import { SPROUT_2_CURRICULUM, SPROUT_3_CURRICULUM } from "@/lib/content/curriculum"

export default function SeasonalPage() {
  const { child } = useAuth()
  const curriculum = child?.class === 'sprout_3' ? SPROUT_3_CURRICULUM : SPROUT_2_CURRICULUM

  return (
    <SubjectPage
      title="Seasonal Creativity"
      emoji="✨"
      description="Write stories and express yourself"
      headerGradient="from-teal-500 to-cyan-400"
      kokoEmoji="🦜✨"
      curriculum={curriculum}
      subject="seasonal_creativity"
      child={child}
    />
  )
}
