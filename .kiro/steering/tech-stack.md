---
inclusion: always
---

# Tech Stack & Conventions

## Stack
| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript — strict mode, no `any` |
| Styling | Tailwind CSS — use brand tokens, not raw hex |
| Database / Auth | Supabase (Postgres + Auth + Storage) |
| Audio (TTS) | Web Speech API + pre-recorded native speaker clips |
| Sound Mixing | Web Audio API (DJ Booth) |
| Animations | Framer Motion |
| Payments | Paystack |
| Deployment | Vercel |

## Path Aliases
- `@/*` maps to `src/*` — always use this, never relative `../../`

## File Naming
- Pages: `page.tsx` (Next.js App Router convention)
- Components: PascalCase — `LetterCard.tsx`, `SoundButton.tsx`
- Hooks: camelCase prefixed with `use` — `useChild.ts`, `useProgress.ts`
- Lib utilities: camelCase — `speech.ts`, `mixer.ts`

## Component Rules
- Client Components: add `"use client"` directive at the top
- Server Components: default (no directive needed)
- All interactive elements must meet **48×48px minimum tap target** (children's UX)
- Use `focus-ring` utility class for all focusable elements
- Animations via Framer Motion — no raw CSS keyframes for character animations

## Supabase
- Browser client: `createClient()` from `@/lib/supabase/client`
- Server client: `createClient()` from `@/lib/supabase/server`
- Never use the service role key on the client side
- All tables have RLS enabled — always write policies for new tables
- Type-safe queries via `Database` type in `@/lib/supabase/database.types.ts`
- After schema changes: regenerate types with `npx supabase gen types typescript --local`

## Audio Strategy
1. **Primary**: pre-recorded native speaker clips at `/public/audio/[language]/[letter].mp3`
2. **Fallback**: Web Speech API via `@/lib/audio/speech.ts`
- Never play audio without user interaction (browser autoplay policy)
- Compress audio clips — target < 50KB per clip for low-bandwidth users

## Styling Conventions
- Background: `bg-cream-bg` (never `bg-yellow-50` or raw hex)
- Primary actions: `bg-amber-500 hover:bg-amber-600`
- Secondary/school actions: `border-green-800 text-green-800`
- Celebration/accent: `bg-rose-500` or `text-rose-500`
- Rounded corners: `rounded-2xl` for cards, `rounded-full` for pills/badges
- Shadows: `shadow-sm` default, `shadow-md` for elevated cards
