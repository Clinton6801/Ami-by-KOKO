/**
 * Story Mode — "Kòkò Lost His Voice"
 * Displays the 10-shard arc and current progress.
 */
import StoryScene from "@/components/story/StoryScene";

export default function StoryPage() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-6 px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-800">📖 Kòkò&apos;s Story</h1>
      <p className="max-w-xs text-center text-stone-600">
        Kòkò lost his voice! Help him find the 10 sound shards hidden in the
        alphabet.
      </p>
      <StoryScene />
    </main>
  );
}
