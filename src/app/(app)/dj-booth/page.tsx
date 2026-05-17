"use client";

import { useState } from "react";
import { useChild } from "@/hooks/useChild";
import { useSession } from "@/hooks/useSession";
import { useAccess } from "@/hooks/useAccess";
import MixingBoard from "@/components/dj/MixingBoard";
import UpgradePrompt from "@/components/ui/UpgradePrompt";

export default function DJBoothPage() {
  const { activeChild } = useChild();
  useSession(activeChild?.id, "dj_booth");
  const { hasPaid } = useAccess(activeChild);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center gap-6 px-4 py-10">
        <h1 className="text-3xl font-bold text-stone-800">🎵 DJ Booth</h1>
        <p className="text-stone-600">Tap letters to mix sounds with Kòkò!</p>
        {!hasPaid && (
          <p className="text-amber-600 text-xs font-semibold">
            🔒 Pads D–H locked ·{" "}
            <button onClick={() => setUpgradeOpen(true)} className="underline">Unlock Explorer</button>
          </p>
        )}
        <MixingBoard hasPaid={hasPaid} onLockedTap={() => setUpgradeOpen(true)} />
      </main>

      <UpgradePrompt isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} feature="all 8 DJ pads" />
    </>
  );
}
