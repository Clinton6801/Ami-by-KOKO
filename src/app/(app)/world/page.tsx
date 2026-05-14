"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { WORLD_CATEGORIES } from "@/lib/content/world";

export default function WorldPage() {
  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-stone-800">My World</h1>
        <p className="text-stone-500 text-sm mt-1">Tap a category to explore!</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {WORLD_CATEGORIES.map((cat, i) => (
          <motion.div key={cat.key}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} whileTap={{ scale: 0.94 }}>
            <Link href={`/world/${cat.key}`}
              className={`flex flex-col items-center gap-3 p-5 rounded-3xl bg-gradient-to-br ${cat.colour} shadow-md text-white transition hover:scale-105`}>
              <span className="text-4xl">{cat.emoji}</span>
              <span className="font-extrabold text-sm text-center">{cat.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
