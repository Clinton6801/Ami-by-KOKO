"use client"

import { useAuth } from "@/hooks/useAuth"
import { SubjectPage } from "@/components/subjects/SubjectPage"
import { SPROUT_2_CURRICULUM, SPROUT_3_CURRICULUM } from "@/lib/content/curriculum"

export default function ZoologyPage() {
  const { child } = useAuth()
  const curriculum = child?.class === 'sprout_3' ? SPROUT_3_CURRICULUM : SPROUT_2_CURRICULUM

  return (
    <SubjectPage
      title="Zoology & Botany"
      emoji="🦁"
      description="Discover animals and plants"
      headerGradient="from-amber-500 to-orange-400"
      kokoEmoji="🦜🐾"
      curriculum={curriculum}
      subject="zoology_botany"
      child={child}
    />
  )
}
