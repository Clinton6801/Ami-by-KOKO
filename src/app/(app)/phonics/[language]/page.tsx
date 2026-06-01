"use client";

import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { use, useState } from "react";
import { MVP_LANGUAGES, type Language } from "@/types";
import { LETTER_DATA } from "@/lib/audio/clips";
import { useProgress } from "@/hooks/useProgress";
import { useChild } from "@/hooks/useChild";
import { useAccess } from "@/hooks/useAccess";
import { isLetterFree } from "@/lib/access-utils";
import UpgradePrompt from "@/components/ui/UpgradePrompt";
import LockedOverlay from "@/components/ui/LockedOverlay";

const CARD_COLOURS = [
  "from-amber-400 to-orange-400",
  "from-green-400 to-emerald-500",
  "from-rose-400 to-pink-500",
  "from-violet-400 to-purple-500",
  "from-sky-400 to-blue-500",
  "from-yellow-400 to-amber-400",
];

interface Props {
  params: Promise<{ language: string }>;
}

export default function PhonicsGridPage({ params }: Props) {
  const { language } = use(params);
  if (!MVP_LANGUAGES.includes(language as Language)) notFound();

  const lang = language as Language;
  const alphabet = Object.values(LETTER_DATA[lang]);
  const { activeChild, loading: childLoading } = useChild();
  const { masteredLetters } = useProgress(activeChild?.id ?? null, lang);
  const { hasPaid, loading: accessLoading, isStudent } = useAccess(activeChild);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (childLoading || accessLoading) {
    return (
      <div className="pb-10">
        <div className="mb-5 text-center">
          <div className="h-7 w-40 bg-stone-200 rounded-full mx-auto animate-pulse mb-2" />
          <div className="h-4 w-56 bg-stone-100 rounded-full mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3">
          {Array(26).fill(null).map((_, i) => (
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
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-800 capitalize">
            {lang === "yoruba" ? "Yorùbá" : "English"} Phonics
          </h1>
          <p className="text-stone-500 text-sm mt-1">Tap a letter — hear Kòkò say it! 🦜</p>
          {masteredLetters.length > 0 && (
            <p className="text-green-600 text-xs font-semibold mt-1">
              ⭐ {masteredLetters.length}/{alphabet.length} mastered
            </p>
          )}
          {!hasPaid && !isStudent && (
            <p className="text-amber-600 text-xs font-semibold mt-1">
              🔒 Letters G–Z locked · <button onClick={() => setUpgradeOpen(true)} className="underline">Unlock Explorer</button>
            </p>
          )}
          {!hasPaid && isStudent && (
            <p className="text-amber-600 text-xs font-semibold mt-1">
              🔒 Some letters are locked
            </p>
          )}
        </div>

        <div role="list" aria-label={`${language} alphabet`}
          className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3">
          {alphabet.map((data, i) => {
            const colour = CARD_COLOURS[i % CARD_COLOURS.length];
            // Show the word in the language being learned (localWord for non-English)
            const word = lang === "english" ? data.englishWord : data.localWord;
            const mastered = masteredLetters.includes(data.letter);
            const locked = !hasPaid && !isLetterFree(data.letter, lang);

            if (locked) {
              return (
                <motion.div key={data.letter} role="listitem"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.025 }}>
                  <div className={`relative flex flex-col items-center rounded-2xl bg-gradient-to-br ${colour} shadow-md text-white overflow-hidden`}>
                    <div className="w-full bg-white/20 flex items-center justify-center p-1.5 pt-2">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center opacity-40">
                        {data.imageUrl
                          ? <img src={data.imageUrl} alt="" className="w-full h-full object-contain" />
                          : <span className="text-2xl">📖</span>
                        }
                      </div>
                    </div>
                    <div className="w-full flex flex-col items-center pb-2 pt-1 px-1 opacity-40">
                      <div className="flex items-baseline gap-0.5 leading-none">
                        <span className="text-lg sm:text-xl font-extrabold drop-shadow">{data.letter}</span>
                        <span className="text-sm sm:text-base font-bold opacity-75 drop-shadow">{data.letter.toLowerCase()}</span>
                      </div>
                    </div>
                    <LockedOverlay onTap={() => setUpgradeOpen(true)} isStudent={isStudent} />
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div key={data.letter} role="listitem"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: i * 0.025 }}
                whileTap={{ scale: 0.92 }}>
                <Link
                  href={`/phonics/${lang}/${data.letter.toLowerCase()}`}
                  className={`relative flex flex-col items-center rounded-2xl bg-gradient-to-br ${colour} shadow-md text-white overflow-hidden transition hover:scale-105 hover:shadow-lg`}
                  aria-label={`Letter ${data.letter}, ${word}${mastered ? ", mastered" : ""}`}>
                  {mastered && <span className="absolute top-1 right-1 text-xs z-10">⭐</span>}
                  <div className="w-full bg-white/20 flex items-center justify-center p-1.5 pt-2">
                    {data.imageUrl ? (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={data.imageUrl} alt={word} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-2xl">📖</div>
                    )}
                  </div>
                  <div className="w-full flex flex-col items-center pb-2 pt-1 px-1">
                    <div className="flex items-baseline gap-0.5 leading-none">
                      <span className="text-lg sm:text-xl font-extrabold drop-shadow">{data.letter}</span>
                      <span className="text-sm sm:text-base font-bold opacity-75 drop-shadow">{data.letter.toLowerCase()}</span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-medium opacity-90 text-center leading-tight mt-0.5 truncate w-full px-0.5">
                      {word.split(" ")[0]}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <UpgradePrompt
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="letters G–Z"
      />
    </>
  );
}
