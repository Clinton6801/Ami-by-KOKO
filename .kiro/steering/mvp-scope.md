---
inclusion: always
---

# MVP Scope

## What's IN for MVP
- Landing page (hero, CTAs, social proof placeholder)
- Auth: parent sign-up/login via Supabase email/password
- Child profiles under parent account
- Home / Story Hub screen (Àmì + Kòkò greeting, 3 mode cards)
- Phonics Mode: English A–Z + Yoruba letters, Kòkò audio, letter tracing
- DJ Booth: Web Audio API mixing board (8 pads, looping)
- Story Mode: "Kòkò Lost His Voice" — 10 shards arc
- Parent Dashboard: progress per letter, streak, session time, subscription management
- School Admin Panel: pupil management, class progress, CSV export
- Paystack subscription: free (English) + paid (Yoruba unlock)
- Supported languages at launch: **English** (free) + **Yoruba** (paid)

## What's OUT of MVP (defer to V2+)
- Igbo and Hausa language packs
- Àmì Math (V2 product)
- Àmì Science (V3 product)
- Audio clip export/share from DJ Booth
- Guided tracing paths (MVP uses freehand canvas only)
- Offline / PWA mode
- Push notifications / reminders
- Social features (sharing progress)
- In-app illustration animations (Lottie) — use emoji placeholders until assets ready

## Definition of Done (per feature)
- [ ] TypeScript compiles with no errors (`npm run type-check`)
- [ ] Tailwind classes use brand tokens (no raw hex in JSX)
- [ ] All interactive elements have `aria-label` or visible label
- [ ] All tap targets ≥ 48×48px
- [ ] Supabase RLS policies written for any new table
- [ ] Works on mobile Chrome (primary target device)

## Audio Asset Pipeline
- Clips go in `/public/audio/[language]/[letter].mp3`
- Naming: lowercase letter, e.g. `a.mp3`, `b.mp3`
- Target file size: < 50KB per clip
- Until clips exist, Web Speech API fallback is active automatically

## Known Placeholders (replace before launch)
- Character illustrations: currently emoji (👧🏾 / 🦜) — replace with SVG/Lottie
- Audio clips: directory structure ready, files pending native speaker recording
- Paystack pricing: placeholder values in `src/lib/paystack/client.ts` — confirm before go-live
- Social proof / testimonials: placeholder text on landing page
