# Àmì by Kòkò — MVP Spec

## Product Overview

**Àmì by Kòkò** is a multilingual phonics and early learning web app for Nigerian children aged 0–8.
The app is guided by two characters: **Àmì**, a curious 6-year-old Nigerian girl, and **Kòkò**, her talking parrot companion.

The product targets:
- **B2C**: Parents using the app at home to engage and educate young children
- **B2B**: Schools (especially private primary schools in Nigeria) looking for a branded digital literacy tool

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database / Auth | Supabase (Postgres + Auth + Storage) |
| Audio (TTS) | Web Speech API + pre-recorded native speaker clips |
| Sound Mixing | Web Audio API (DJ Booth feature) |
| Animations | Framer Motion |
| Payments | Paystack |
| Deployment | Vercel |

---

## Core Characters

### Àmì
- A bright, curious 6-year-old Nigerian girl
- Relatable human guide — the child the user "plays as"
- Speaks in a warm, encouraging voice
- Her journey is the story arc thread

### Kòkò (the parrot)
- Àmì's talking parrot companion
- Acts as the **audio avatar** for all phonics sounds — when a letter is tapped, Kòkò "says" it
- In the Story Mode arc: Kòkò has lost his voice and can only get it back as the child learns sounds
- Visually bright, expressive, memorable

---

## Supported Languages

### MVP (launch)
- English (free)
- Yoruba (paid)

### V2
- Igbo
- Hausa

---

## Feature Phases

### MVP — Phonics & Sounds

#### 1. Landing Page
- Hero with Àmì + Kòkò illustration
- App description and language selection preview
- Parent sign-up CTA + School inquiry CTA
- Social proof (placeholder for testimonials)

#### 2. Auth
- Parent account: email/password via Supabase Auth
- School admin account: separate role (`school_admin`) assigned in Supabase
- Child profiles created under parent account (name, age, avatar)

#### 3. Home — Story Hub
- Àmì and Kòkò greet the child on the home screen
- Kòkò is muted/sad (story hook)
- Child picks a language (English or Yoruba in MVP)
- Three mode cards: Phonics, DJ Booth, Story Mode

#### 4. Phonics Mode
- Full alphabet A–Z (English) + equivalent Yoruba letters
- Each letter card: letter visual + illustration + Kòkò audio
- Tap letter → Kòkò animates and "speaks" the sound
- Two audio sources: Web Speech API (fallback) + pre-recorded native clips (primary)
- Letter-to-word association: "A is for Apple / A is for Àgbàdo"
- Simple tracing interaction (CSS/canvas, touch-friendly)

#### 5. DJ Booth (Creativity Mode)
- A "mixing board" UI for young children
- Kids tap letters to layer sounds into a loop
- Web Audio API powers looping, layering, playback

#### 6. Story Mode
- Kòkò lost his voice — to restore it, the child must complete phonics challenges
- Each letter learned lights up a "voice shard" on Kòkò
- MVP arc: 10 letters = Kòkò speaks again (celebration screen)
- Simple scene illustrations per letter (Àmì + Kòkò in Nigerian environments)

#### 7. Parent Dashboard
- Child progress per letter per language
- Daily streak tracker
- Time spent per session
- Language unlock / subscription management (Paystack)

#### 8. School Admin Panel
- Add/manage pupil accounts under school
- View class-level progress reports
- CSV export of progress data
- School-branded welcome screen (logo + school name)

#### 9. Monetisation
- Free tier: English phonics (full A–Z)
- Paid tier (₦1,500/month or ₦15,000/year): Yoruba unlock
- School plan: ₦50,000 flat annual fee per school
- Payment via Paystack (card + bank transfer + USSD)

---

## Database Schema (Supabase)

#[[file:../../supabase/migrations/20240001_initial_schema.sql]]

---

## Folder Structure

```
src/
  app/
    (public)/
      page.tsx                          # Landing page
      auth/login/page.tsx
      auth/signup/page.tsx
    (app)/
      layout.tsx                        # Auth-protected layout
      home/page.tsx                     # Story Hub
      phonics/page.tsx                  # Language selector
      phonics/[language]/page.tsx       # A-Z grid
      phonics/[language]/[letter]/page.tsx
      dj-booth/page.tsx
      story/page.tsx
      dashboard/parent/page.tsx
      dashboard/school/page.tsx
      settings/page.tsx
  components/
    characters/Ami.tsx
    characters/Koko.tsx
    phonics/LetterCard.tsx
    phonics/SoundButton.tsx
    phonics/TracingCanvas.tsx
    phonics/LetterDetail.tsx
    dj/MixingBoard.tsx
    dj/SoundPad.tsx
    story/StoryScene.tsx
    story/VoiceShard.tsx
    ui/LanguagePicker.tsx
    ui/ProgressBar.tsx
    ui/StreakBadge.tsx
  lib/
    supabase/client.ts
    supabase/server.ts
    supabase/database.types.ts
    audio/speech.ts
    audio/clips.ts
    audio/mixer.ts
    paystack/client.ts
  hooks/
    useChild.ts
    useProgress.ts
    useAudio.ts
  types/index.ts
```

---

## Story Mode Arc (MVP)

**"Kòkò Lost His Voice"**

> Àmì wakes up one morning and finds Kòkò silent. His voice has scattered into 10 sound shards,
> hidden inside the letters of the alphabet. Together, Àmì and the child must travel through
> Letter Land, collect each shard, and restore Kòkò's voice.

- 10 letters → 10 shards → celebration screen
- Each shard collected = Kòkò can say one more sound
- Final screen: full Kòkò song (all letters strung into a melody)

---

## MVP Success Metrics

- 100 parent sign-ups in first month
- 3 school partnerships in first quarter
- 70%+ of MVP users complete at least 5 letters
- Kòkò story arc completion rate > 40%
