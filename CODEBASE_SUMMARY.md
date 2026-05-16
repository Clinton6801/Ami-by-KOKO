# Àmì by Kòkò — Codebase Summary

This document describes everything built for the Àmì by Kòkò MVP — a multilingual phonics and early learning web app for African children aged 0–8.

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
| Deployment | Vercel (live) |

---

## Repository & Deployment

- GitHub: https://github.com/Clinton6801/Ami-by-KOKO
- Supabase: linked and live
- Vercel: deployed and live

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
      page.tsx                        # Landing page (full marketing page) — uses <img> not <Image fill>
      layout.tsx                      # Public layout wrapper
      auth/
        login/page.tsx                # Email/password login + show/hide password
        signup/page.tsx               # Signup with role selector (Parent / School), confirm password
        confirm/page.tsx              # Email confirmation holding page
        reset-password/page.tsx       # Forgot password — sends Supabase reset email
        update-password/page.tsx      # Set new password after reset link
        callback/route.ts             # Supabase auth callback (email confirmation redirect)
      student-login/page.tsx          # 3-step child login: school code → pick name → PIN pad
                                      # Uses <img> not <Image fill> (React 19 JSX fix)
    (app)/
      layout.tsx                      # Auth-protected layout — verifies session, renders AppNav + BottomNav
      home/page.tsx                   # Story Hub — hero card, mode cards, assignments, stats, child switcher
      literacy/page.tsx               # Redirects to /phonics
      phonics/
        page.tsx                      # Language selector (English free, Yorùbá gated by subscription)
        [language]/page.tsx           # A–Z phonics grid with OpenMoji images
        [language]/[letter]/page.tsx  # Letter detail page
      numeracy/
        page.tsx                      # Language selector for numbers
        [language]/page.tsx           # Number grid
        [language]/[number]/page.tsx  # Number detail page
      world/
        page.tsx                      # Category grid (body, animals, fruits, objects, weather)
        [category]/page.tsx           # Items in a category
        [category]/[item]/page.tsx    # Item detail
      dj-booth/page.tsx               # DJ Booth — Web Audio API mixing board
      story/page.tsx                  # Story Mode — "Kòkò Lost His Voice" arc
      assignment/[id]/page.tsx        # Assignment activity — sequential items with audio + tracing
      dashboard/
        parent/page.tsx               # Parent dashboard — progress, streak, letter grid, child switcher
        school/page.tsx               # School admin panel — 4 tabs: Overview, Students, Assignments, Reports
                                      # Delete now routes through /api/school/students (service role)
      school-setup/page.tsx           # First-time school creation — calls /api/school/create (service role)
      settings/page.tsx               # Account, child profiles, language packs, sign out
    api/
      paystack/
        webhook/route.ts              # Paystack webhook — verifies HMAC, activates subscription in DB
      school/
        create/route.ts               # POST — creates school + links profile (service role, bypasses RLS)
        students/route.ts             # POST/PATCH/DELETE — manage school students (service role, bypasses RLS)
  components/
    characters/
      Ami.tsx                         # Àmì character component (Framer Motion, emoji placeholder)
      Koko.tsx                        # Kòkò character component (speaking/muted states)
    phonics/
      LetterCard.tsx                  # Tappable letter card in A–Z grid
      LetterDetail.tsx                # Full letter page — sound, image, correct/incorrect check, tracing
      SoundButton.tsx                 # Kòkò sound button — plays clip or TTS
      TracingCanvas.tsx               # Guided letter tracing with waypoint validation
    dj/
      MixingBoard.tsx                 # DJ Booth UI — 8 pads, status bar, stop all
      SoundPad.tsx                    # Individual pad with active glow animation
    story/
      StoryScene.tsx                  # Story scene display
      VoiceShard.tsx                  # Individual shard component
    school/
      StudentModal.tsx                # Add/edit student modal — calls /api/school/students (no direct Supabase)
      AssignmentModal.tsx             # Create/edit assignment modal
    ui/
      AppNav.tsx                      # Sticky nav — back button, home icon, sign out dropdown with confirm
      BottomNav.tsx                   # Fixed bottom nav (different tabs for parent vs school admin)
      Certificate.tsx                 # Canvas-rendered completion certificate (download as PNG)
      ComingSoonOverlay.tsx           # Overlay for locked/coming-soon features
      CreateChildModal.tsx            # Create child profile modal (avatar, name, age)
      EditChildModal.tsx              # Edit child profile modal
      ErrorBoundary.tsx               # React error boundary — prevents blank screens on Supabase errors
      LanguagePicker.tsx              # Language selector component
      OnboardingFlow.tsx              # 3-step first-login welcome flow
      ProgressBar.tsx                 # Animated progress bar
      StreakBadge.tsx                 # Streak display badge
    landing/
      TryALetter.tsx                  # Interactive phonics demo on landing page (no sign-up needed)
  hooks/
    useChild.ts                       # Fetch/manage child profiles, selectChild, updateChild, refresh
    useProgress.ts                    # Read/write phonics progress per child per language
    useAudio.ts                       # Audio playback state wrapper
    useStreak.ts                      # Calculate consecutive daily streak from sessions table
    useSession.ts                     # Write session rows on mode entry, update ended_at on exit
    useAssignments.ts                 # Fetch active assignments for a school child's class
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
    content/
      world.ts                        # World Knowledge items (24 items, 5 categories) + category config
  middleware.ts                       # Next.js middleware — session refresh + route protection
  types/index.ts                      # All shared TypeScript types + curriculum constants
supabase/
  migrations/
    20240001_initial_schema.sql       # Full DB schema + RLS policies + auto-profile trigger
    20240002_curriculum_schema.sql    # Curriculum additions: school_code, class/term/pin on children,
                                      # subject/class/term on progress, assignments + assignment_progress tables
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
| `schools` | School accounts — name, logo, subscription status, school_code |
| `children` | Child profiles under a parent or school — includes class, term, student_pin |
| `progress` | Per-child, per-language, per-letter progress (heard_count, traced_count, mastered, subject, class, term) |
| `sessions` | Mode sessions with start/end timestamps for streak calculation |
| `subscriptions` | Paystack subscription records — plan, reference, active, expires_at |
| `assignments` | School assignments — class, subject, term, activity_type, content_keys, due_date |
| `assignment_progress` | Per-child assignment completion tracking |

### Key behaviours
- `handle_new_user()` trigger auto-creates a `profiles` row on every new auth signup
- `generate_school_code()` trigger auto-generates a unique `AMIK-XXXX` code on school creation
- All tables have Row Level Security enabled
- Parents can only see their own children and progress
- School admins can see all children in their school
- **School creation and student management bypass RLS via service-role API routes** (see below)

---

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/paystack/webhook` | POST | Verifies Paystack HMAC-SHA512, activates subscription on `charge.success` |
| `/api/school/create` | POST | Creates school + links admin profile — uses service role to bypass RLS chicken-and-egg |
| `/api/school/students` | POST | Creates a school student — service role bypasses `children` RLS |
| `/api/school/students` | PATCH | Updates a school student — service role |
| `/api/school/students` | DELETE | Deletes a school student — service role |

All service-role routes verify the caller's session and school_admin role before acting.

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
- Uses plain `<img>` tags (not Next.js `<Image fill>`) for React 19 compatibility

### Student Login (`/student-login`)
- 3-step flow: school code → pick name from grid → 4-digit PIN pad
- No keyboard required — all tap targets ≥ 64×64px
- Session stored in localStorage (no Supabase Auth for students)
- Uses plain `<img>` tags for React 19 compatibility

### Home Screen (`/home`)
- Hero card with Àmì illustration, personalised greeting with child's name
- Child switcher dropdown (appears when 2+ children exist)
- School context badge (class + term) for school children
- Five mode cards: Literacy, Numbers, My World, DJ Booth, Story Mode
- Assignment list for school children (active assignments with start/done state)
- Live stats: letters mastered, day streak, story shards found
- Inline "Add a child" banner when no child profile exists
- First-login onboarding flow (3 steps, shown once)
- School admin sees a different view with quick-action cards

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

### Numeracy Mode (`/numeracy`)
- Language selector (English only for MVP)
- Number grid and detail pages

### My World (`/world`)
- 5 category grid: Body Parts, Animals, Fruits, Objects, Weather
- 24 items total with English + Yorùbá names and OpenMoji illustrations
- Category and item detail pages

### DJ Booth (`/dj-booth`)
- 8 letter pads (A–H) with coloured gradients
- Web Audio API: loads MP3 clips if available, synthesises pentatonic tones if not
- Pads loop when active, glow with animation
- Status bar shows how many sounds are playing
- Stop All button
- Session tracking (writes to `sessions` table)

### Story Mode (`/story`)
- "Kòkò Lost His Voice" arc — 10 letters (A–J) = 10 shards
- Narrative scenes that change as shards are collected (6 milestone scenes)
- Animated Kòkò emoji reacts to progress (😢 → 😮 → 😊 → 😄 → 🥳 → 🎉)
- Progress bar, shard grid, milestone badges
- Certificate component available for completion

### Assignment Activity (`/assignment/[id]`)
- Sequential item-by-item flow (literacy, numeracy, or world)
- Each item: Kòkò auto-speaks on load, tap to hear again, then trace
- Progress saved to `progress` table after each item
- Assignment marked complete in `assignment_progress` after all items done
- Celebration screen on completion

### Parent Dashboard (`/dashboard/parent`)
- Child switcher with Edit button
- Stats: mastered count, day streak, progress %
- Full A–Z letter grid coloured by status (mastered / in progress / not started)
- Subscription section with upgrade link
- Skeleton loading placeholders

### School Admin Panel (`/dashboard/school`)
- 4-tab layout: Overview, Students, Assignments, Reports
- **Overview**: school code display, student count, CSV export
- **Students**: add/edit/delete students (via service-role API), CSV import, grouped by class
- **Assignments**: create/edit assignments, active vs past, per-student completion tracking
- **Reports**: per-student progress bars (mastered letters out of 26)

### School Setup (`/school-setup`)
- First-time school creation for school admins
- Calls `/api/school/create` (service role) — bypasses RLS chicken-and-egg
- Auto-generates `AMIK-XXXX` school code via DB trigger

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

## Bugs Fixed (in this session)

| Bug | Fix |
|---|---|
| Vercel build error: `JSX element class does not support attributes` on `<Image fill>` | Replaced all `<Image fill>` with plain `<img>` tags in `(public)/page.tsx` and `student-login/page.tsx`. Removed unused `Image` imports from those files and `home/page.tsx`. Root cause: React 19 + `@types/react` v19 tightened JSX type checking. |
| `new row violates row-level security policy for table "schools"` on school setup | Created `/api/school/create` route using service role key. School setup page now calls this API instead of inserting directly. Bypasses RLS chicken-and-egg (admin has no `school_id` yet when creating the school). |
| `new row violates row-level security policy for table "children"` when adding school students | Created `/api/school/students` route (POST/PATCH/DELETE) using service role key. `StudentModal` and school dashboard delete now call this API. Bypasses RLS (school children have `school_id` not `parent_id`, so the parent policy blocked inserts). |

---

## RLS Architecture Notes

The `children` and `schools` tables have RLS policies scoped to ownership:
- `children`: `parent_id = auth.uid()` for parents; school admins can SELECT but not INSERT via browser client
- `schools`: school admins can SELECT/UPDATE their own school, but INSERT requires no existing `school_id`

**Pattern for privileged writes**: use a Next.js API route with `SUPABASE_SERVICE_ROLE_KEY`. Always verify the user's session and role server-side before acting. Never expose the service role key to the client.

---

## What Still Needs Work

### Before going live
1. **Audio clips** — record/generate A–Z English clips (ElevenLabs free tier works)
2. **Supabase SMTP** — configure Resend or SendGrid for email delivery
3. **Paystack webhook URL** — set in Paystack dashboard (deployed URL + `/api/paystack/webhook`)
4. **Paystack pricing** — confirm live values in `src/lib/paystack/client.ts`

### Known gaps
- Yorùbá phonics content — letter set and word associations need native speaker review
- Numeracy and World detail pages exist but content depth can be expanded
- No error boundaries on all pages — `ErrorBoundary` component exists but only wraps app layout
- Child profile editing in Settings — `EditChildModal` is wired but needs verification
- CSV import in school dashboard uses browser client directly (may hit RLS on progress writes)
- `database.types.ts` is hand-authored — regenerate with `npx supabase gen types typescript --local` after any schema changes

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
