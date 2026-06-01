# Debugging Guide: Server Component Render Errors

## The Problem

When you see this error in production:
```
ErrorBoundary caught: Error: An error occurred in the Server Components render. 
The specific message is omitted in production builds to avoid leaking sensitive details.
```

This is **intentional security masking** by Next.js. The actual error is hidden to prevent exposing database queries, API keys, or file paths to the browser.

## How to Find the Real Error

### Option 1: Run Locally in Development Mode (FASTEST)

```bash
npm run dev
```

Then navigate to the page that's failing. In development mode, Next.js will show you the **full, unmasked error message** with the exact line of code causing the failure.

**Example output:**
```
Error: Failed to load parent profile: PGRST116 - No rows found
  at AppLayout (src/app/(app)/layout.tsx:85)
```

### Option 2: Check Browser Console (Development)

When running `npm run dev`, open your browser's Developer Tools (F12) and look at the Console tab. You'll see detailed logs like:

```
[AppLayout] Parent profile fetch error: {
  code: "PGRST116",
  message: "No rows found",
  details: "...",
  hint: "...",
  userId: "abc123..."
}
```

### Option 3: Check Production Logs (Vercel)

If the error happens in production:

1. Go to your Vercel dashboard
2. Select your project
3. Click **Logs** → **Function Logs**
4. Search for the error digest ID or `[AppLayout]` to find the full error

### Option 4: Use Error Digest

In the error UI, you'll see an "Error ID" (the digest). Use this to search your server logs:

```
Error ID: 4035605914
```

Search your logs for this digest to find the corresponding full error message.

## Common Errors and Fixes

### Error: `PGRST116 - No rows found`

**Cause:** User's profile doesn't exist in the database.

**Fix:** 
- Run the backfill migration: `supabase db push`
- Or the app will auto-create the profile on next login

**Code location:** `src/app/(app)/layout.tsx` lines 60-90

---

### Error: `Failed to load student profile`

**Cause:** Student account's child record is missing or RLS policy is blocking access.

**Fix:**
- Check that `auth_user_id` column exists on `children` table
- Verify RLS policies in migration `20240003_student_auth.sql`
- Run: `supabase db push`

**Code location:** `src/app/(app)/layout.tsx` lines 40-55

---

### Error: `PGRST116` on `profiles` table

**Cause:** Old account created before the `handle_new_user()` trigger was added.

**Fix:**
- Run migration 20240007: `supabase db push`
- Or manually insert: 
  ```sql
  INSERT INTO public.profiles (id, role, full_name)
  VALUES ('user-id', 'parent', 'Full Name')
  ON CONFLICT (id) DO NOTHING;
  ```

---

## Debugging Workflow

1. **See error in production?**
   - Note the error digest
   - Check Vercel logs with that digest

2. **Can't find the error?**
   - Run `npm run dev` locally
   - Reproduce the same steps
   - Read the full error message in the console

3. **Still stuck?**
   - Check `src/app/(app)/layout.tsx` for the exact error location
   - Look at the error logs in the console (they're detailed)
   - Check Supabase RLS policies and table schema

## Error Logging

The app logs errors in this format:

```
[AppLayout] Parent profile fetch error: {
  code: "PGRST116",           // Supabase error code
  message: "No rows found",   // Human-readable message
  details: "...",             // Additional details
  hint: "...",                // Helpful hint
  userId: "abc123..."         // User ID for context
}
```

**Error codes:**
- `PGRST116` = No rows found (profile doesn't exist)
- `PGRST301` = RLS policy violation
- `PGRST302` = RLS policy violation (insert)
- `PGRST303` = RLS policy violation (update)

## Files Involved

- **Error boundary:** `src/app/(app)/error.tsx` — Catches and displays errors
- **Layout:** `src/app/(app)/layout.tsx` — Where errors originate
- **Migrations:** `supabase/migrations/` — Database schema and RLS policies
- **Logs:** Browser console (dev) or Vercel logs (production)

## Quick Checklist

- [ ] Run `npm run dev` to see full error message
- [ ] Check browser console for `[AppLayout]` logs
- [ ] Verify Supabase migrations are applied: `supabase db push`
- [ ] Check user's profile exists in `profiles` table
- [ ] Verify RLS policies are correct
- [ ] Check `auth_user_id` column exists on `children` table
- [ ] Look at Vercel logs with error digest

## Next Steps

Once you identify the error:

1. **If it's a missing profile:** Run `supabase db push` to backfill
2. **If it's an RLS policy issue:** Check the migration files and update policies
3. **If it's a schema issue:** Run the appropriate migration
4. **If it's something else:** Add more logging and re-run in dev mode

---

**Need help?** Check the error logs first — they're designed to be descriptive!
