"use client";

import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { use } from "react";
import { MVP_LANGUAGES, type Language } from "@/types";
import { LETTER_DATA } from "@/lib/audio/clips";
import { useProgress } from "@/hooks/useProgress";
import { useChild } from "@/hooks/useChild";

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
  const alphabet = Object.values(LETTER_DATA);
  const { activeChild } = useChild();
  const { masteredLetters } = useProgress(activeChild?.id ?? null, lang);

  return (
    <div className="pb-10">
      <div className="mb-5 text-center">
        <h1 className="text-xl sm:text-2xl font-extrabold text-stone-800 capitalize">
          {lang === "yoruba" ? "Yorùbá" : "English"} Phonics
        </h1>
        <p className="text-stone-500 text-sm mt-1">Tap a letter — hear Kòkò say it! 🦜</p>
        {masteredLetters.length > 0 && (
          <p className="text-green-600 text-xs font-semibold mt-1">
            ⭐ {masteredLetters.length}/26 mastered
          </p>
        )}
      </div>

      <div role="list" aria-label={`${language} alphabet`}
        className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3">
        {alphabet.map((data, i) => {
          const colour = CARD_COLOURS[i % CARD_COLOURS.length];
          const word = lang === "yoruba" ? data.localWord : data.englishWord;
          const mastered = masteredLetters.includes(data.letter);

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

                {/* Mastered star badge */}
                {mastered && (
                  <span className="absolute top-1 right-1 text-xs z-10">⭐</span>
                )}

                {/* Image */}
                <div className="w-full bg-white/20 flex items-center justify-center p-1.5 pt-2">
                  {data.imageUrl ? (
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                      <Image src={data.imageUrl} alt={word} fill
                        className="object-contain" sizes="48px" unoptimized />
                    </div>
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-2xl">📖</div>
                  )}
                </div>

                {/* Letter + word */}
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
  );
}
