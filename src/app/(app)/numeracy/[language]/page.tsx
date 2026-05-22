"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useChild } from "@/hooks/useChild";
import { useAccess } from "@/hooks/useAccess";
import { isNumberFree } from "@/lib/access";
import UpgradePrompt from "@/components/ui/UpgradePrompt";
import LockedOverlay from "@/components/ui/LockedOverlay";

const NUMBER_DATA: Record<string, {
  numeral: string; word: string; yorubaWord: string; imageUrl: string; colour: string;
}> = {
  "1":  { numeral:"1",  word:"One",   yorubaWord:"Ọkan", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F96D.svg", colour:"from-amber-400 to-orange-400" },
  "2":  { numeral:"2",  word:"Two",   yorubaWord:"Èjì",  imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F34A.svg", colour:"from-green-400 to-emerald-500" },
  "3":  { numeral:"3",  word:"Three", yorubaWord:"Ẹta",  imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F34C.svg", colour:"from-violet-400 to-purple-500" },
  "4":  { numeral:"4",  word:"Four",  yorubaWord:"Ẹrin", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F347.svg", colour:"from-rose-400 to-pink-500" },
  "5":  { numeral:"5",  word:"Five",  yorubaWord:"Àrún", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F353.svg", colour:"from-sky-400 to-blue-500" },
  "6":  { numeral:"6",  word:"Six",   yorubaWord:"Ẹfà",  imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F360.svg", colour:"from-amber-400 to-yellow-400" },
  "7":  { numeral:"7",  word:"Seven", yorubaWord:"Èje",  imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F966.svg", colour:"from-teal-400 to-cyan-500" },
  "8":  { numeral:"8",  word:"Eight", yorubaWord:"Ẹjọ",  imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F955.svg", colour:"from-orange-400 to-red-400" },
  "9":  { numeral:"9",  word:"Nine",  yorubaWord:"Ẹsàn", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F336.svg", colour:"from-fuchsia-400 to-pink-400" },
  "10": { numeral:"10", word:"Ten",   yorubaWord:"Ẹwà",  imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F33D.svg", colour:"from-green-500 to-emerald-400" },
};

interface Props { params: Promise<{ language: string }> }

export default function NumeracyGridPage({ params }: Props) {
  const { language } = use(params);
  if (language !== "english") notFound();

  const { activeChild, loading: childLoading } = useChild();
  const { hasPaid, loading: accessLoading, isStudent } = useAccess(activeChild);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (childLoading || accessLoading) {
    return (
      <div className="pb-10">
        <div className="h-7 w-40 bg-stone-200 rounded-full mx-auto animate-pulse mb-5" />
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
          {Array(10).fill(null).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-stone-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pb-10">
        <div className="mb-5 text-center">
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-800">Numbers 1–10</h1>
          <p className="text-stone-500 text-sm mt-1">Tap a number — hear Kòkò say it! 🦜</p>
          {!hasPaid && !isStudent && (
            <p className="text-amber-600 text-xs font-semibold mt-1">
              🔒 Numbers 4–10 locked ·{" "}
              <button onClick={() => setUpgradeOpen(true)} className="underline">Unlock Explorer</button>
            </p>
          )}
          {!hasPaid && isStudent && (
            <p className="text-amber-600 text-xs font-semibold mt-1">🔒 Some numbers are locked</p>
          )}
        </div>

        <div role="list" aria-label="Numbers 1 to 10"
          className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
          {Object.values(NUMBER_DATA).map((data, i) => {
            const locked = !hasPaid && !isNumberFree(data.numeral);
            return (
              <motion.div key={data.numeral} role="listitem"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                whileTap={locked ? {} : { scale: 0.92 }}>
                {locked ? (
                  <div className={`relative flex flex-col items-center rounded-2xl bg-gradient-to-br ${data.colour} shadow-md text-white overflow-hidden`}>
                    <div className="w-full bg-white/20 flex items-center justify-center p-1.5 pt-2">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center opacity-40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={data.imageUrl} alt="" className="w-full h-full object-contain" />
                      </div>
                    </div>
                    <div className="w-full flex flex-col items-center pb-2 pt-1 px-1 opacity-40">
                      <span className="text-2xl sm:text-3xl font-extrabold drop-shadow leading-none">{data.numeral}</span>
                    </div>
                    <LockedOverlay onTap={() => setUpgradeOpen(true)} isStudent={isStudent} />
                  </div>
                ) : (
                  <Link href={`/numeracy/${language}/${data.numeral}`}
                    className={`flex flex-col items-center rounded-2xl bg-gradient-to-br ${data.colour} shadow-md text-white overflow-hidden transition hover:scale-105`}
                    aria-label={`Number ${data.numeral}, ${data.word}`}>
                    <div className="w-full bg-white/20 flex items-center justify-center p-1.5 pt-2">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={data.imageUrl} alt={data.word} className="w-full h-full object-contain" />
                      </div>
                    </div>
                    <div className="w-full flex flex-col items-center pb-2 pt-1 px-1">
                      <span className="text-2xl sm:text-3xl font-extrabold drop-shadow leading-none">{data.numeral}</span>
                      <span className="text-[9px] sm:text-[10px] font-medium opacity-90 mt-0.5">{data.word}</span>
                    </div>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <UpgradePrompt isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} feature="numbers 4–10" />
    </>
  );
}

export { NUMBER_DATA };
