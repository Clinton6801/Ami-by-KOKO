/**
 * Song data — lyrics and audio file paths for all letter, number, and world songs.
 * Audio files go in /public/audio/songs/[type]/[key]-song.mp3
 * Web Speech API TTS is used as fallback when MP3 is not available.
 */

export interface SongData {
  key: string;
  lyrics: string;       // spoken by TTS fallback
  audioPath: string;    // path to MP3 in /public
}

// ─── Letter songs ─────────────────────────────────────────────────────────────

const LETTER_SONG_WORDS: Record<string, { word: string; meaning: string; sound: string }> = {
  A: { word: "Àgbàdo",   meaning: "corn",              sound: "Ahh" },
  B: { word: "Bàtà",     meaning: "drum",              sound: "Buh" },
  C: { word: "Calabash", meaning: "calabash bowl",     sound: "Kuh" },
  D: { word: "Dodo",     meaning: "fried plantain",    sound: "Duh" },
  E: { word: "Ẹkọ",      meaning: "corn pudding",      sound: "Eh"  },
  F: { word: "Fufu",     meaning: "fufu",              sound: "Fuh" },
  G: { word: "Garri",    meaning: "garri",             sound: "Guh" },
  H: { word: "Harmattan",meaning: "dry season wind",   sound: "Huh" },
  I: { word: "Ìyán",     meaning: "pounded yam",       sound: "Ih"  },
  J: { word: "Jollof",   meaning: "jollof rice",       sound: "Juh" },
  K: { word: "Kòkò",     meaning: "our parrot friend", sound: "Kuh" },
  L: { word: "Leopard",  meaning: "African leopard",   sound: "Luh" },
  M: { word: "Mango",    meaning: "mango",             sound: "Muh" },
  N: { word: "Nkwobi",   meaning: "spiced cow foot",   sound: "Nuh" },
  O: { word: "Okra",     meaning: "okra soup",         sound: "Oh"  },
  P: { word: "Palm tree",meaning: "palm tree",         sound: "Puh" },
  Q: { word: "Queen",    meaning: "queen mother",      sound: "Kwuh"},
  R: { word: "Rain",     meaning: "African rain",      sound: "Ruh" },
  S: { word: "Suya",     meaning: "grilled suya",      sound: "Suh" },
  T: { word: "Tilapia",  meaning: "tilapia fish",      sound: "Tuh" },
  U: { word: "Ugwu",     meaning: "pumpkin leaf",      sound: "Uh"  },
  V: { word: "Village",  meaning: "village square",    sound: "Vuh" },
  W: { word: "Waterleaf",meaning: "waterleaf soup",    sound: "Wuh" },
  X: { word: "Xylophone",meaning: "xylophone",         sound: "Zuh" },
  Y: { word: "Yam",      meaning: "yam",               sound: "Yuh" },
  Z: { word: "Zebra",    meaning: "zebra",             sound: "Zuh" },
};

export function getLetterSong(letter: string, language: string = "english"): SongData {
  const upper = letter.toUpperCase();
  const data = LETTER_SONG_WORDS[upper] ?? { word: letter, meaning: "", sound: upper };
  const lyrics = [
    `${upper} is for ${data.word}, ${data.word}, ${data.word}.`,
    `${upper} is for ${data.word}, now you know the sound.`,
    `${data.sound} — ${data.sound} — ${data.sound} says the letter ${upper}.`,
    `Kòkò loves ${data.word} every single day!`,
  ].join(" ");

  return {
    key: upper,
    lyrics,
    audioPath: `/audio/songs/letters/${language}/${upper.toLowerCase()}-song.mp3`,
  };
}

// ─── Number songs ─────────────────────────────────────────────────────────────

const NUMBER_WORDS = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten"];
const NUMBER_ITEMS = ["","mango","oranges","bananas","grapes","strawberries","yams","broccoli","carrots","peppers","ears of corn"];

export function getNumberSong(num: number, language: string = "english"): SongData {
  const word = NUMBER_WORDS[num] ?? String(num);
  const item = NUMBER_ITEMS[num] ?? "things";

  const lines: string[] = [];
  for (let i = 1; i <= num; i++) {
    lines.push(`${NUMBER_WORDS[i]} ${i === 1 ? item.replace(/s$/, "") : item}.`);
  }
  lines.push(`${word} — ${word} — ${word}! Kòkò counts to ${word}!`);

  return {
    key: String(num),
    lyrics: lines.join(" "),
    audioPath: `/audio/songs/numbers/${language}/${num}-song.mp3`,
  };
}

// ─── World category songs ─────────────────────────────────────────────────────

const WORLD_SONGS: Record<string, { lyrics: string }> = {
  body:    { lyrics: "Head, shoulders, eyes and nose — Kòkò knows them all! Hands and feet and mouth so sweet — Kòkò knows them all!" },
  animals: { lyrics: "Goat and chicken, dog and cow, parrot says hello! Dog says woof and cat says meow — Kòkò loves them so!" },
  fruits:  { lyrics: "Mango, orange, banana too — Kòkò loves them, how about you? Sweet and juicy, fresh and bright — fruits are Kòkò's delight!" },
  objects: { lyrics: "Cup and book and bag and shoe — these are things we use! Ball and spoon and so much more — Kòkò knows them all!" },
  weather: { lyrics: "Sun is shining, rain is falling, clouds are in the sky! Wind is blowing, Kòkò's singing — what a lovely day!" },
};

export function getWorldSong(category: string): SongData {
  const data = WORLD_SONGS[category] ?? { lyrics: `Let's learn about ${category} with Kòkò!` };
  return {
    key: category,
    lyrics: data.lyrics,
    audioPath: `/audio/songs/world/${category}-song.mp3`,
  };
}

// ─── Song of the Day ──────────────────────────────────────────────────────────

/** Returns today's letter (rotates daily through A–Z) */
export function getSongOfTheDay(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return letters[dayOfYear % 26];
}
