"use client"

import { useAuth } from "@/hooks/useAuth"
import { SubjectPage } from "@/components/subjects/SubjectPage"
import { SPROUT_2_CURRICULUM, SPROUT_3_CURRICULUM } from "@/lib/content/curriculum"

export default function HealthPage() {
  const { child } = useAuth()
  const curriculum = child?.class === 'sprout_3' ? SPROUT_3_CURRICULUM : SPROUT_2_CURRICULUM

  return (
    <SubjectPage
      title="Health Habits"
      emoji="💪"
      description="Learn healthy habits and personal care"
      headerGradient="from-rose-500 to-pink-400"
      kokoEmoji="🦜❤️"
      curriculum={curriculum}
      subject="health_habits"
      child={child}
    />
  )
}
