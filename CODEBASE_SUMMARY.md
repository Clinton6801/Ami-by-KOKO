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
- **Kòkò** — her talking parrot companion, the audio avatar of the app

---

## Project Structure

```
src/
  app/
    page.tsx                          # Root redirect
    layout.tsx                        # Root layout — OG image meta, Paystack script, PWAManager
    og-image.png/route.tsx            # Dynamic OG image for link previews (1200×630)
    globals.css
    (public)/
      page.tsx                        # Landing page — hero, pricing table, school CTA, TryALetter demo
      auth/login|signup|confirm|reset-password|update-password|callback
      student-login/page.tsx          # 3-step child login — shows school logo after code entry
    (app)/
      layout.tsx                      # Auth-protected layout — handles student auth
      home/page.tsx                   # Story Hub — mode cards, Song of the Day, assignments, stats
      literacy/page.tsx               # Redirects to /phonics
      phonics/
        page.tsx                      # Language selector — Yorùbá shows "Launching soon" badge
        [language]/page.tsx           # A–Z grid with lock overlays (G–Z locked for free users)
        [language]/[letter]/page.tsx  # Letter detail — sound, song, tracing, milestone cert trigger
      numeracy/
        page.tsx                      # Language selector
        [language]/page.tsx           # Number grid with lock overlays (4–10 locked)
        [language]/[number]/page.tsx  # Server gate wrapper
        [language]/[number]/_content.tsx  # Number detail — counting, song, tracing, number_star cert
      world/
        page.tsx                      # Category grid with lock overlays
        [category]/page.tsx           # Items grid + category song banner
        [category]/[item]/page.tsx    # Item detail — world_explorer cert trigger
      dj-booth/page.tsx               # DJ Booth — pads D–H locked for free users
      story/page.tsx                  # Story Mode — shards 4–10 locked, story_hero cert
      assignment/[id]/page.tsx        # Assignment activity — assignment_champion cert trigger
      dashboard/
        parent/page.tsx               # Progress (literacy/numeracy/world), streak, certificates gallery
        school/page.tsx               # 4-tab panel + OnboardingTour for new admins
        school/analytics/page.tsx     # Analytics: charts, student table, assignment report
      school-setup/page.tsx           # First-time school creation
      settings/page.tsx               # Account + WhatsApp number, subscription (role-aware)
    api/
      paystack/webhook/route.ts       # Handles charge.success + subscription.create, full logging
      school/create/route.ts          # POST — creates school (service role)
      school/students/route.ts        # POST/PATCH/DELETE — students + Supabase auth accounts
      school/assignments/route.ts     # POST/PATCH — assignments + notify parents
      progress/route.ts               # POST — upsert progress (service role)
      sessions/route.ts               # POST/PATCH — sessions (service role)
      certificates/award/route.ts     # POST — award certificate (service role, ON CONFLICT DO NOTHING)
      notifications/whatsapp/route.ts # POST — send WhatsApp message (5 templates)
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
      AppNav.tsx                      # Sticky top nav
      BottomNav.tsx                   # Fixed bottom nav — Analytics tab for school admins
      Certificate.tsx                 # html2canvas PNG download + WhatsApp share
      ComingSoonOverlay.tsx
      CreateChildModal.tsx            # Uses live class_config
      EditChildModal.tsx              # Routes school children through service-role API
      ErrorBoundary.tsx, ErrorBoundaryWrapper.tsx
      LanguagePicker.tsx
      OnboardingFlow.tsx              # 3-step parent first-login welcome
      OnboardingTour.tsx              # 4-step school admin guided tour
      ProgressBar.tsx, StreakBadge.tsx
      PWAManager.tsx                  # SW registration, offline queue flush, install prompt
      SongButton.tsx                  # Plays song MP3 or TTS, Kòkò dancing, passes childId to useSong
      UpgradePrompt.tsx               # Bottom sheet — Explorer/Family plans

  hooks/
    useAccess.ts                      # Client-side paid access check
    useAssignments.ts                 # Fetch active assignments for school child
    useAudio.ts                       # Audio playback state
    useCertificates.ts                # Fetch certs, award via /api/certificates/award
    useChild.ts                       # Child profiles, handles student auth role
    useClassConfig.ts                 # Reads class_config table
    useProgress.ts                    # THREE separate DB queries (literacy/numeracy/world)
                                      # masteredCount = literacy only, milestone detection
    useSchoolAnalytics.ts             # Aggregated school analytics
    useSession.ts                     # Sessions via /api/sessions
    useSong.ts                        # Play song MP3 or TTS, tracks letter songs for sound_explorer cert
    useStreak.ts                      # Daily streak, awards weekly_streak cert at 7 days

  lib/
    access.ts                         # hasPaidAccess(), isLetterFree(), isNumberFree(), etc.
    awardCertificate.ts               # Client helper — POST /api/certificates/award
    notifications.ts                  # Server-side sendWhatsAppNotification()
    offlineQueue.ts                   # queueProgress(), flushQueue()
    api/errors.ts                     # friendlyError() — sanitises DB errors
    audio/
      clips.ts                        # LETTER_DATA — 26 letters
      mixer.ts                        # Web Audio API mixer
      songs.ts                        # Song data — 26 letter songs, 10 number songs, 5 world songs
      speech.ts                       # Web Speech API TTS fallback
    content/world.ts                  # 24 world items + category config
    paystack/client.ts                # PAYSTACK_PLANS, openPaystackPopup()
    supabase/
      client.ts, server.ts, middleware.ts
      database.types.ts               # All 9 tables including certificates
      getAccessContext.ts             # Server-side access check

  middleware.ts
  types/index.ts                      # All types + Sprout 1/2 curriculum + 8 CertificateTypes

supabase/
  migrations/
    20240001_initial_schema.sql       # Full schema + RLS + triggers
    20240002_curriculum_schema.sql    # school_code, class/term/pin, assignments
    20240003_student_auth.sql         # auth_user_id, student RLS policies
    20240004_certificates.sql         # certificates table, profiles columns, class_config, brand_color
  config.toml

public/
  ami-koko.svg, favicon.svg, manifest.json, robots.txt
  offline.html                        # Offline fallback page
  sw.js                               # Service worker
  audio/
    english/README.md                 # A–Z letter clips (not yet recorded)
    yoruba/README.md
    songs/
      letters/                        # ✅ a-song.mp3 through t-song.mp3 (A–T recorded)
                                      # ⏳ u-song.mp3 through z-song.mp3 (U–Z pending)
      numbers/README.md               # 1–10 number songs (pending)
      world/README.md                 # 5 category songs + koko-restored.mp3 (pending)

SONG_LYRICS.md                        # Complete lyrics for all 41 songs (A–Z, 1–10, 5 world, celebration)
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

### Key behaviours
- `handle_new_user()` trigger auto-creates `profiles` row on signup
- `generate_school_code()` trigger auto-generates `AMIK-XXXX` on school creation
- Student auth: synthetic email `{child_id}@students.amibykoko.com`, password `{school_id}-{pin}`
- All privileged writes use service role API routes — never browser client for school data

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

All awards go through `/api/certificates/award` (service role). Duplicates silently skipped.

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

School children with `schools.subscription_active = true` bypass all gating.

---

## Audio Status

### Letter Songs (A–T recorded ✅, U–Z pending ⏳)
| Status | Letters |
|---|---|
| ✅ Recorded | A B C D E F G H I J K L M N O P Q R S T |
| ⏳ Pending | U V W X Y Z |

### Other Audio (all pending)
- Letter clips: `/public/audio/english/[a-z].mp3` — 26 files needed
- Number songs: `/public/audio/songs/numbers/[1-10]-song.mp3` — 10 files needed
- World songs: `/public/audio/songs/world/[category]-song.mp3` — 5 files + `koko-restored.mp3`
- Yorùbá clips: `/public/audio/yoruba/` — after language launches

All missing audio falls back to Web Speech API TTS automatically.

---

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/paystack/webhook` | POST | charge.success + subscription.create, full logging |
| `/api/school/create` | POST | Creates school (service role) |
| `/api/school/students` | POST/PATCH/DELETE | Students + Supabase auth accounts |
| `/api/school/assignments` | POST/PATCH | Assignments + notify parents |
| `/api/progress` | POST | Upsert progress (service role) |
| `/api/sessions` | POST/PATCH | Sessions (service role) |
| `/api/certificates/award` | POST | Award certificate (service role, ON CONFLICT DO NOTHING) |
| `/api/notifications/whatsapp` | POST/GET | Send WhatsApp / webhook verify |
| `/api/notifications/whatsapp/notify` | POST | Client proxy — looks up parent phone |

---

## Phases Completed

| Phase | Status | Summary |
|---|---|---|
| Phase 1 — Songs | ✅ | useSong, SongButton, 26 letter songs, 10 number songs, 5 world songs, Song of the Day |
| Phase 2 — Certificates | ✅ | 8 certificate types, gallery, milestone detection, html2canvas download |
| Phase 3 — WhatsApp | ✅ | 5 templates, phone field, wired into 4 triggers |
| Phase 4 — PWA/Offline | ✅ | Service worker, offline.html, offlineQueue, install prompt |
| Phase 5 — Onboarding Tour | ✅ | 4-step school admin tour, logo upload, sets onboarding_complete |
| Phase 6 — Sprout 2 | ✅ | Content built, locked behind Coming Soon, live class_config |
| Phase 7 — Analytics | ✅ | Recharts dashboard, student table, weekly progress |
| Phase 8 — School Branding | ✅ | Logo on student login, brand_color stored |
| Phase 9 — Yorùbá Coming Soon | ✅ | "Launching soon" badge on language selector |
| Credit 7 — Settings + Webhook | ✅ | School admin sees school plan, webhook fixed |

### Remaining
- Phase 10 — Live Class Mode (Supabase Realtime)
- Phase 11 — Leaderboard + Challenges
- Phase 12 — Mobile App (Capacitor)

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
PAYSTACK_SECRET_KEY
NEXT_PUBLIC_APP_URL
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_ACCESS_TOKEN
WHATSAPP_WEBHOOK_VERIFY_TOKEN
```

---

## Pending Manual Steps

1. **Run Migration 004** in Supabase SQL Editor (`supabase/migrations/20240004_certificates.sql`)
2. **Update certificates constraint** to include `sound_explorer`:
   ```sql
   alter table certificates drop constraint if exists certificates_type_check;
   alter table certificates add constraint certificates_type_check
     check (type in ('first_steps','letter_master','number_star','world_explorer',
                     'story_hero','assignment_champion','weekly_streak','sound_explorer'));
   ```
3. **Backfill first_steps** for existing children who already have A–F mastered:
   ```sql
   insert into certificates (child_id, type)
   select distinct p.child_id, 'first_steps' from progress p
   where p.subject = 'literacy' and p.language = 'english'
   and p.mastered = true and p.letter in ('A','B','C','D','E','F')
   group by p.child_id having count(distinct p.letter) = 6
   on conflict do nothing;
   ```
4. **Paystack webhook URL** — set in Paystack dashboard: `https://ami-by-koko.vercel.app/api/paystack/webhook`
5. **WhatsApp Cloud API** — configure WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_ACCESS_TOKEN in Vercel env vars
6. **Record remaining songs** — U–Z letter songs, 10 number songs, 5 world songs, koko-restored.mp3

---

## Brand

- **Primary**: amber `#F59E0B` — Kòkò's energy
- **Secondary**: forest green `#166534` — Àmì's world
- **Accent**: coral/rose `#F43F5E` — celebration
- **Background**: soft cream `#FEFCE8`
- Minimum 48×48px tap targets everywhere, 64×64px on student screens
