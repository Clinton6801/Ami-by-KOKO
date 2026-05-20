"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { WORLD_CATEGORIES } from "@/lib/content/world";
import { useChild } from "@/hooks/useChild";
import { useAccess } from "@/hooks/useAccess";
import { isCategoryFree } from "@/lib/access";
import UpgradePrompt from "@/components/ui/UpgradePrompt";
import LockedOverlay from "@/components/ui/LockedOverlay";

export default function WorldPage() {
  const { activeChild } = useChild();
  const { hasPaid } = useAccess(activeChild);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-6 pb-10">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-stone-800">My World</h1>
          <p className="text-stone-500 text-sm mt-1">Tap a category to explore!</p>
          {!hasPaid && (
            <p className="text-amber-600 text-xs font-semibold mt-1">
              🔒 Animals, Fruits, Objects & Weather locked ·{" "}
              <button onClick={() => setUpgradeOpen(true)} className="underline">Unlock Explorer</button>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {WORLD_CATEGORIES.map((cat, i) => {
            const locked = !hasPaid && !isCategoryFree(cat.key);
            return (
              <motion.div key={cat.key}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} whileTap={locked ? {} : { scale: 0.94 }}>
                {locked ? (
                  <div className={`relative flex flex-col items-center gap-3 p-5 rounded-3xl bg-gradient-to-br ${cat.colour} shadow-md text-white overflow-hidden`}>
                    <span className="text-4xl opacity-40">{cat.emoji}</span>
                    <span className="font-extrabold text-sm text-center opacity-40">{cat.label}</span>
                    <LockedOverlay onTap={() => setUpgradeOpen(true)} />
                  </div>
                ) : (
                  <Link href={`/world/${cat.key}`}
                    className={`flex flex-col items-center gap-3 p-5 rounded-3xl bg-gradient-to-br ${cat.colour} shadow-md text-white transition hover:scale-105`}>
                    <span className="text-4xl">{cat.emoji}</span>
                    <span className="font-extrabold text-sm text-center">{cat.label}</span>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <UpgradePrompt isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} feature="Animals, Fruits, Objects & Weather" />
    </>
  );
}
