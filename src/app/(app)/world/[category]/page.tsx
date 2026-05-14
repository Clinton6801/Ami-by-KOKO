"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { WORLD_CATEGORIES, getItemsByCategory } from "@/lib/content/world";

interface Props { params: Promise<{ category: string }> }

export default function WorldCategoryPage({ params }: Props) {
  const { category } = use(params);
  const cat = WORLD_CATEGORIES.find(c => c.key === category);
  if (!cat) notFound();

  const items = getItemsByCategory(category);

  return (
    <div className="pb-10">
      <div className="mb-5 text-center">
        <h1 className="text-xl sm:text-2xl font-extrabold text-stone-800">
          {cat.emoji} {cat.label}
        </h1>
        <p className="text-stone-500 text-sm mt-1">Tap to learn the name!</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {items.map((item, i) => (
          <motion.div key={item.key}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: i * 0.05 }} whileTap={{ scale: 0.92 }}>
            <Link href={`/world/${category}/${item.key}`}
              className={`flex flex-col items-center rounded-2xl bg-gradient-to-br ${cat.colour} shadow-md text-white overflow-hidden transition hover:scale-105`}>
              <div className="w-full bg-white/20 flex items-center justify-center p-2 pt-3">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14">
                  <Image src={item.imageUrl} alt={item.englishName} fill
                    className="object-contain" sizes="56px" unoptimized/>
                </div>
              </div>
              <div className="w-full flex flex-col items-center pb-2 pt-1 px-1">
                <span className="text-xs font-extrabold text-center leading-tight">
                  {item.englishName}
                </span>
                <span className="text-[9px] opacity-75 text-center mt-0.5">
                  {item.yorubaName}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
