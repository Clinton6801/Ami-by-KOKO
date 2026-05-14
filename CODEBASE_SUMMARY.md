# Àmì by Kòkò — Codebase Summary

This document describes everything built so far for the Àmì by Kòkò MVP — a multilingual phonics and early learning web app for African children aged 0–8.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Database / Auth | Supabase (Postgres + Auth + Storage) |
| Animations | Framer Motion |
| Audio (TTS) | Web Speech API + pre-recorded clip fallback |
| Sound Mixing | Web Audio API (DJ Booth) |
| Payments | Paystack (inline popup + webhook) |
| Deployment | Vercel (configured, not yet deployed) |

---

## Repository

GitHub: https://github.com/Clinton6801/Ami-by-KOKO

---

## Characters

- **Àmì** — a curious 6-year-old African girl, the child the user plays alongside
- **Kòkò** — her talking parrot companion, the audio avatar of the app. In Story Mode, Kòkò has lost his voice and the child must master letters to restore it.

---

## Project Structure

```
src/
  app/
    page.tsx                          # Root — redirects auth users to /home, guests see landing
    layout.tsx                        # Root layout — metadata, OG tags, Paystack script
    globals.css                       # Tailwind v4 @theme tokens, brand colours
    (public)/
      page.tsx                        # Landing page (full marketing page)
      layout.tsx                      # Public layout wrapper
      auth/
        login/page.tsx                # Email/password login + show/hide password
        signup/page.tsx               # Signup with role selector (Parent / School), confirm password
        confirm/page.tsx              # Email confirmation holding page
        reset-password/page.tsx       # Forgot password — sends Supabase reset email
        update-password/page.tsx      # Set new password after reset link
        callback/route.ts             # Supabase auth callback (email confirmation redirect)
    (app)/
      layout.tsx                      # Auth-protected layout — verifies session, renders AppNav
      home/page.tsx                   # Story Hub — hero card, mode cards, stats, child switcher
      phonics/
        page.tsx                      # Language selector (English free, Yorùbá gated by subscription)
        [language]/page.tsx           # A–Z phonics grid with OpenMoji images
        [language]/[letter]/page.tsx  # Letter detail page
      dj-booth/page.tsx               # DJ Booth — Web Audio API mixing board
      story/page.tsx                  # Story Mode — "Kòkò Lost His Voice" arc
      dashboard/
        parent/page.tsx               # Parent dashboard — progress, streak, letter grid, child switcher
        school/page.tsx               # School admin panel — pupil list, CSV export
      settings/page.tsx               # Account, child profiles, language packs, sign out
  components/
    characters/
      Ami.tsx                         # Àmì character component (Framer Motion, emoji placeholder)
      Koko.tsx                        # Kòkò character component (speaking/muted states)
    phonics/
      LetterCard.tsx                  # Tappable letter card in A–Z grid
      LetterDetail.tsx                # Full letter page — sound, image, correct/incorrect check
      SoundButton.tsx                 # Kòkò sound button — plays clip or TTS
      TracingCanvas.tsx               # Guided letter tracing with waypoint validation
    dj/
      MixingBoard.tsx                 # DJ Booth UI — 8 pads, status bar, stop all
      SoundPad.tsx                    # Individual pad with active glow animation
    story/
      StoryScene.tsx                  # Story scene display (unused — story is in page.tsx)
      VoiceShard.tsx                  # Individual shard component
    ui/
      AppNav.tsx                      # Sticky nav — back button, home icon, sign out dropdown with confirm
      CreateChildModal.tsx            # Create child profile modal (avatar, name, age)
      EditChildModal.tsx              # Edit child profile modal
      LanguagePicker.tsx              # Language selector component
      ProgressBar.tsx                 # Animated progress bar
      StreakBadge.tsx                 # Streak display badge
      OnboardingFlow.tsx              # 3-step first-login welcome flow
    landing/
      TryALetter.tsx                  # Interactive phonics demo on landing page (no sign-up needed)
  hooks/
    useChild.ts                       # Fetch/manage child profiles, selectChild, updateChild, refresh
    useProgress.ts                    # Read/write phonics progress per child per language
    useAudio.ts                       # Audio playback state wrapper
    useStreak.ts                      # Calculate consecutive daily streak from sessions table
    useSession.ts                     # Write session rows on mode entry, update ended_at on exit
  lib/
    supabase/
      client.ts                       # Browser Supabase client (with Database generic)
      server.ts                       # Server Supabase client (cookie-based)
      middleware.ts                   # updateSession() — refreshes auth on every request
      database.types.ts               # Hand-authored DB types (replace with generated after linking)
    audio/
      speech.ts                       # Web Speech API wrapper — TTS fallback
      clips.ts                        # LETTER_DATA map — all 26 letters with English/Yorùbá/image URLs
      mixer.ts                        # Web Audio API mixer — loads MP3s or synthesises tones
    paystack/
      client.ts                       # Paystack inline popup helper + pricing constants
  middleware.ts                       # Next.js middleware — session refresh + route protection
  types/index.ts                      # All shared TypeScript types
  app/
    api/
      paystack/
        webhook/route.ts              # Paystack webhook — verifies HMAC, activates subscription in DB
supabase/
  migrations/
    20240001_initial_schema.sql       # Full DB schema + RLS policies + auto-profile trigger
  config.toml                         # Local Supabase config
public/
  ami-koko.svg                        # Hand-crafted SVG illustration of Àmì + Kòkò
  favicon.svg                         # SVG favicon (amber circle + parrot emoji)
  manifest.json                       # PWA manifest
  robots.txt                          # SEO robots file
  audio/
    english/README.md                 # Instructions for adding A–Z MP3 clips
    yoruba/README.md                  # Instructions for Yorùbá clips
.kiro/
  specs/ami-koko-mvp.md               # Full MVP spec
  steering/
    product-identity.md               # Characters, brand voice, cultural rules
    tech-stack.md                     # Stack conventions, naming rules
    mvp-scope.md                      # What's in/out of MVP, definition of done
```

---

## Database Schema (Supabase)

### Tables

| Table | Purpose |
|---|---|
| `profiles` | Extends auth.users — role (parent/school_admin), full_name, school_id |
| `schools` | School accounts — name, logo, subscription status |
| `children` | Child profiles under a parent or school |
| `progress` | Per-child, per-language, per-letter progress (heard_count, traced_count, mastered) |
| `sessions` | Mode sessions with start/end timestamps for streak calculation |
| `subscriptions` | Paystack subscription records — plan, reference, active, expires_at |

### Key behaviours
- `handle_new_user()` trigger auto-creates a `profiles` row on every new auth signup
- All tables have Row Level Security enabled
- Parents can only see their own children and progress
- School admins can see all children in their school

---

## Features Built

### Authentication
- Email/password signup with role selector (Parent or School Admin)
- Password confirmation field with live match indicator
- Show/hide password toggle on all password fields
- Email confirmation flow with `/auth/callback` handler
- Forgot password → reset email → update password flow
- Sign out with confirmation step in nav dropdown

### Landing Page (`/`)
- Full marketing page: hero with animated Àmì + Kòkò SVG, floating speech bubble
- Scrolling marquee strip
- Interactive "Try a Letter" demo — tap any of 10 letters, hear Kòkò speak (Web Speech API), see word associations. No sign-up required.
- Feature cards, "How it works" steps, testimonials, school CTA, final CTA
- Authenticated users are redirected to `/home` automatically

### Home Screen (`/home`)
- Hero card with Àmì illustration, personalised greeting with child's name
- Child switcher dropdown (appears when 2+ children exist)
- Three mode cards: Phonics, DJ Booth, Story Mode
- Live stats: letters mastered, day streak, story shards found
- Inline "Add a child" banner (never a popup) when no child profile exists
- First-login onboarding flow (3 steps, shown once)

### Phonics Mode (`/phonics`)
- Language selector — English (free), Yorùbá (subscription-gated via Paystack check)
- A–Z grid with OpenMoji illustrations, uppercase + lowercase on each card, mastered ⭐ indicator
- Letter detail page:
  - Large Aa display with object illustration
  - Kòkò sound button — plays pre-recorded clip or falls back to Web Speech API
  - "Did you get it right?" — ✅ Got it / ❌ Not yet buttons
  - Correct → saves to DB as mastered, auto-navigates to next letter after 1.2s
  - Guided tracing canvas — waypoint-based validation, progress bar, 75% threshold to complete
  - Prev / All / Next letter navigation

### DJ Booth (`/dj-booth`)
- 8 letter pads (A–H) with coloured gradients
- Web Audio API: loads MP3 clips if available, synthesises pentatonic tones if not
- Pads loop when active, glow with animation
- Status bar shows how many sounds are playing
- Stop All button
- Session tracking (writes to `sessions` table)

### Story Mode (`/story`)
- "Kòkò Lost His Voice" arc — 10 letters (A–J) = 10 shards
- Narrative scenes that change as shards are collected (6 milestone scenes with story text)
- Animated Kòkò emoji reacts to progress (😢 → 😮 → 😊 → 😄 → 🥳 → 🎉)
- Progress bar
- Shard grid — collected shards show letter, uncollected show "?"
- Milestone badges list
- CTA to go to Phonics when not complete

### Parent Dashboard (`/dashboard/parent`)
- Child switcher with Edit button
- Stats: mastered count, day streak (calculated from sessions), progress %
- Streak motivational message (changes at 3, 7 days)
- Full A–Z letter grid coloured by status (mastered / in progress / not started)
- Subscription section with upgrade link
- Skeleton loading placeholders while data loads

### School Admin Panel (`/dashboard/school`)
- Pupil list fetched from DB filtered by school_id
- Pupil count stat
- CSV export button (generates and downloads pupils.csv)

### Settings (`/settings`)
- Account section — email display, sign out button
- Child profiles — list with active indicator, tap to switch, Edit button, Add child button
- Language packs — English (free ✓), Yorùbá (Unlock via Paystack), Igbo/Hausa (coming soon)
- App version info

### Payments (Paystack)
- Inline popup for Yorùbá unlock (₦1,500/month)
- `/api/paystack/webhook` — verifies HMAC-SHA512 signature, activates subscription in DB on `charge.success`
- Paystack inline script loaded in root layout

---

## Audio Strategy

1. **Primary**: pre-recorded native speaker clips at `/public/audio/[language]/[letter].mp3`
2. **Fallback**: Web Speech API (TTS) — always works, sounds robotic
3. **DJ Booth**: Web Audio API synthesised tones when no MP3s exist

**Audio clips needed** (not yet recorded):
- `/public/audio/english/a.mp3` through `z.mp3` — 26 files
- `/public/audio/yoruba/` — Yorùbá clips (after language launches)

---

## What Still Needs Work

### Before going live
1. **Audio clips** — record/generate A–Z English clips (ElevenLabs free tier works)
2. **Deploy to Vercel** — connect GitHub repo, add env vars
3. **Supabase SMTP** — configure Resend or SendGrid for email delivery
4. **Paystack webhook URL** — set in Paystack dashboard after deployment

### Known gaps
- Yorùbá phonics content — letter set and word associations need a native speaker review
- Streak calculation works but requires sessions to be written — new users will show 0 until they use a mode
- Child profile editing in Settings page — import for EditChildModal was added but the full wiring needs verification
- No error boundaries — blank screens if Supabase is slow
- No loading skeletons on phonics grid

---

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
PAYSTACK_SECRET_KEY
NEXT_PUBLIC_APP_URL
```

---

## Brand

- **Primary colour**: amber (#F59E0B) — Kòkò's energy
- **Secondary**: forest green (#166534) — Àmì's world
- **Accent**: coral/rose (#F43F5E) — celebration
- **Background**: soft cream (#FEFCE8)
- All interactive elements: minimum 48×48px tap targets
- Touch-first design — primary device is mobile
