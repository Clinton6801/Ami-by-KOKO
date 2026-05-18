# Àmì by Kòkò — Codebase Summary

A multilingual phonics and early learning web app for African children aged 0–8.
Built with Next.js 16, TypeScript, Tailwind CSS v4, Supabase, Paystack, and Vercel.

---

## Live App
https://ami-by-koko.vercel.app

## Repository
https://github.com/Clinton6801/Ami-by-KOKO

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
| Charts | Recharts (analytics dashboard) |
| Payments | Paystack (inline popup + webhook) |
| Notifications | WhatsApp Cloud API |
| Deployment | Vercel (live) |

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
    layout.tsx                        # Root layout — metadata, OG tags, Paystack script, PWAManager
    globals.css                       # Tailwind v4 @theme tokens, brand colours
    (public)/
      page.tsx                        # Landing page — hero, pricing table, school CTA, TryALetter demo
      layout.tsx                      # Public layout wrapper
      auth/
        login/page.tsx                # Email/password login
        signup/page.tsx               # Signup with role selector + WhatsApp number field
        confirm/page.tsx              # Email confirmation holding page
        reset-password/page.tsx       # Forgot password
        update-password/page.tsx      # Set new password after reset
        callback/route.ts             # Supabase auth callback
      student-login/page.tsx          # 3-step child login: school code → pick name → PIN pad
                                      # Shows school logo + name after code entry (Phase 8 branding)
    (app)/
      layout.tsx                      # Auth-protected layout — verifies session, handles student auth
      home/page.tsx                   # Story Hub — hero, mode cards, Song of the Day, assignments, stats
      literacy/page.tsx               # Redirects to /phonics
      phonics/
        page.tsx                      # Language selector — Yorùbá shows "Launching soon" badge
        [language]/page.tsx           # A–Z grid with lock overlays (G–Z locked for free users)
        [language]/[letter]/page.tsx  # Letter detail — sound, song, image, tracing (server-side gate)
      numeracy/
        page.tsx                      # Language selector
        [language]/page.tsx           # Number grid with lock overlays (4–10 locked for free users)
        [language]/[number]/page.tsx  # Server-side gate wrapper
        [language]/[number]/_content.tsx  # Number detail — sound, counting activity, song, tracing
      world/
        page.tsx                      # Category grid with lock overlays (body free, rest locked)
        [category]/page.tsx           # Items grid + category song banner
        [category]/[item]/page.tsx    # Item detail — sound, "I know this!" button, progress saved
      dj-booth/page.tsx               # DJ Booth — pads D–H locked for free users
      story/page.tsx                  # Story Mode — shards 4–10 locked, celebration song, certificate
      assignment/[id]/page.tsx        # Assignment activity — sequential items, WhatsApp notify on complete
      dashboard/
        parent/page.tsx               # Progress, streak, letter grid, certificates gallery, milestone flow
        school/page.tsx               # 4-tab panel: Overview, Students, Assignments, Reports
                                      # + OnboardingTour for new admins
        school/analytics/page.tsx     # Analytics: class stats, letter mastery chart, student table,
                                      # weekly progress chart, assignment report (Phase 7)
      school-setup/page.tsx           # First-time school creation (service role API)
      settings/page.tsx               # Account + WhatsApp number, child profiles, subscription
                                      # School admins see school plan summary, never Explorer/Family pricing
    api/
      paystack/
        webhook/route.ts              # Paystack webhook — handles charge.success + subscription.create
                                      # Direct profiles query, onConflict upsert, full logging
      school/
        create/route.ts               # POST — creates school + links profile (service role)
        students/route.ts             # POST/PATCH/DELETE — manage students + Supabase auth accounts
        assignments/route.ts          # POST/PATCH — create/update assignments + notify parents
      progress/route.ts               # POST — upsert progress (service role, works for school children)
      sessions/route.ts               # POST/PATCH — start/end sessions (service role)
      notifications/
        whatsapp/route.ts             # POST — sends WhatsApp message via Cloud API (5 templates)
                                      # GET — webhook verification
        whatsapp/notify/route.ts      # POST — client proxy: looks up parent phone, calls main route

  components/
    characters/
      Ami.tsx                         # Àmì character (Framer Motion, emoji placeholder)
      Koko.tsx                        # Kòkò parrot — speaking/muted states
    phonics/
      LetterCard.tsx                  # Tappable letter card in A–Z grid
      LetterDetail.tsx                # Full letter page — sound, song button, tracing, correct/incorrect
      SoundButton.tsx                 # Kòkò sound button
      TracingCanvas.tsx               # Waypoint-based letter tracing canvas
    dj/
      MixingBoard.tsx                 # DJ Booth — 8 pads, pads D–H locked for free users
      SoundPad.tsx                    # Individual pad with glow animation
    story/
      StoryScene.tsx                  # Story scene display
      VoiceShard.tsx                  # Individual shard component
    school/
      StudentModal.tsx                # Add/edit student — uses /api/school/students, class config aware
      AssignmentModal.tsx             # Create/edit assignment — uses /api/school/assignments
    numeracy/
      CountingActivity.tsx            # Tap-to-count fruit activity
    landing/
      TryALetter.tsx                  # Interactive phonics demo on landing (no sign-up needed)
    ui/
      AppNav.tsx                      # Sticky top nav — back, home, profile dropdown, sign out
      BottomNav.tsx                   # Fixed bottom nav — parent nav + school admin nav with Analytics tab
      Certificate.tsx                 # html2canvas certificate — download PNG + WhatsApp share
      ComingSoonOverlay.tsx           # Coming Soon overlay for locked features
      CreateChildModal.tsx            # Create child — uses live class_config for class selector
      EditChildModal.tsx              # Edit child — routes school children through service-role API
      ErrorBoundary.tsx               # React class error boundary
      ErrorBoundaryWrapper.tsx        # Client wrapper for use in server layouts
      LanguagePicker.tsx              # Language selector
      OnboardingFlow.tsx              # 3-step parent first-login welcome
      OnboardingTour.tsx              # 4-step school admin guided tour (Phase 5)
                                      # Steps: welcome+code, logo upload, add student, create assignment
                                      # Sets onboarding_complete = true on finish
      ProgressBar.tsx                 # Animated progress bar
      PWAManager.tsx                  # Service worker registration, offline queue flush, install prompt
      SongButton.tsx                  # Plays song MP3 or TTS fallback, Kòkò dancing animation
      StreakBadge.tsx                 # Streak display badge
      UpgradePrompt.tsx               # Bottom sheet upgrade prompt — Explorer/Family plans

  hooks/
    useAccess.ts                      # Client-side paid access check (subscription + school)
    useAssignments.ts                 # Fetch active assignments for a school child's class
    useAudio.ts                       # Audio playback state wrapper
    useCertificates.ts                # Fetch/award certificates, WhatsApp notify on award
    useChild.ts                       # Fetch/manage child profiles, handles student auth role
    useClassConfig.ts                 # Reads class_config table — active vs coming soon classes
    useProgress.ts                    # Read/write progress, milestone detection (first_steps, letter_master)
    useSchoolAnalytics.ts             # Aggregated school analytics — per-student, letter mastery, weekly
    useSession.ts                     # Write sessions via /api/sessions (service role)
    useSong.ts                        # Play song MP3 or TTS fallback
    useStreak.ts                      # Calculate daily streak, fires 7-day WhatsApp notification

  lib/
    access.ts                         # hasPaidAccess(), isLetterFree(), isNumberFree(), isCategoryFree(),
                                      # isShardFree(), isPadFree()
    notifications.ts                  # Server-side sendWhatsAppNotification() helper
    offlineQueue.ts                   # queueProgress(), flushQueue() for offline progress storage
    api/
      errors.ts                       # friendlyError() — sanitises DB errors before sending to client
    audio/
      clips.ts                        # LETTER_DATA — 26 letters with English/Yorùbá words + OpenMoji URLs
      mixer.ts                        # Web Audio API mixer for DJ Booth
      songs.ts                        # Song data — 26 letter songs, 10 number songs, 5 world songs,
                                      # celebration song, getSongOfTheDay()
      speech.ts                       # Web Speech API TTS fallback
    content/
      world.ts                        # 24 world items (5 categories) + category config
    paystack/
      client.ts                       # PAYSTACK_PLANS, openPaystackPopup(), generateReference()
    supabase/
      client.ts                       # Browser Supabase client
      server.ts                       # Server Supabase client (cookie-based)
      middleware.ts                   # updateSession() — session refresh + route protection
      database.types.ts               # Hand-authored DB types (all 8 tables including certificates)
      getAccessContext.ts             # Server-side access check for Server Components

  middleware.ts                       # Next.js middleware — session refresh + route protection
  types/index.ts                      # All shared types + curriculum constants (Sprout 1 + Sprout 2)
                                      # CertificateType, CERTIFICATE_CONFIGS, ClassConfig

supabase/
  migrations/
    20240001_initial_schema.sql       # Full DB schema + RLS + auto-profile trigger
    20240002_curriculum_schema.sql    # school_code, class/term/pin on children, assignments tables
    20240003_student_auth.sql         # auth_user_id on children, student RLS policies
  config.toml

public/
  ami-koko.svg                        # Àmì + Kòkò illustration
  favicon.svg
  manifest.json                       # PWA manifest
  robots.txt
  offline.html                        # Offline fallback page with Kòkò and retry button
  sw.js                               # Service worker — caches pages, audio (cache-first), assets
  audio/
    english/README.md                 # Instructions for A–Z MP3 clips
    yoruba/README.md                  # Instructions for Yorùbá clips
    songs/
      letters/README.md               # 26 letter song MP3 slots (a-song.mp3 … z-song.mp3)
      numbers/README.md               # 10 number song MP3 slots
      world/README.md                 # 5 category songs + koko-restored.mp3

.kiro/
  specs/
    ami-koko-mvp.md
    MASTER_ROADMAP_SPEC.md
    PAYMENT_GATING_UPDATE.md
    STUDENT_AUTH_UPDATE.md
  steering/
    product-identity.md
    tech-stack.md
    mvp-scope.md
```

---

## Database Schema

### Tables

| Table | Purpose |
|---|---|
| `profiles` | Extends auth.users — role, full_name, school_id, phone_number, whatsapp_notifications, onboarding_complete |
| `schools` | School accounts — name, logo_url, subscription_active, school_code, brand_color |
| `children` | Child profiles — parent_id or school_id, class, term, student_pin, auth_user_id |
| `progress` | Per-child progress — letter, subject, heard_count, traced_count, mastered, class, term |
| `sessions` | Mode sessions with start/end timestamps |
| `subscriptions` | Paystack subscription records |
| `assignments` | School assignments — class, subject, term, activity_type, content_keys, due_date |
| `assignment_progress` | Per-child assignment completion |
| `certificates` | Earned certificates — child_id, type, earned_at (unique per child per type) |
| `class_config` | Which classes are active (sprout_1 = true, others = false) |

### Key behaviours
- `handle_new_user()` trigger auto-creates a `profiles` row on every new auth signup
- `generate_school_code()` trigger auto-generates `AMIK-XXXX` on school creation
- All tables have RLS enabled
- Student auth: synthetic email `{child_id}@students.amibykoko.com`, password `{school_id}-{pin}`

---

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/paystack/webhook` | POST | Handles charge.success + subscription.create, direct profiles query, full logging |
| `/api/school/create` | POST | Creates school + links admin profile (service role) |
| `/api/school/students` | POST/PATCH/DELETE | Manage students + Supabase auth accounts (service role) |
| `/api/school/assignments` | POST/PATCH | Create/update assignments + notify parents via WhatsApp |
| `/api/progress` | POST | Upsert progress (service role — works for school children) |
| `/api/sessions` | POST/PATCH | Start/end sessions (service role) |
| `/api/notifications/whatsapp` | POST | Send WhatsApp message via Cloud API |
| `/api/notifications/whatsapp` | GET | Webhook verification |
| `/api/notifications/whatsapp/notify` | POST | Client proxy — looks up parent phone, sends notification |

---

## Features Built

### Phase 1 — Songs ✅
- `src/lib/audio/songs.ts` — 26 letter songs (African word associations), 10 number songs, 5 world category songs, celebration song, `getSongOfTheDay()`
- `useSong` hook — plays MP3 if available, falls back to Web Speech API TTS
- `SongButton` component — Kòkò dancing animation, stop/play toggle, locked state
- Letter detail: "🎵 Sing with Kòkò" button (A–F free, G–Z locked)
- Number detail: "🎵 Count with Kòkò" button (1–3 free, 4–10 locked)
- World category page: "🎵 Sing the [Category] song" banner (Body Parts free, rest locked)
- Story page: celebration song plays when all 10 shards collected (always free)
- Home page: "🎵 Song of the Day" card — rotates daily through A–Z, always free

### Phase 2 — Progress Certificates ✅
- `useCertificates` hook — fetch/award certificates, WhatsApp notify on award
- `Certificate.tsx` — html2canvas PNG download + WhatsApp share
- 7 certificate types: first_steps, letter_master, number_star, world_explorer, story_hero, assignment_champion, weekly_streak
- `useProgress` detects first_steps (A–F mastered) and letter_master (all 26) milestones
- Parent dashboard: "🏆 My Certificates" gallery with view/download per cert
- Story page: awards story_hero certificate on completion
- `CERTIFICATE_CONFIGS` in types for consistent copy across all cert triggers

### Phase 3 — WhatsApp Notifications ✅
- `/api/notifications/whatsapp` — 5 message templates (assignment_complete, new_assignment, milestone, streak, generic)
- `/api/notifications/whatsapp/notify` — client-callable proxy
- Phone number field on signup page and settings Account section
- Notifications wired into: assignment completion, certificate award, 7-day streak, new assignment creation
- Silently skips if no phone number saved or notifications disabled

### Phase 4 — PWA / Offline ✅
- `public/sw.js` — service worker: pages (network-first), audio (cache-first), assets
- `public/offline.html` — friendly offline page with Kòkò and retry button
- `src/lib/offlineQueue.ts` — `queueProgress()` / `flushQueue()` for offline progress
- `PWAManager.tsx` — SW registration (production only), syncing indicator, install prompt after 3rd session

### Phase 5 — School Admin Onboarding Tour ✅
- `OnboardingTour.tsx` — 4-step guided tour for new school admins
- Steps: welcome + school code display, logo upload to Supabase Storage, add student guide, create assignment guide
- Shown when `profiles.onboarding_complete = false` AND role = school_admin
- Sets `onboarding_complete = true` on completion

### Phase 6 — Sprout 2 Curriculum ✅
- Sprout 2 content in `types/index.ts`: literacy (blending + digraphs), numeracy (1–20, addition, shapes), world (community helpers, Nigerian foods, environment)
- `useClassConfig` hook reads `class_config` table — active classes accessible, inactive show Coming Soon
- `CreateChildModal` and `StudentModal` use live class config (not hardcoded)
- Sprout 1 content unchanged

### Phase 7 — Analytics Dashboard ✅
- `/dashboard/school/analytics` — class overview stats, letter mastery bar chart (recharts), weekly progress line chart, sortable student table, assignment completion report
- `useSchoolAnalytics` hook — full aggregation: per-student stats, letter mastery %, weekly progress
- Analytics tab added to school admin bottom navigation

### Phase 8 — School Branding ✅
- Student login fetches `logo_url` and `brand_color` after school code entry
- School logo displayed in header; school name shown instead of "Àmì by Kòkò"
- `OnboardingTour` step 2 uploads logo to Supabase Storage `school-logos` bucket

### Phase 9 — Yorùbá Coming Soon ✅
- Yorùbá option on phonics language selector shows "Launching soon — recordings in progress" badge
- Audio directory structure ready at `public/audio/yoruba/`

### Credit 7 — Settings + Webhook Fixes ✅
- Settings: school admins see school plan summary (name, active status, pupil count, features, WhatsApp upgrade link) — never see Explorer/Family pricing
- Paystack webhook: `console.log` at every step, direct profiles query, `onConflict: 'profile_id'`, handles both `charge.success` and `subscription.create`, returns 500 on DB failure

---

## Payment Gating

| Feature | Free | Paid (Explorer+) |
|---|---|---|
| Letters | A–F | G–Z |
| Numbers | 1–3 | 4–10 |
| World | Body Parts | Animals, Fruits, Objects, Weather |
| Story shards | 1–3 | 4–10 |
| DJ pads | A–C | D–H |
| Languages | English | Yorùbá (coming soon) |
| Songs | A–F letters, 1–3 numbers, Body Parts, Song of the Day | G–Z letters, 4–10 numbers, other categories |

School children with `schools.subscription_active = true` bypass all gating.

---

## RLS Architecture

All privileged writes (school children, sessions, progress for school children) go through Next.js API routes using the service role key. The browser client (anon key) is used for reads and parent-owned writes only.

**Service-role routes:** `/api/school/create`, `/api/school/students`, `/api/school/assignments`, `/api/progress`, `/api/sessions`

---

## Audio Strategy

1. **Primary**: pre-recorded native speaker clips at `/public/audio/[language]/[letter].mp3`
2. **Songs**: pre-recorded at `/public/audio/songs/[type]/[key]-song.mp3`
3. **Fallback**: Web Speech API TTS — always works
4. **DJ Booth**: Web Audio API synthesised tones when no MP3s exist

**Audio clips needed** (not yet recorded):
- `/public/audio/english/a.mp3` through `z.mp3` — 26 files
- `/public/audio/songs/letters/a-song.mp3` through `z-song.mp3` — 26 files
- `/public/audio/songs/numbers/1-song.mp3` through `10-song.mp3` — 10 files
- `/public/audio/songs/world/[category]-song.mp3` — 5 files + `koko-restored.mp3`
- `/public/audio/yoruba/` — Yorùbá clips (after language launches)

---

## Supabase Migrations Run

| Migration | Contents |
|---|---|
| `20240001_initial_schema.sql` | Full schema: profiles, schools, children, progress, sessions, subscriptions + RLS + auto-profile trigger |
| `20240002_curriculum_schema.sql` | school_code, class/term/pin on children, subject/class/term on progress, assignments, assignment_progress |
| `20240003_student_auth.sql` | auth_user_id on children, student RLS policies |

**Migrations to run manually in Supabase SQL Editor** (from MASTER_ROADMAP_SPEC.md):
- Migration 003 (certificates table) — already in DB per codebase
- Migration 004 (phone_number, whatsapp_notifications, onboarding_complete on profiles) — already run
- Migration 005 (brand_color on schools) — already run
- Migration 006 (class_config table) — already run

---

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
PAYSTACK_SECRET_KEY
NEXT_PUBLIC_APP_URL
WHATSAPP_PHONE_NUMBER_ID        # Phase 3 — WhatsApp Cloud API
WHATSAPP_ACCESS_TOKEN           # Phase 3
WHATSAPP_WEBHOOK_VERIFY_TOKEN   # Phase 3
```

---

## What Still Needs Work

### Before going live
1. **Audio clips** — record/generate A–Z English clips + all song clips
2. **Paystack webhook URL** — set in Paystack dashboard: `https://ami-by-koko.vercel.app/api/paystack/webhook`
3. **WhatsApp Cloud API** — create Meta for Developers account, get phone number ID + access token
4. **Supabase SMTP** — configure Resend or SendGrid for email delivery

### Remaining roadmap phases (not yet built)
- Phase 10 — Live Class Mode (Supabase Realtime)
- Phase 11 — Leaderboard + Class Challenges
- Phase 12 — Mobile App (Capacitor)

### Known gaps
- Yorùbá phonics content — letter set and word associations need native speaker review
- `database.types.ts` is hand-authored — regenerate with `npx supabase gen types typescript --project-id cghbfovahfajmcpcrzeu`
- CSV import in school dashboard still uses browser client for some operations
- No error boundaries on individual pages (only at layout level)

---

## Brand

- **Primary**: amber `#F59E0B` — Kòkò's energy
- **Secondary**: forest green `#166534` — Àmì's world
- **Accent**: coral/rose `#F43F5E` — celebration
- **Background**: soft cream `#FEFCE8`
- All interactive elements: minimum 48×48px tap targets
- Touch-first design — primary device is mobile
