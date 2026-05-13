"use client";

import { useChild } from "@/hooks/useChild";
import { useSession } from "@/hooks/useSession";
import MixingBoard from "@/components/dj/MixingBoard";

export default function DJBoothPage() {
  const { activeChild } = useChild();
  useSession(activeChild?.id, "dj_booth");

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-800">🎵 DJ Booth</h1>
      <p className="text-stone-600">Tap letters to mix sounds with Kòkò!</p>
      <MixingBoard />
    </main>
  );
}
