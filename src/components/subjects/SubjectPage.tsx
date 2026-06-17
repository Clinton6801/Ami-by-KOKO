"use client"

import { useState } from "react"
import type { Term } from "@/types"
import type { TopicContent } from "@/lib/content/curriculum"
import { motion, AnimatePresence } from "framer-motion"
import { useTopicProgress } from "@/hooks/useTopicProgress"

interface SubjectPageProps {
  title: string
  emoji: string
  description: string
  headerGradient: string
  kokoEmoji: string
  curriculum: TopicContent[]
  subject: string
  child: any
}

const colors = ["green", "amber", "rose"]
const colorClasses: Record<string, { bg: string; border: string; accent: string }> = {
  green: {
    bg: "bg-green-50",
    border: "border-l-green-500",
    accent: "bg-green-100 text-green-800",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-l-amber-500",
    accent: "bg-amber-100 text-amber-800",
  },
  rose: {
    bg: "bg-rose-50",
    border: "border-l-rose-500",
    accent: "bg-rose-100 text-rose-800",
  },
}

export function SubjectPage({
  title,
  emoji,
  description,
  headerGradient,
  kokoEmoji,
  curriculum,
  subject,
  child,
}: SubjectPageProps) {
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(
    (child?.term as Term) ?? null
  )
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  const { isTopicComplete, markComplete } = useTopicProgress(child?.id ?? null)

  const topics = curriculum.filter(
    t => t.subject === subject && (selectedTerm === null || t.term === selectedTerm)
  )

  const selectedTopicData = topics.find(t => t.id === selectedTopic)

  const termEmojis: Record<number, string> = {
    1: "🌱",
    2: "🌿",
    3: "🌳",
  }

  const handleMarkComplete = async () => {
    if (!selectedTopicData || !child?.class) return

    const success = await markComplete(
      selectedTopicData.id,
      selectedTopicData.subject,
      child.class,
      selectedTopicData.term
    )

    if (success) {
      setShowCelebration(true)
      setTimeout(() => {
        setShowCelebration(false)
        setSelectedTopic(null)
      }, 2000)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Header */}
      <div className={`relative overflow-hidden rounded-3xl mx-2 mt-2 bg-gradient-to-br ${headerGradient} shadow-xl min-h-[160px]`}>
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white opacity-10" />
        <div className="relative z-10 pt-6 pl-6 pr-4 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-5xl mb-2">{emoji}</div>
              <h1 className="text-2xl font-extrabold text-white">{title}</h1>
              <p className="text-white/90 text-sm mt-1">{description}</p>
            </div>
            <div className="text-5xl opacity-50 animate-bounce">{kokoEmoji}</div>
          </div>
        </div>
      </div>

      {/* Term Selector */}
      {child && (
        <div className="flex gap-2 max-w-sm mx-auto w-full px-3 justify-center">
          {[1, 2, 3].map(term => (
            <button
              key={term}
              onClick={() => setSelectedTerm(selectedTerm === term ? null : (term as Term))}
              className={`px-4 py-2 rounded-full font-semibold transition text-sm ${
                selectedTerm === term
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Term {term}
            </button>
          ))}
        </div>
      )}

      {/* Topics Grid */}
      {topics.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 max-w-md mx-auto w-full px-3">
          {topics.map((topic, idx) => {
            const colorKey = colors[idx % colors.length]
            const colorStyle = colorClasses[colorKey]
            const isComplete = isTopicComplete(topic.id)

            return (
              <div
                key={topic.id}
                className={`${colorStyle.bg} rounded-2xl border-l-4 ${colorStyle.border} p-4 shadow-sm hover:shadow-md transition relative ${
                  isComplete ? "opacity-60" : ""
                }`}
              >
                {isComplete && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    ✓
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{termEmojis[topic.term]}</span>
                      <span className="text-xs font-bold text-gray-600">Term {topic.term}</span>
                    </div>
                    <h3 className="font-bold text-stone-800 text-sm">{topic.title}</h3>
                    <p className="text-xs text-stone-600 mt-1">{topic.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {topic.activities.slice(0, 2).map((activity, i) => (
                        <span key={i} className={`text-xs px-2 py-1 rounded-full ${colorStyle.accent}`}>
                          {activity.substring(0, 15)}...
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTopic(topic.id)}
                    disabled={isComplete}
                    className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white font-bold text-xs px-3 py-2 rounded-xl transition"
                  >
                    {isComplete ? "Done" : "Start →"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 px-4">
          <div className="text-5xl mb-3">🦜</div>
          <p className="text-stone-600 font-medium">Topics for this term coming soon!</p>
          <p className="text-stone-500 text-sm mt-1">Check back when you progress to the next term</p>
        </div>
      )}

      {/* Topic Detail Modal */}
      <AnimatePresence>
        {selectedTopicData && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedTopic(null)}
                className="sticky top-0 right-0 m-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition z-10"
              >
                ✕
              </button>

              <div className="px-4 pb-8">
                {/* Celebration Animation */}
                {showCelebration && (
                  <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    {[...Array(30)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: 0, x: 0, opacity: 1 }}
                        animate={{
                          y: -200,
                          x: (Math.random() - 0.5) * 200,
                          opacity: 0,
                        }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="absolute text-2xl"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: "50%",
                        }}
                      >
                        {["🎉", "🎊", "⭐", "✨"][Math.floor(Math.random() * 4)]}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Topic Header */}
                <div className="text-center mb-6">
                  <div className="text-5xl mb-2">{termEmojis[selectedTopicData.term]}</div>
                  <h2 className="text-2xl font-extrabold text-stone-800">{selectedTopicData.title}</h2>
                  <p className="text-sm text-stone-500 mt-1">
                    {title} · Term {selectedTopicData.term}
                  </p>
                </div>

                {/* Kòkò Illustration */}
                <div className="flex justify-center mb-6">
                  <div className="text-6xl animate-bounce">🦜</div>
                </div>

                {/* Description */}
                <p className="text-center text-stone-700 mb-6 leading-relaxed">
                  {selectedTopicData.description}
                </p>

                {/* Activities */}
                <div className="space-y-3 mb-6">
                  {selectedTopicData.activities.map((activity, idx) => (
                    <div key={idx} className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">🎯</span>
                        <div className="flex-1">
                          <p className="font-bold text-amber-900 text-sm">{activity}</p>
                        </div>
                      </div>
                      <button className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-xl transition text-sm">
                        Try it →
                      </button>
                    </div>
                  ))}
                </div>

                {/* Keywords */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-stone-600 mb-2">KEY WORDS</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTopicData.keyWords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full"
                      >
                        [{keyword}]
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mark Complete Button */}
                <button
                  onClick={handleMarkComplete}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-2xl transition"
                >
                  Mark as Complete ✓
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
