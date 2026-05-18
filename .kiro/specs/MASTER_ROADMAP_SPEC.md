# Àmì by Kòkò — Master Feature Roadmap Spec
# Kiro Build Instructions — All Remaining Features

Read this document fully before writing any code.
Build features in the exact order listed in each phase.
Do not modify existing working features unless explicitly instructed.
Follow all existing conventions in tech-stack.md and product-identity.md.

---

## PHASE 1 — Songs

### Overview
Every letter, number, and world category gets a short song sung by Kòkò.
Songs are the single most powerful retention feature — children learn through rhythm and repetition.
Songs are pre-recorded MP3 files stored in Supabase Storage or the public folder.
Use Web Speech API as a fallback if the MP3 is not yet available (same pattern as audio clips).

### Song Content Structure

#### Letter Songs (26 songs — one per letter)
Each song is 20–30 seconds. Pattern:
```
"[Letter] is for [African word], [African word], [African word]
 [Letter] is for [African word], now you know the sound
 [Sound] — [Sound] — [Sound] says the letter [Letter]
 Kòkò loves [African word] every single day!"
```

Example for A:
```
"A is for Àgbàdo, Àgbàdo, Àgbàdo
 A is for Àgbàdo, now you know the sound
 Ahh — Ahh — Ahh says the letter A
 Kòkò loves Àgbàdo every single day!"
```

All 26 letter songs with African word associations:
| Letter | African Word | Meaning |
|---|---|---|
| A | Àgbàdo | Corn |
| B | Bàtà | Drum |
| C | Calabash | Calabash bowl |
| D | Dodo | Fried plantain |
| E | Ẹkọ | Corn pudding |
| F | Fufu | Fufu |
| G | Garri | Garri |
| H | Harmattan | Dry season wind |
| I | Ìyán | Pounded yam |
| J | Jollof | Jollof rice |
| K | Kòkò | Our parrot friend |
| L | Leopard | African leopard |
| M | Mango | Mango |
| N | Nkwobi | Spiced cow foot |
| O | Okra | Okra soup |
| P | Palm tree | Palm tree |
| Q | Queen | Queen mother |
| R | Rain | African rain |
| S | Suya | Grilled suya |
| T | Tilapia | Tilapia fish |
| U | Ugwu | Pumpkin leaf |
| V | Village | Village square |
| W | Waterleaf | Waterleaf soup |
| X | Xylophone | Xylophone |
| Y | Yam | Yam |
| Z | Zebra | Zebra |

#### Number Songs (10 songs — one per number)
Each song counts up to that number using African objects:
```
"One mango on the tree, just for me
 One mango — one, one, one!"

"Two mangoes on the tree, one for you one for me
 Two mangoes — two, two, two!"
```
Continue pattern up to 10.

#### World Category Songs (5 songs — one per category)
| Category | Song Theme |
|---|---|
| Body Parts | "Head, shoulders, eyes and nose — Kòkò knows them all!" |
| Animals | "Goat and chicken, dog and cow, parrot says hello!" |
| Fruits | "Mango, orange, banana too — Kòkò loves them, how about you?" |
| Objects | "Cup and book and bag and shoe — these are things we use!" |
| Weather | "Sun is shining, rain is falling, clouds are in the sky!" |

### Audio File Locations
```
public/
  audio/
    songs/
      letters/
        a-song.mp3
        b-song.mp3
        ... (26 files)
      numbers/
        1-song.mp3
        ... (10 files)
      world/
        body-song.mp3
        animals-song.mp3
        fruits-song.mp3
        objects-song.mp3
        weather-song.mp3
```

### New Hook — `useSong.ts`
Create `src/hooks/useSong.ts`:
```typescript
// Loads and plays a song MP3
// Falls back to Web Speech API reading the lyrics if MP3 not available
// Returns: { play, stop, isPlaying, hasClip }
```

### UI Changes

#### Letter Detail Page
Add "🎵 Sing with Kòkò" button below the existing sound button:
- Tapping plays the letter song MP3
- Kòkò animates with a dancing/singing mood while song plays
- Button shows "⏹ Stop" while playing, returns to "🎵 Sing with Kòkò" when done
- Song is free for A–F, locked for G–Z (same gating as letters)

#### Number Detail Page
Add "🎵 Count with Kòkò" button — same behaviour as above.
Number songs follow the same free/paid gating as numbers (1–3 free, 4–10 locked).

#### My World Category Page
Add "🎵 Sing the [Category] song" banner at the top of each category page.
Body Parts song is free. Other category songs require paid access.

#### Home Screen — Song of the Day
Add a "🎵 Song of the Day" card on the home screen between the mode cards and assignments.
- Rotates daily (use the day of year % 26 to pick a letter song)
- Shows letter, African word, and a "Play" button
- Always free — this is a hook to show the value of songs
- Tapping plays the song inline with Kòkò animating

#### Story Mode — Celebration Song
When all 10 shards are collected and Kòkò's voice is restored:
- Play a special celebration song (create `public/audio/songs/koko-restored.mp3`)
- Kòkò animates in "singing" mood
- Confetti animation plays
- Lyrics shown on screen as the song plays

### Songs Gating
- Letter songs A–F: free
- Letter songs G–Z: paid
- Number songs 1–3: free
- Number songs 4–10: paid
- Body Parts world song: free
- All other world songs: paid
- Song of the Day on home screen: always free
- Story Mode celebration song: always free

---

## PHASE 2 — Progress Certificates

### Overview
Children earn downloadable PNG certificates at key milestones.
Parents share these on WhatsApp — organic marketing.
The `Certificate` component already exists — wire it properly to all milestone triggers.

### Certificate Types

| Certificate | Trigger | Content |
|---|---|---|
| **First Steps** | Complete letters A–F (free milestone) | "completed their first 6 letters!" |
| **Letter Master** | Complete full A–Z | "mastered all 26 letters with Kòkò!" |
| **Number Star** | Complete numbers 1–10 | "counted to 10 with Kòkò!" |
| **World Explorer** | Complete all 5 world categories | "explored My World with Àmì!" |
| **Story Hero** | Complete all 10 story shards | "restored Kòkò's voice!" |
| **Assignment Champion** | Complete 5 assignments | "completed 5 assignments!" |
| **Weekly Streak** | 7-day streak | "learned with Kòkò 7 days in a row!" |

### Certificate Design (update existing Certificate.tsx)
Each certificate must include:
- Àmì + Kòkò illustration (use `/public/ami-koko.svg`)
- Child's name (large, prominent)
- Certificate type title
- Achievement description
- Date earned
- "Àmì by Kòkò" branding + logo
- Warm amber/cream colour scheme

### Certificate Flow
1. Milestone is reached (detected in the relevant page/hook)
2. Celebration screen appears with confetti animation (Framer Motion)
3. Certificate preview shown
4. Two buttons: "Download Certificate 📥" and "Share on WhatsApp 📲"
5. Download: `html2canvas` renders certificate div → PNG download
6. WhatsApp share: opens `https://wa.me/?text=` with a pre-written message

WhatsApp share text:
```
🦜 [Child name] just [achievement] on Àmì by Kòkò!
Try it free at ami-by-koko.vercel.app
```

### Certificate Milestone Detection
Add milestone checks to these hooks/pages:
- `useProgress.ts` — check after every `mastered` update if A–F or A–Z is complete
- `/numeracy/[language]/[number]/page.tsx` — check after number 10 is mastered
- `/world/[category]/[item]/page.tsx` — check after all items in all categories done
- `/story/page.tsx` — check after shard 10 collected
- `useAssignments.ts` — check after 5th assignment completed
- `useStreak.ts` — check after 7-day streak achieved

Store earned certificates in a new DB table:

```sql
create table certificates (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  type text not null check (type in (
    'first_steps', 'letter_master', 'number_star',
    'world_explorer', 'story_hero', 'assignment_champion', 'weekly_streak'
  )),
  earned_at timestamptz not null default now(),
  unique(child_id, type)  -- one of each type per child
);

alter table certificates enable row level security;

create policy "Parents can view their children's certificates"
  on certificates for select
  using (
    exists (
      select 1 from children
      where children.id = certificates.child_id
      and children.parent_id = auth.uid()
    )
  );

create policy "App can insert certificates"
  on certificates for insert
  with check (
    exists (
      select 1 from children
      where children.id = certificates.child_id
      and children.parent_id = auth.uid()
    )
  );
```

### Certificates Gallery
Add a "My Certificates 🏆" section to the parent dashboard.
Shows all earned certificates as small cards with download buttons.
Empty state: "Complete activities with Kòkò to earn certificates!"

---

## PHASE 3 — WhatsApp Notifications

### Overview
Replace email notifications entirely for Nigerian parents.
WhatsApp is the primary communication channel in Nigeria.
Use the WhatsApp Cloud API (free tier: 1,000 conversations/month).

### Setup
- Create a Meta for Developers account
- Set up WhatsApp Business API
- Get a phone number ID and access token
- Store in environment variables:
```
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
```

### New API Route — `/api/notifications/whatsapp/route.ts`
```typescript
// POST — sends a WhatsApp message to a parent
// Called internally by other routes/webhooks
// Never called directly from the client

interface WhatsAppPayload {
  to: string        // parent's phone number with country code e.g. +2348012345678
  type: 'assignment_complete' | 'new_assignment' | 'milestone' | 'streak'
  data: {
    childName: string
    detail: string    // e.g. "completed 'Trace S, A, T' assignment"
    appUrl: string
  }
}
```

### Notification Templates

| Trigger | Message |
|---|---|
| Assignment completed | "🦜 Great news! [Child] just completed their assignment '[Title]' on Àmì by Kòkò! View their progress: [link]" |
| New assignment set | "📝 [Child]'s teacher has set a new assignment: '[Title]'. Due [date]. Open Àmì by Kòkò to see it." |
| Milestone earned | "🏆 [Child] just earned the '[Certificate]' certificate on Àmì by Kòkò! Download it here: [link]" |
| 7-day streak | "🔥 [Child] has been learning with Kòkò for 7 days in a row! Keep it up!" |
| Streak at risk | "⏰ [Child] hasn't visited Àmì by Kòkò today. Don't break the streak!" (send at 6pm if no session that day) |

### Parent Phone Number Collection
Add phone number field to:
- Parent signup page (optional but encouraged)
- Settings page → Account section
- First-login onboarding flow (step 2)

Store in `profiles` table:
```sql
alter table profiles
add column phone_number text,
add column whatsapp_notifications boolean default true;
```

### Notification Triggers
Wire WhatsApp notifications into these existing flows:
- `/assignment/[id]/page.tsx` — on assignment completion, call `/api/notifications/whatsapp`
- `/api/paystack/webhook` — on subscription activation, send welcome message
- `useStreak.ts` — on 7-day streak, trigger milestone notification
- Milestone detection (from Phase 2) — on certificate earned

### Webhook for Incoming Messages
Create `/api/notifications/whatsapp/webhook/route.ts`
Handle GET (verification) and POST (incoming messages).
For MVP, just log incoming messages — don't build a full chatbot yet.

---

## PHASE 4 — Offline Support / PWA

### Overview
Make the app work with poor or no internet connection.
Critical for Nigerian schools and homes with unreliable connectivity.

### Service Worker
Create `public/sw.js` — a service worker that:

**Caches on install:**
- All pages in the `(app)/` group
- `/public/ami-koko.svg` and all illustrations
- `/public/audio/english/` — all 26 letter clips
- `/public/audio/songs/letters/` — all 26 letter songs
- CSS and JS bundles

**Runtime caching strategy:**
- Pages: Network first, cache fallback
- Audio files: Cache first (they never change)
- Supabase API calls: Network only (can't cache auth)

**Offline fallback page:**
Create `public/offline.html` — shows Àmì and Kòkò with message:
> "Kòkò is waiting for the internet to come back! 
>  You can still practice letters you've already learned."

Show cached phonics pages when offline.

### Next.js PWA Setup
Install `next-pwa` or use manual service worker registration:
```typescript
// In src/app/layout.tsx, add service worker registration
// Only in production
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  navigator.serviceWorker.register('/sw.js')
}
```

### Offline Progress Queue
When a child completes a letter/tracing while offline:
- Store progress in `localStorage` as a queue
- When connection restores, flush queue to Supabase
- Show a subtle "Syncing..." indicator when flushing

```typescript
// src/lib/offlineQueue.ts
interface QueuedProgress {
  childId: string
  language: string
  letter: string
  subject: string
  mastered: boolean
  timestamp: string
}

export function queueProgress(item: QueuedProgress): void
export async function flushQueue(supabase: SupabaseClient): Promise<void>
```

### App Install Prompt
Show a gentle "Add to Home Screen" prompt after the user's 3rd session:
- Bottom sheet with Àmì + Kòkò illustration
- "Learn faster — add Àmì to your home screen!"
- Uses the browser's `beforeinstallprompt` event
- Store dismissal in localStorage — never show again if dismissed

---

## PHASE 5 — Admin Onboarding Tour

### Overview
First-time school admins need guided setup or they churn.
A 4-step interactive tour shown once on first login.

### Tour Steps

**Step 1 — Welcome**
```
🦜 Welcome to Àmì by Kòkò!
Let's set up your school in 4 quick steps.
Your school code is: AMIK-XXXX
(Share this with parents so students can log in at home)
[ Next → ]
```

**Step 2 — Upload School Logo**
```
📸 Add your school logo
Your students will see it every time they log in.
[ Upload Logo ] (file picker)
[ Skip for now ]
```

**Step 3 — Add Your First Student**
```
👦 Add your first student
Let's add one student together.
[ Opens StudentModal pre-filled with example data ]
[ Done → ]
```

**Step 4 — Create Your First Assignment**
```
📝 Create your first assignment
Set a tracing activity for your class.
[ Opens AssignmentModal ]
[ Done — Let's go! ]
```

### Implementation
- Create `src/components/ui/OnboardingTour.tsx`
- Show only when `profiles.onboarding_complete = false` AND role = 'school_admin'
- After tour completion, set `onboarding_complete = true` in profiles table
- Add `onboarding_complete boolean default false` to profiles table:

```sql
alter table profiles
add column onboarding_complete boolean default false;
```

- Tour uses a modal overlay with spotlight effect on relevant UI elements
- Use Framer Motion for smooth step transitions
- Progress dots at the bottom showing step 1/4, 2/4 etc.

---

## PHASE 6 — Sprout 2 Curriculum

### Overview
Unlock Sprout 2 content once Sprout 1 is fully tested and schools are using it.
Architecture is already in place — this phase is primarily content + unlocking the class.

### Sprout 2 Curriculum Content

**Age range:** 3–4 years
**Status:** Build the content but keep Coming Soon overlay until manually enabled

#### Literacy — Sprout 2
| Term | Jolly Phonics Sets | Focus |
|---|---|---|
| Term 1 | Sets 1 & 2 review + blending | s+a = sa, t+a = ta |
| Term 2 | Sets 3 & 4 (g,o,u,l,f,b + digraphs) | Two-letter sounds |
| Term 3 | Sets 5, 6 & 7 | Complex sounds, simple 3-letter words |

#### Numeracy — Sprout 2
| Term | Content |
|---|---|
| Term 1 | Numbers 1–20, counting objects up to 20 |
| Term 2 | Addition up to 10 (2 mangoes + 3 mangoes = 5) |
| Term 3 | Subtraction intro, shapes (circle, square, triangle, rectangle) |

#### My World — Sprout 2
| Term | Content |
|---|---|
| Term 1 | Community helpers (teacher, doctor, farmer, trader, driver) |
| Term 2 | Nigerian foods (jollof rice, egusi, puff puff, akara, suya) |
| Term 3 | My environment (school, market, church/mosque, farm, road) |

### Coming Soon Toggle
Add an `active_classes` config in Supabase:
```sql
create table class_config (
  class text primary key check (class in ('sprout_1','sprout_2','sprout_3','stepping_stone')),
  active boolean default false,
  launch_date date
);

insert into class_config values
  ('sprout_1', true, null),
  ('sprout_2', false, null),
  ('sprout_3', false, null),
  ('stepping_stone', false, null);
```

Read this config on the class selector screen — active classes are accessible, inactive show Coming Soon.

---

## PHASE 7 — Analytics Dashboard for Schools

### Overview
Give school admins insight into class performance.
This transforms the product from a tool into a data platform — much harder to cancel.

### New Page — `/dashboard/school/analytics`

#### Metrics to show

**Class Overview**
- Total students enrolled
- Active this week (had at least one session)
- Average letters mastered per student
- Average assignment completion rate

**Subject Performance**
Bar chart showing class average mastery per letter (A–Z).
Letters below 50% mastery highlighted in red — "needs attention".

**Individual Student Table**
| Student | Letters | Numbers | World | Assignments | Last Active |
|---|---|---|---|---|---|
| Tayo O. | 12/26 | 5/10 | 8/24 | 3/5 | Today |
| Ngozi A. | 6/26 | 3/10 | 4/24 | 1/5 | 3 days ago |

Sortable by any column. Click student → detailed view.

**Term Progress**
Line chart showing class average mastery over the current term (weekly data points).

**Assignment Report**
Table of all assignments with completion rates.
Export as PDF button.

### Charts Library
Use `recharts` (already available in the project) for all charts.

### Data Queries
Create `src/hooks/useSchoolAnalytics.ts`:
```typescript
// Fetches aggregated progress data for a school
// Returns class averages, per-student breakdown, assignment stats
// Uses Supabase server-side queries for performance
```

---

## PHASE 8 — Custom School Branding

### Overview
Schools upload their logo and choose a colour. Students see school branding.
Makes schools feel ownership — reduces churn significantly.

### Features

**School logo upload (already partially built — extend it)**
- Upload logo in school settings
- Stored in Supabase Storage bucket: `school-logos`
- Displayed on student login page when school code is entered
- Displayed on student home screen top bar

**School colour theme**
Add colour picker to school settings:
- Primary colour (used for buttons, highlights)
- Schools can pick from 8 preset palettes — no free-form colour (keeps it looking good)
- Presets: Amber (default), Royal Blue, Forest Green, Deep Purple, Crimson, Teal, Navy, Burnt Orange

Store in schools table:
```sql
alter table schools
add column brand_color text default 'amber'
  check (brand_color in ('amber','blue','green','purple','crimson','teal','navy','orange'));
```

**School name on student home screen**
When a student is logged in via school account:
- Show school name + logo in the top bar instead of "Àmì by Kòkò"
- Keep Kòkò icon always visible — he's the constant brand anchor

---

## PHASE 9 — Yorùbá Language Launch

### Overview
Yorùbá is the first paid language. Launch it when native speaker audio is recorded.

### Content Needed (source from native speaker)

**Yorùbá Alphabet**
Yorùbá uses a modified Latin alphabet with additional characters and tone marks.
Key letters: a, b, d, e, ẹ, f, g, gb, h, i, j, k, l, m, n, o, ọ, p, r, s, ṣ, t, u, w, y

**Word associations — all 26 Yorùbá letters with:**
- The Yorùbá letter/sound
- A Yorùbá word starting with that sound
- English translation
- Audio clip (native speaker)

**Yorùbá number names 1–10:**
1=ọkan, 2=èjì, 3=ẹta, 4=ẹrin, 5=àrún, 6=ẹfà, 7=èje, 8=ẹjọ, 9=ẹsàn, 10=ẹwa

**Yorùbá body parts, animals, fruits** — full translations for all 24 My World items.

### Technical
Audio clips go in:
```
public/audio/yoruba/[letter].mp3
public/audio/songs/letters/yoruba/[letter]-song.mp3
public/world/yoruba/[item].mp3
```

The language selector already gates Yorùbá behind subscription — just add the content and flip the switch.

---

## PHASE 10 — Live Class Mode

### Overview
Teacher starts a live session — all students in the class see the same content simultaneously.
Like a digital blackboard. Unique feature no competitor has.

### How it works
1. Teacher opens school dashboard → clicks "Start Live Class"
2. Selects: class, subject, specific letter/number/item
3. All students currently in the app see a "Live Class is starting!" banner
4. Students tap "Join" → they all see the same letter/activity
5. Teacher controls progression — "Next letter" button advances all students simultaneously
6. Students interact locally (tap to hear, trace) while following teacher's pace
7. Teacher ends session → students return to normal mode

### Technical Implementation
Use **Supabase Realtime** for live synchronisation:

```typescript
// Teacher broadcasts on channel: `live-class-${schoolId}-${classLevel}`
// Students subscribe to the same channel

interface LiveClassEvent {
  type: 'start' | 'navigate' | 'end'
  subject: Subject
  contentKey: string  // e.g. 'a', '1', 'body-eye'
  teacherId: string
}
```

### New Pages
- `/live-class/[schoolId]` — student view (subscribes to realtime channel)
- Teacher controls embedded in school dashboard

### Realtime Setup
Supabase Realtime is already configured — use broadcast channels:
```typescript
const channel = supabase.channel(`live-class-${schoolId}`)
channel.on('broadcast', { event: 'navigate' }, (payload) => {
  router.push(getContentUrl(payload.contentKey))
})
channel.subscribe()
```

---

## PHASE 11 — Leaderboard & Class Challenges

### Overview
Healthy competition between students drives engagement.
Weekly challenges keep schools coming back every week.

### Features

**Weekly Class Challenge**
Every Monday, a new challenge is automatically set for each class:
- "Complete 5 new letters this week"
- "Trace 3 numbers perfectly"
- "Listen to 10 letter sounds"

Students who complete the challenge earn a special badge.

**Class Leaderboard**
Shows top 5 students in the class by:
- Letters mastered this week
- Assignment completion rate
- Current streak

Shown on student home screen — only within their class (not cross-school).

**School-wide Challenge** (Growth + Academy plans only)
Monthly challenge across all classes in the school.
Results shown on school admin dashboard.

### New Tables
```sql
create table challenges (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id),
  class text,
  title text not null,
  description text,
  metric text check (metric in ('letters_mastered', 'assignments_complete', 'sessions')),
  target_count int not null,
  week_start date not null,
  week_end date not null,
  created_at timestamptz default now()
);

create table challenge_progress (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references challenges(id),
  child_id uuid references children(id),
  current_count int default 0,
  completed boolean default false,
  completed_at timestamptz,
  unique(challenge_id, child_id)
);
```

---

## PHASE 12 — Mobile App (iOS + Android)

### Overview
Wrap the existing Next.js web app in a native shell using Capacitor.
App store presence legitimises the product for school procurement departments.

### Approach
Use **Capacitor** (not React Native) — wraps the existing web app with minimal code changes.

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init
npx cap add ios
npx cap add android
```

### Native Features to Enable via Capacitor Plugins
- **Push notifications** — replace WhatsApp for users who install the app
- **Haptic feedback** — vibration on correct letter trace (children love this)
- **File system** — save certificates directly to camera roll
- **Microphone** — future: child records themselves saying the letter sound

### App Store Requirements
- App icon (1024×1024px) — commission from illustrator
- Screenshots (6.5" iPhone, 12.9" iPad, Android)
- App Store description (use the landing page copy)
- Age rating: 4+ (iOS) / Everyone (Android)
- Privacy policy page — create `/privacy` on the web app

---

## Global Rules for All Phases

1. **Never break existing features** — test phonics, auth, and school admin after every phase
2. **Touch targets** — minimum 48×48px everywhere, 64×64px on student-facing screens
3. **Cultural content** — always Nigerian/African. No Western-default content
4. **Kòkò reacts to everything** — every significant interaction has a Kòkò animation
5. **Error boundaries** — wrap every new page in the existing ErrorBoundary component
6. **Loading states** — every async operation has a skeleton or spinner
7. **Offline awareness** — if a feature needs internet, show a graceful offline message
8. **Free/paid gating** — check `hasPaidAccess()` from `src/lib/access.ts` before showing any paid content
9. **School bypass** — school children with active school subscription always bypass payment gating
10. **TypeScript strict** — no `any` types. Add new types to `src/types/index.ts`
11. **RLS** — every new table needs Row Level Security enabled and policies defined
12. **Service role** — any write that bypasses RLS must go through a Next.js API route, never the browser client directly

---

## Build Order Summary

```
Phase 1:  Songs
Phase 2:  Progress Certificates
Phase 3:  WhatsApp Notifications
Phase 4:  Offline Support / PWA
Phase 5:  Admin Onboarding Tour
Phase 6:  Sprout 2 Curriculum
Phase 7:  Analytics Dashboard
Phase 8:  Custom School Branding
Phase 9:  Yorùbá Language Launch
Phase 10: Live Class Mode
Phase 11: Leaderboard & Class Challenges
Phase 12: Mobile App
```

---

## Environment Variables to Add

```
# WhatsApp Cloud API (Phase 3)
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
```

All other required env vars are already documented in the existing codebase summary.

---

## Database Migrations Summary

Run these in order in Supabase SQL Editor:

**Migration 003 — Songs & Certificates**
```sql
create table certificates (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  type text not null check (type in (
    'first_steps','letter_master','number_star',
    'world_explorer','story_hero','assignment_champion','weekly_streak'
  )),
  earned_at timestamptz not null default now(),
  unique(child_id, type)
);
alter table certificates enable row level security;
create policy "Parents can view their children's certificates"
  on certificates for select
  using (exists (
    select 1 from children
    where children.id = certificates.child_id
    and children.parent_id = auth.uid()
  ));
create policy "App can insert certificates"
  on certificates for insert
  with check (exists (
    select 1 from children
    where children.id = certificates.child_id
    and children.parent_id = auth.uid()
  ));
```

**Migration 004 — Profiles & Notifications**
```sql
alter table profiles
  add column phone_number text,
  add column whatsapp_notifications boolean default true,
  add column onboarding_complete boolean default false;
```

**Migration 005 — School Branding**
```sql
alter table schools
  add column brand_color text default 'amber'
    check (brand_color in ('amber','blue','green','purple','crimson','teal','navy','orange'));
```

**Migration 006 — Class Config**
```sql
create table class_config (
  class text primary key check (class in ('sprout_1','sprout_2','sprout_3','stepping_stone')),
  active boolean default false,
  launch_date date
);
insert into class_config values
  ('sprout_1', true, null),
  ('sprout_2', false, null),
  ('sprout_3', false, null),
  ('stepping_stone', false, null);
alter table class_config enable row level security;
create policy "Anyone can read class config"
  on class_config for select using (true);
```

**Migration 007 — Challenges & Leaderboard**
```sql
create table challenges (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id),
  class text,
  title text not null,
  description text,
  metric text check (metric in ('letters_mastered','assignments_complete','sessions')),
  target_count int not null,
  week_start date not null,
  week_end date not null,
  created_at timestamptz default now()
);
create table challenge_progress (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references challenges(id) on delete cascade,
  child_id uuid references children(id) on delete cascade,
  current_count int default 0,
  completed boolean default false,
  completed_at timestamptz,
  unique(challenge_id, child_id)
);
alter table challenges enable row level security;
alter table challenge_progress enable row level security;
create policy "School admins can manage challenges"
  on challenges for all
  using (exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'school_admin'
    and profiles.school_id = challenges.school_id
  ));
create policy "Students can view and update their challenge progress"
  on challenge_progress for all
  using (child_id in (
    select id from children where parent_id = auth.uid()
  ));
```
