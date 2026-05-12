# Àmì by Kòkò

A multilingual phonics and early learning web app for Nigerian children aged 0–8.

## Characters
- **Àmì** — a curious 6-year-old Nigerian girl
- **Kòkò** — her talking parrot companion (the audio avatar of the app)

## Stack
Next.js 14 · TypeScript · Tailwind CSS · Supabase · Paystack · Vercel

## Kiro Files
This project uses Kiro for AI-assisted development. Key files:

| File | Purpose |
|---|---|
| `.kiro/specs/ami-koko-mvp.md` | Full MVP spec: features, schema, structure |
| `.kiro/steering/product-identity.md` | Characters, brand voice, cultural rules |
| `.kiro/steering/tech-stack.md` | Stack, conventions, naming rules |
| `.kiro/steering/mvp-scope.md` | What's in/out of MVP, definition of done |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in Supabase + Paystack keys

# Run Supabase locally (optional)
npx supabase start

# Push database schema
npx supabase db push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## Project Structure

```
src/
  app/
    (public)/       # Landing, auth pages
    (app)/          # Auth-protected app screens
  components/
    characters/     # Àmì + Kòkò animated components
    phonics/        # Letter cards, sound buttons, tracing
    dj/             # DJ Booth mixing board
    story/          # Story mode scenes + shards
    ui/             # Shared UI components
  lib/
    supabase/       # Supabase clients (server + browser)
    audio/          # Speech, clips, mixer
    paystack/       # Payment client
  hooks/            # useChild, useProgress, useAudio
  types/            # Shared TypeScript types
```

## Supabase Setup

### Local Development
```bash
# Start local Supabase (Docker required)
npx supabase start

# Apply migrations
npx supabase db push

# Generate TypeScript types
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

### Production
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Link your project: `npx supabase link --project-ref your-project-ref`
3. Push migrations: `npx supabase db push`
4. Add environment variables to Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Audio Assets

Pre-recorded audio clips go in `/public/audio/[language]/[letter].mp3`.

Until clips are added, the app automatically falls back to Web Speech API.

See `public/audio/english/README.md` and `public/audio/yoruba/README.md` for details.

## Paystack Setup

1. Create a Paystack account at [paystack.com](https://paystack.com)
2. Get your test keys from the dashboard
3. Add to `.env.local`:
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
   - `PAYSTACK_SECRET_KEY`
4. Before launch: switch to live keys and update pricing in `src/lib/paystack/client.ts`

## Roadmap

| Phase | Focus | Status |
|---|---|---|
| MVP | Phonics + Sounds + Story Mode | 🔨 Building |
| V2 | Logic & Math + Igbo + Hausa | 📋 Planned |
| V3 | Discovery / Science + Explorer's Journal | 📋 Planned |

## License

Proprietary — all rights reserved.
