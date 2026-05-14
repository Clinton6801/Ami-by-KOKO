/**
 * World Knowledge content — Sprout 1 curriculum.
 * Categories: body parts, animals, fruits, objects, weather.
 */

export interface WorldItem {
  key: string;
  englishName: string;
  yorubaName: string;
  imageUrl: string;
  category: string;
}

export const WORLD_ITEMS: Record<string, WorldItem> = {
  // Body parts — Term 1
  head:   { key:"head",   englishName:"Head",    yorubaName:"Orí",    category:"body", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F9E0.svg" },
  eyes:   { key:"eyes",   englishName:"Eyes",    yorubaName:"Ojú",    category:"body", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F441.svg" },
  nose:   { key:"nose",   englishName:"Nose",    yorubaName:"Imú",    category:"body", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F443.svg" },
  mouth:  { key:"mouth",  englishName:"Mouth",   yorubaName:"Ẹnu",    category:"body", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F444.svg" },
  hands:  { key:"hands",  englishName:"Hands",   yorubaName:"Ọwọ",    category:"body", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F44B.svg" },
  feet:   { key:"feet",   englishName:"Feet",    yorubaName:"Ẹsẹ",    category:"body", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F9B6.svg" },
  // Animals — Term 2
  dog:     { key:"dog",     englishName:"Dog",     yorubaName:"Ajá",    category:"animals", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F436.svg" },
  cat:     { key:"cat",     englishName:"Cat",     yorubaName:"Ológìnní",category:"animals",imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F431.svg" },
  cow:     { key:"cow",     englishName:"Cow",     yorubaName:"Màlúù",  category:"animals", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F404.svg" },
  goat:    { key:"goat",    englishName:"Goat",    yorubaName:"Ewúrẹ",  category:"animals", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F410.svg" },
  chicken: { key:"chicken", englishName:"Chicken", yorubaName:"Adìẹ",   category:"animals", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F413.svg" },
  parrot:  { key:"parrot",  englishName:"Parrot",  yorubaName:"Àkùkọ",  category:"animals", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F99C.svg" },
  // Fruits — Term 2
  mango:   { key:"mango",   englishName:"Mango",   yorubaName:"Màngoro",category:"fruits",  imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F96D.svg" },
  orange:  { key:"orange",  englishName:"Orange",  yorubaName:"Ọsàn",   category:"fruits",  imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F34A.svg" },
  banana:  { key:"banana",  englishName:"Banana",  yorubaName:"Ọ̀gẹ̀dẹ̀", category:"fruits",  imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F34C.svg" },
  // Objects — Term 3
  cup:     { key:"cup",     englishName:"Cup",     yorubaName:"Ife",    category:"objects", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/2615.svg" },
  book:    { key:"book",    englishName:"Book",    yorubaName:"Ìwé",    category:"objects", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F4D6.svg" },
  bag:     { key:"bag",     englishName:"Bag",     yorubaName:"Àpò",    category:"objects", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F392.svg" },
  shoe:    { key:"shoe",    englishName:"Shoe",    yorubaName:"Bàtà",   category:"objects", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F45E.svg" },
  ball:    { key:"ball",    englishName:"Ball",    yorubaName:"Bọọlù",  category:"objects", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/26BD.svg" },
  spoon:   { key:"spoon",   englishName:"Spoon",   yorubaName:"Sibi",   category:"objects", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F944.svg" },
  // Weather — Term 3
  sun:     { key:"sun",     englishName:"Sun",     yorubaName:"Òòrùn",  category:"weather", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/2600.svg" },
  rain:    { key:"rain",    englishName:"Rain",    yorubaName:"Òjò",    category:"weather", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F327.svg" },
  cloud:   { key:"cloud",   englishName:"Cloud",   yorubaName:"Ìkùukù", category:"weather", imageUrl:"https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/2601.svg" },
};

export const WORLD_CATEGORIES = [
  { key: "body",    label: "Body Parts",  emoji: "🫀", colour: "from-rose-400 to-pink-400" },
  { key: "animals", label: "Animals",     emoji: "🐾", colour: "from-green-400 to-emerald-500" },
  { key: "fruits",  label: "Fruits",      emoji: "🍎", colour: "from-amber-400 to-orange-400" },
  { key: "objects", label: "Objects",     emoji: "🎒", colour: "from-violet-400 to-purple-500" },
  { key: "weather", label: "Weather",     emoji: "☀️", colour: "from-sky-400 to-blue-500" },
];

export function getItemsByCategory(category: string): WorldItem[] {
  return Object.values(WORLD_ITEMS).filter(i => i.category === category);
}
