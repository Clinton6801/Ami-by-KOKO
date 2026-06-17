"use client"

import { useAuth } from "@/hooks/useAuth"
import { SubjectPage } from "@/components/subjects/SubjectPage"
import { SPROUT_2_CURRICULUM, SPROUT_3_CURRICULUM } from "@/lib/content/curriculum"

export default function ColoursShapesPage() {
  const { child } = useAuth()
  const curriculum = child?.class === 'sprout_3' ? SPROUT_3_CURRICULUM : SPROUT_2_CURRICULUM

  return (
    <SubjectPage
      title="Colours & Shapes"
      emoji="🎨"
      description="Explore colours, mixing, and patterns"
      headerGradient="from-rainbow-start via-rainbow-mid to-rainbow-end"
      kokoEmoji="🦜🎨"
      curriculum={curriculum}
      subject="colours_shapes"
      child={child}
    />
  )
}
