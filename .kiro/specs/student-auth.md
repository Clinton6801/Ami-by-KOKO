# Student Auth — Cross-Device Login Spec

## Problem
The current student login stores the session in `localStorage` only.
This means:
- Students can only use the app on the same device/browser they logged in on
- If a teacher logs a child in at school, the child cannot continue at home
- No real session — just a JSON blob in localStorage that any page can ignore

## Goal
Students should be able to log in on any device using their school code + name + PIN,
and have a real Supabase session that persists across devices.

## Approach — Supabase Auth with synthetic emails

Each student gets a Supabase Auth account with a synthetic email:
```
{student_id}@students.amibykoko.com
```
Password is derived from their PIN + school_id (never shown to the user):
```
{school_id}-{student_pin}
```

This gives students a real JWT session without requiring them to know an email address.

## Flow

### School admin creates a student
1. Admin fills in StudentModal (name, class, term, PIN)
2. `/api/school/students` POST creates the `children` row (already done)
3. **New**: also calls `supabase.auth.admin.createUser()` with:
   - `email`: `{child_id}@students.amibykoko.com`
   - `password`: `{school_id}-{pin}`
   - `email_confirm: true` (skip email confirmation)
   - `user_metadata`: `{ role: "student", child_id, school_id }`
4. Stores the Supabase `user.id` back on the `children` row as `auth_user_id`

### Student logs in (any device)
1. Student enters school code → picks name → enters PIN (existing UI)
2. Instead of writing to localStorage, call:
   ```ts
   supabase.auth.signInWithPassword({
     email: `${child.id}@students.amibykoko.com`,
     password: `${schoolId}-${pin}`,
   })
   ```
3. On success → redirect to `/home`
4. The Supabase session cookie persists across devices

### PIN change
When a school admin updates a student's PIN via StudentModal:
- `/api/school/students` PATCH also calls `supabase.auth.admin.updateUserById()` to update the password

### Student deletion
When a school admin deletes a student:
- `/api/school/students` DELETE also calls `supabase.auth.admin.deleteUser()` to remove the auth account

## Database changes needed

```sql
-- Add auth_user_id to children table
ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
```

## RLS changes needed

Students need to be able to read their own progress and assignments.
Add policies that check `auth.uid() = children.auth_user_id`:

```sql
-- Children can read their own row
CREATE POLICY "students: read own row"
  ON public.children FOR SELECT
  USING (auth_user_id = auth.uid());

-- Children can read their own progress
CREATE POLICY "progress: student read own"
  ON public.progress FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM public.children WHERE auth_user_id = auth.uid()
    )
  );

-- Children can read assignments for their class
CREATE POLICY "assignments: student read own class"
  ON public.assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.auth_user_id = auth.uid()
      AND children.school_id = assignments.school_id
      AND children.class = assignments.class
    )
  );
```

## Files to change

| File | Change |
|---|---|
| `src/app/api/school/students/route.ts` | POST: create Supabase auth user; PATCH: update password if PIN changed; DELETE: delete auth user |
| `src/app/(public)/student-login/page.tsx` | Replace localStorage write with `supabase.auth.signInWithPassword` |
| `supabase/migrations/` | New migration: add `auth_user_id` to children, add student RLS policies |
| `src/lib/supabase/database.types.ts` | Add `auth_user_id` to children Row/Insert/Update types |

## Notes
- The synthetic email domain `@students.amibykoko.com` never receives email — it's just a unique identifier
- Students never see their email address — the login UI stays as school code + name + PIN
- The PIN is the only credential the child needs to know
- School admins can reset a PIN at any time from the Students tab
- This approach works with Supabase's existing auth system — no custom auth server needed
