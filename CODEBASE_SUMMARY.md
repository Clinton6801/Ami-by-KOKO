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
| Database / Auth | Supabase (Postgres + Auth + Storage + Realtime) |
| Animations | Framer Motion |
| Confetti | canvas-confetti |
| Audio (TTS) | Web Speech API + pre-recorded clip fallback |
| Sound Mixing | Web Audio API (DJ Booth) |
| Charts | Recharts (analytics dashboard) |
| Payments | Paystack (inline popup + webhook) |
| Notifications | WhatsApp Cloud API |
| Deployment | Vercel (live) |

---

## Project Structure

```
src/
  app/
    page.tsx                          # Root redirect
    layout.tsx                        # Root layout — OG image, Paystack, PWAManager
    og-image.png/route.tsx            # Dynamic OG image (1200×630)
    globals.css
    (public)/
      page.tsx                        # Landing page — hero, pricing, school CTA, TryALetter
      auth/login|signup|confirm|reset-password|update-password|callback
      student-login/page.tsx          # 3-step child login — shows school logo after code entry
    (app)/
      layout.tsx                      # Auth-protected layout — handles student auth
      home/page.tsx                   # Story Hub — mode cards, Song of the Day, assignments,
                                      # weekly challenge + leaderboard (school children), stats
      literacy/page.tsx               # Redirects to /phonics
      phonics/
        page.tsx                      # Language selector — Yorùbá "Launching soon" badge
        [language]/page.tsx           # A–Z grid — LockedOverlay shimmer on G–Z
        [language]/[letter]/page.tsx  # Letter detail — sound, song, tracing, confetti on correct
      numeracy/
        page.tsx                      # Language selector
        [language]/page.tsx           # Number grid — LockedOverlay shimmer on 4–10
        [language]/[number]/page.tsx  # Server gate wrapper
        [language]/[number]/_content.tsx  # Number detail — counting, song, tracing, number_star cert
      world/
        page.tsx                      # Category grid — LockedOverlay shimmer on locked categories
        [category]/page.tsx           # Items grid + category song banner
        [category]/[item]/page.tsx    # Item detail — world_explorer cert trigger
      dj-booth/page.tsx               # DJ Booth — pads D–H locked
      story/page.tsx                  # Story Mode — shards 4–10 locked, story_hero cert
      assignment/[id]/page.tsx        # Assignment activity — assignment_champion cert trigger
      live-class/[schoolId]/page.tsx  # Student live class view — Supabase Realtime subscriber
      dashboard/
        parent/page.tsx               # Progress (literacy/numeracy/world), streak, certificates gallery
        school/page.tsx               # 6-tab panel: Overview, Students, Assignments, Reports,
                                      # 🔴 Live (teacher controls), 🎯 Challenges
        school/analytics/page.tsx     # Analytics: charts, student table, assignment report
      school-setup/page.tsx           # First-time school creation
      settings/page.tsx               # Account + WhatsApp number, subscription (role-aware)
    api/
      paystack/webhook/route.ts       # charge.success + subscription.create, full logging
      school/create/route.ts          # POST — creates school (service role)
      school/students/route.ts        # POST/PATCH/DELETE — students + Supabase auth accounts
      school/assignments/route.ts     # POST/PATCH — assignments + notify parents
      progress/route.ts               # POST — upsert progress (service role)
      sessions/route.ts               # POST/PATCH — sessions (service role)
      certificates/award/route.ts     # POST — award certificate (service role, ON CONFLICT DO NOTHING)
      notifications/whatsapp/route.ts # POST — send WhatsApp (5 templates) / GET — webhook verify
      notifications/whatsapp/notify/route.ts  # Client proxy — looks up parent phone

  components/
    characters/Ami.tsx, Koko.tsx
    phonics/LetterCard.tsx, LetterDetail.tsx, SoundButton.tsx, TracingCanvas.tsx
    dj/MixingBoard.tsx, SoundPad.tsx
    story/StoryScene.tsx, VoiceShard.tsx
    school/StudentModal.tsx, AssignmentModal.tsx
    numeracy/CountingActivity.tsx
    landing/TryALetter.tsx
    ui/
      AppNav.tsx                      # Amber gradient nav, child avatar, animated dropdown
      BottomNav.tsx                   # 64px, Framer Motion pill indicator, school admin tabs
      Certificate.tsx                 # html2canvas PNG + WhatsApp share + confetti on mount
      ChallengeCard.tsx               # Weekly challenge progress + class leaderboard
      ComingSoonOverlay.tsx
      CreateChildModal.tsx            # Uses live class_config
      EditChildModal.tsx              # Routes school children through service-role API
      ErrorBoundary.tsx, ErrorBoundaryWrapper.tsx
      LanguagePicker.tsx
      LockedOverlay.tsx               # Frosted glass + shimmer + Kòkò peek + ✨ sparkle
      OnboardingFlow.tsx              # 3-step parent first-login welcome
      OnboardingTour.tsx              # 4-step school admin guided tour
      ProgressBar.tsx, StreakBadge.tsx
      PWAManager.tsx                  # SW registration, offline queue flush, install prompt
      SongButton.tsx                  # Plays song MP3 or TTS, Kòkò dancing
      UpgradePrompt.tsx               # Bottom sheet — Explorer/Family plans

  hooks/
    useAccess.ts                      # Client-side paid access check
    useAssignments.ts                 # Fetch active assignments for school child
    useAudio.ts                       # Audio playback state
    useCertificates.ts                # Fetch certs, award via /api/certificates/award
    useChallenges.ts                  # Weekly challenge + class leaderboard for school children
    useChild.ts                       # Child profiles, handles student auth role
    useClassConfig.ts                 # Reads class_config table
    useProgress.ts                    # THREE separate DB queries (literacy/numeracy/world)
    useSchoolAnalytics.ts             # Aggregated school analytics
    useSession.ts                     # Sessions via /api/sessions
    useSong.ts                        # Play song MP3 or TTS, tracks letter songs for sound_explorer
    useStreak.ts                      # Daily streak, awards weekly_streak cert at 7 days

  lib/
    access.ts                         # hasPaidAccess(), isLetterFree(), isNumberFree(), etc.
    awardCertificate.ts               # Client helper — POST /api/certificates/award
    confetti.ts                       # fireConfetti(), fireStreakConfetti() via canvas-confetti
    notifications.ts                  # Server-side sendWhatsAppNotification()
    offlineQueue.ts                   # queueProgress(), flushQueue()
    api/errors.ts                     # friendlyError() — sanitises DB errors
    audio/clips.ts, mixer.ts, songs.ts, speech.ts
    content/world.ts                  # 24 world items + category config
    paystack/client.ts                # PAYSTACK_PLANS, openPaystackPopup()
    supabase/client.ts, server.ts, middleware.ts, database.types.ts, getAccessContext.ts

  middleware.ts                       # Route protection — includes /live-class
  types/index.ts                      # All types + Sprout 1/2 curriculum + 8 CertificateTypes

supabase/
  migrations/
    20240001_initial_schema.sql       # Full schema + RLS + triggers
    20240002_curriculum_schema.sql    # school_code, class/term/pin, assignments
    20240003_student_auth.sql         # auth_user_id, student RLS policies
    20240004_certificates.sql         # certificates, profiles columns, class_config, brand_color
    20240005_challenges.sql           # challenges + challenge_progress tables + RLS

public/
  ami-koko.svg, favicon.svg, manifest.json, robots.txt
  offline.html, sw.js
  audio/
    english/README.md                 # A–Z letter clips (not yet recorded)
    yoruba/README.md
    songs/
      letters/                        # ✅ ALL 26 letter songs recorded (a-song.mp3 → z-song.mp3)
      numbers/                        # ✅ ALL 10 number songs recorded (1-song.mp3 → 10-song.mp3)
      world/                          # ✅ ALL 5 world songs recorded (body, animals, fruits, objects, weather)

SONG_LYRICS.md                        # Complete lyrics for all 41 songs
CONTEXT.md                            # Agent context file
```

---

## Database Schema

### Tables

| Table | Purpose |
|---|---|
| `profiles` | role, full_name, school_id, phone_number, whatsapp_notifications, onboarding_complete |
| `schools` | name, logo_url, subscription_active, school_code, brand_color |
| `children` | parent_id or school_id, class, term, student_pin, auth_user_id |
| `progress` | letter, subject (literacy/numeracy/world/songs), heard_count, traced_count, mastered |
| `sessions` | mode sessions with start/end timestamps |
| `subscriptions` | Paystack subscription records |
| `assignments` | class, subject, term, activity_type, content_keys, due_date |
| `assignment_progress` | per-child assignment completion |
| `certificates` | child_id, type (8 types), earned_at — unique per child per type |
| `class_config` | which classes are active (sprout_1 = true, others = false) |
| `challenges` | school weekly challenges — metric, target_count, week_start, week_end |
| `challenge_progress` | per-child challenge progress and completion |

---

## Certificate System (8 types)

| Certificate | Icon | Trigger | Condition |
|---|---|---|---|
| `first_steps` | 👣 | `useProgress.ts` | A–F all mastered (literacy) |
| `letter_master` | 🔤 | `useProgress.ts` | All 26 letters mastered |
| `number_star` | ⭐ | `numeracy/_content.tsx` | All 10 numbers mastered |
| `world_explorer` | 🌍 | `world/[item]/page.tsx` | All 24 world items mastered |
| `story_hero` | 🦜 | `story/page.tsx` | All 10 shards collected (paid) |
| `assignment_champion` | 📝 | `assignment/[id]/page.tsx` | 5+ assignments completed |
| `weekly_streak` | 🔥 | `useStreak.ts` | Streak ≥ 7 days |
| `sound_explorer` | 🎵 | `useSong.ts` | All 26 letter songs played |

All awards go through `/api/certificates/award` (service role). Duplicates silently skipped. Certificate modal fires `fireConfetti()` on mount.

---

## Payment Gating

| Feature | Free | Paid (Explorer+) |
|---|---|---|
| Letters | A–F | G–Z |
| Numbers | 1–3 | 4–10 |
| World | Body Parts | Animals, Fruits, Objects, Weather |
| Story shards | 1–3 | 4–10 |
| DJ pads | A–C | D–H |
| Songs | A–F letters, 1–3 numbers, Body Parts, Song of the Day | G–Z letters, 4–10 numbers, other categories |
| Languages | English | Yorùbá (coming soon) |

Locked content shows `LockedOverlay` — frosted glass + shimmer + Kòkò peek + ✨ sparkle.
School children with `schools.subscription_active = true` bypass all gating.

---

## Phases Completed

| Phase | Status | Summary |
|---|---|---|
| Phase 1 — Songs | ✅ | All 41 songs recorded and live |
| Phase 2 — Certificates | ✅ | 8 types, gallery, milestone detection, confetti |
| Phase 3 — WhatsApp | ✅ | 5 templates, phone field, 4 triggers |
| Phase 4 — PWA/Offline | ✅ | Service worker, offline.html, offlineQueue, install prompt |
| Phase 5 — Onboarding Tour | ✅ | 4-step school admin tour |
| Phase 6 — Sprout 2 | ✅ | Content built, locked behind Coming Soon |
| Phase 7 — Analytics | ✅ | Recharts dashboard, student table, weekly progress |
| Phase 8 — School Branding | ✅ | Logo on student login, brand_color stored |
| Phase 9 — Yorùbá Coming Soon | ✅ | "Launching soon" badge |
| Phase 10 — Live Class Mode | ✅ | Supabase Realtime, teacher controls, student view |
| Phase 11 — Leaderboard + Challenges | ✅ | Weekly challenges, top 5 leaderboard, school admin management |
| UI/UX Polish | ✅ | Amber nav, LockedOverlay shimmer, confetti, BottomNav pill |

### Remaining
- Phase 12 — Mobile App (Capacitor)

---

## Audio Status

### Songs — ALL COMPLETE ✅
- 26 letter songs (a-song.mp3 → z-song.mp3)
- 10 number songs (1-song.mp3 → 10-song.mp3)
- 5 world songs (body, animals, fruits, objects, weather)

### Letter Clips — Pending ⏳
- `/public/audio/english/[a-z].mp3` — 26 files (Kòkò phonics sounds, not songs)
- Falls back to Web Speech API TTS automatically

---

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/paystack/webhook` | POST | charge.success + subscription.create |
| `/api/school/create` | POST | Creates school (service role) |
| `/api/school/students` | POST/PATCH/DELETE | Students + Supabase auth accounts |
| `/api/school/assignments` | POST/PATCH | Assignments + notify parents |
| `/api/progress` | POST | Upsert progress (service role) |
| `/api/sessions` | POST/PATCH | Sessions (service role) |
| `/api/certificates/award` | POST | Award certificate (service role) |
| `/api/notifications/whatsapp` | POST/GET | Send WhatsApp / webhook verify |
| `/api/notifications/whatsapp/notify` | POST | Client proxy — looks up parent phone |

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
PAYSTACK_SECRET_KEY
NEXT_PUBLIC_APP_URL
WHATSAPP_PHONE_NUMBER_ID        # pending
WHATSAPP_ACCESS_TOKEN           # pending
WHATSAPP_WEBHOOK_VERIFY_TOKEN   # pending
```

---

## Pending Manual Steps

1. **Run Migration 005** in Supabase SQL Editor (`supabase/migrations/20240005_challenges.sql`) — creates challenges + challenge_progress tables
2. **WhatsApp API keys** — add to Vercel env vars when ready
3. **Letter audio clips** — record A–Z phonics sounds for `/public/audio/english/`
4. **Kòkò celebration song** — `public/audio/songs/world/koko-restored.mp3`

---

## Brand

- **Primary**: amber `#F59E0B` — Kòkò's energy
- **Secondary**: forest green `#166534` — Àmì's world
- **Accent**: coral/rose `#F43F5E` — celebration
- **Background**: soft cream `#FEFCE8`
- Nav: amber gradient `#FEF3C7 → #FDE68A → #FEF9C3`
- Minimum 48×48px tap targets, 64×64px on student screens
- BottomNav: 64px height, Framer Motion pill indicator
