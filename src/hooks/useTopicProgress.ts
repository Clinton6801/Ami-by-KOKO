"use client"

import { useState, useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export interface TopicProgressRecord {
  id: string
  child_id: string
  topic_id: string
  subject: string
  class: string
  term: number
  completed: boolean
  completed_at: string | null
}

export function useTopicProgress(childId: string | null) {
  const supabase = createClient()
  const [progress, setProgress] = useState<TopicProgressRecord[]>([])
  const [loading, setLoading] = useState(false)

  const fetchProgress = useCallback(async () => {
    if (!childId) return
    setLoading(true)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("topic_progress")
      .select("*")
      .eq("child_id", childId)

    if (error) {
      console.error("[useTopicProgress] fetch failed:", error)
    } else {
      setProgress((data ?? []) as TopicProgressRecord[])
    }

    setLoading(false)
  }, [childId, supabase])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  const markComplete = useCallback(
    async (topicId: string, subject: string, classLevel: string, term: number) => {
      if (!childId) return false

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("topic_progress")
        .upsert({
          child_id: childId,
          topic_id: topicId,
          subject,
          class: classLevel,
          term,
          completed: true,
          completed_at: new Date().toISOString(),
        })

      if (error) {
        console.error("[useTopicProgress] mark complete failed:", error)
        return false
      }

      // Update local state
      setProgress(prev => [
        ...prev.filter(p => p.topic_id !== topicId),
        {
          id: topicId,
          child_id: childId,
          topic_id: topicId,
          subject,
          class: classLevel,
          term,
          completed: true,
          completed_at: new Date().toISOString(),
        },
      ])

      return true
    },
    [childId, supabase]
  )

  const isTopicComplete = useCallback(
    (topicId: string) => {
      return progress.some(p => p.topic_id === topicId && p.completed)
    },
    [progress]
  )

  return {
    progress,
    loading,
    markComplete,
    isTopicComplete,
    refresh: fetchProgress,
  }
}
