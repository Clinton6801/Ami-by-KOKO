"use client"

import { useAuth } from "@/hooks/useAuth"
import { SubjectPage } from "@/components/subjects/SubjectPage"
import { SPROUT_2_CURRICULUM, SPROUT_3_CURRICULUM } from "@/lib/content/curriculum"

export default function SocialPage() {
  const { child } = useAuth()
  const curriculum = child?.class === 'sprout_3' ? SPROUT_3_CURRICULUM : SPROUT_2_CURRICULUM

  return (
    <SubjectPage
      title="Social Habits"
      emoji="👫"
      description="Learn how to be a good friend"
      headerGradient="from-purple-500 to-indigo-400"
      kokoEmoji="🦜🤝"
      curriculum={curriculum}
      subject="social_habits"
      child={child}
    />
  )
}
