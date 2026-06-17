"use client"

import { useAuth } from "@/hooks/useAuth"
import { SubjectPage } from "@/components/subjects/SubjectPage"
import { SPROUT_2_CURRICULUM, SPROUT_3_CURRICULUM } from "@/lib/content/curriculum"

export default function MusicArtsPage() {
  const { child } = useAuth()
  const curriculum = child?.class === 'sprout_3' ? SPROUT_3_CURRICULUM : SPROUT_2_CURRICULUM

  return (
    <SubjectPage
      title="Music & Arts"
      emoji="🎭"
      description="Create rhythms, draw, and paint"
      headerGradient="from-pink-500 to-rose-400"
      kokoEmoji="🦜🎵"
      curriculum={curriculum}
      subject="music_arts"
      child={child}
    />
  )
}
