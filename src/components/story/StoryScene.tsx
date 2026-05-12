"use client";

/**
 * StoryScene — displays Kòkò's voice shard progress.
 * 10 shards = Kòkò's voice fully restored.
 */
import Koko from "@/components/characters/Koko";
import VoiceShard from "./VoiceShard";

// MVP: 10 letters unlock the story arc
const STORY_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

interface StorySceneProps {
  /** Number of shards collected so far */
  shardsCollected?: number;
}

export default function StoryScene({ shardsCollected = 0 }: StorySceneProps) {
  const completed = shardsCollected >= STORY_LETTERS.length;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Kòkò — muted until all shards collected */}
      <Koko muted={!completed} speaking={completed} />

      {completed ? (
        <p className="text-center text-xl font-bold text-green-700">
          🎉 Kòkò has his voice back! 🎉
        </p>
      ) : (
        <p className="text-center text-stone-600">
          {shardsCollected} / {STORY_LETTERS.length} sound shards collected
        </p>
      )}

      {/* Shard grid */}
      <div
        role="list"
        aria-label="Voice shards"
        className="grid grid-cols-5 gap-3"
      >
        {STORY_LETTERS.map((letter, i) => (
          <VoiceShard
            key={letter}
            letter={letter}
            collected={i < shardsCollected}
          />
        ))}
      </div>
    </div>
  );
}
