"use client"

import { useAuth } from "@/hooks/useAuth"
import { SubjectPage } from "@/components/subjects/SubjectPage"
import { SPROUT_2_CURRICULUM, SPROUT_3_CURRICULUM } from "@/lib/content/curriculum"

export default function SciencePage() {
  const { child } = useAuth()
  const curriculum = child?.class === 'sprout_3' ? SPROUT_3_CURRICULUM : SPROUT_2_CURRICULUM

  return (
    <SubjectPage
      title="Science"
      emoji="🌿"
      description="Explore plants, soil, and living things"
      headerGradient="from-green-500 to-emerald-400"
      kokoEmoji="🦜🔬"
      curriculum={curriculum}
      subject="science"
      child={child}
    />
  )
}
