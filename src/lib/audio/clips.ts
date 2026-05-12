/**
 * Letter data — word associations, phonetics, and illustration URLs.
 * Images use OpenMoji (https://openmoji.org) — free, open-source emoji illustrations.
 * OpenMoji CDN: https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/{unicode}.svg
 */
import type { LetterConfig } from "@/types";

/** Map of uppercase letter → LetterConfig */
export const LETTER_DATA: Record<string, LetterConfig> = {
  A: {
    letter: "A", phonetic: "ay",
    englishWord: "Apple",       localWord: "Àgbàdo",    localWordMeaning: "corn",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F34E.svg", // 🍎
  },
  B: {
    letter: "B", phonetic: "bee",
    englishWord: "Ball",        localWord: "Bàtà",      localWordMeaning: "drum",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/26BD.svg",  // ⚽
  },
  C: {
    letter: "C", phonetic: "see",
    englishWord: "Cat",         localWord: "Ẹkùn",      localWordMeaning: "leopard",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F431.svg", // 🐱
  },
  D: {
    letter: "D", phonetic: "dee",
    englishWord: "Dog",         localWord: "Ẹja",       localWordMeaning: "fish",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F436.svg", // 🐶
  },
  E: {
    letter: "E", phonetic: "ee",
    englishWord: "Egg",         localWord: "Ẹyin",      localWordMeaning: "egg",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F95A.svg", // 🥚
  },
  F: {
    letter: "F", phonetic: "ef",
    englishWord: "Fish",        localWord: "Ẹja",       localWordMeaning: "fish",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F41F.svg", // 🐟
  },
  G: {
    letter: "G", phonetic: "jee",
    englishWord: "Goat",        localWord: "Ewúrẹ",     localWordMeaning: "goat",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F410.svg", // 🐐
  },
  H: {
    letter: "H", phonetic: "aych",
    englishWord: "House",       localWord: "Ilé",       localWordMeaning: "house",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F3E0.svg", // 🏠
  },
  I: {
    letter: "I", phonetic: "eye",
    englishWord: "Ice cream",   localWord: "Isu",       localWordMeaning: "yam",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F368.svg", // 🍨
  },
  J: {
    letter: "J", phonetic: "jay",
    englishWord: "Jug",         localWord: "Jẹ",        localWordMeaning: "eat",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1FAD9.svg", // 🫙
  },
  K: {
    letter: "K", phonetic: "kay",
    englishWord: "Kite",        localWord: "Kòkò",      localWordMeaning: "parrot",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1FA81.svg", // 🪁
  },
  L: {
    letter: "L", phonetic: "el",
    englishWord: "Lion",        localWord: "Ẹkùn",      localWordMeaning: "lion",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F981.svg", // 🦁
  },
  M: {
    letter: "M", phonetic: "em",
    englishWord: "Mango",       localWord: "Màngoro",   localWordMeaning: "mango",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F96D.svg", // 🥭
  },
  N: {
    letter: "N", phonetic: "en",
    englishWord: "Nose",        localWord: "Imú",       localWordMeaning: "nose",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F443.svg", // 👃
  },
  O: {
    letter: "O", phonetic: "oh",
    englishWord: "Orange",      localWord: "Ọsàn",      localWordMeaning: "orange",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F34A.svg", // 🍊
  },
  P: {
    letter: "P", phonetic: "pee",
    englishWord: "Parrot",      localWord: "Ọ̀pẹ",      localWordMeaning: "palm tree",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F99C.svg", // 🦜
  },
  Q: {
    letter: "Q", phonetic: "kyoo",
    englishWord: "Queen",       localWord: "Ayaba",     localWordMeaning: "queen",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F451.svg", // 👑
  },
  R: {
    letter: "R", phonetic: "ar",
    englishWord: "Rain",        localWord: "Òjò",       localWordMeaning: "rain",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F327.svg", // 🌧
  },
  S: {
    letter: "S", phonetic: "es",
    englishWord: "Sun",         localWord: "Òòrùn",     localWordMeaning: "sun",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/2600.svg",  // ☀️
  },
  T: {
    letter: "T", phonetic: "tee",
    englishWord: "Tree",        localWord: "Igi",       localWordMeaning: "tree",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F333.svg", // 🌳
  },
  U: {
    letter: "U", phonetic: "yoo",
    englishWord: "Umbrella",    localWord: "Agboorun",  localWordMeaning: "umbrella",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/2602.svg",  // ☂️
  },
  V: {
    letter: "V", phonetic: "vee",
    englishWord: "Village",     localWord: "Abúlé",     localWordMeaning: "village",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F3D8.svg", // 🏘
  },
  W: {
    letter: "W", phonetic: "double-yoo",
    englishWord: "Water",       localWord: "Omi",       localWordMeaning: "water",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F4A7.svg", // 💧
  },
  X: {
    letter: "X", phonetic: "ex",
    englishWord: "Xylophone",   localWord: "Gángan",    localWordMeaning: "talking drum",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F941.svg", // 🥁
  },
  Y: {
    letter: "Y", phonetic: "why",
    englishWord: "Yam",         localWord: "Isu",       localWordMeaning: "yam",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F360.svg", // 🍠
  },
  Z: {
    letter: "Z", phonetic: "zee",
    englishWord: "Zebra",       localWord: "Kẹ́tẹ́kẹ́tẹ́", localWordMeaning: "donkey",
    imageUrl: "https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F993.svg", // 🦓
  },
};

export function getClipUrl(language: string, letter: string): string | null {
  return `/audio/${language}/${letter.toLowerCase()}.mp3`;
}
