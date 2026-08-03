# Super Admin Dashboard — Setup Guide

## Overview
This is a complete super admin dashboard for Àmì by Kòkò, accessible only to Clinton (akinwoleolaclinton@gmail.com) at `/super-admin`.

---

## What's Been Built

### 1. **Database Migration**
- File: `supabase/migrations/20240006_super_admin.sql`
- Creates `broadcast_history` table with RLS policies
- **Action**: Run this SQL in Supabase SQL Editor before deploying

### 2. **API Routes** (All server-side, service role only)
Located in `src/app/api/super-admin/`:

| Route | Method | Purpose |
|---|---|---|
| `/verify` | GET | Verify user is super admin |
| `/stats` | GET | Overview statistics |
| `/users` | GET | Paginated user list with filters |
| `/users/activate` | POST | Activate subscription for user |
| `/users/deactivate` | POST | Deactivate subscription for user |
| `/schools` | GET | School list with subscription status |
| `/revenue` | GET | Subscription & revenue data |
| `/broadcast` | POST | Send email broadcast |
| `/broadcast/history` | GET | View broadcast send history |
| `/content` | GET | Content mastery & song play stats |
| `/system-health` | GET | System status checks |

### 3. **Frontend Pages** (All protected)
Located in `src/app/super-admin/`:

| Page | Path | Purpose |
|---|---|---|
| Layout | `/super-admin` | Main layout with sidebar nav |
| Overview | `/super-admin` | Dashboard with stat cards & recent signups |
| Users | `/super-admin/users` | Paginated user table with activate/deactivate buttons |
| Schools | `/super-admin/schools` | School list with subscription status |
| Revenue | `/super-admin/revenue` | Subscriptions table & MRR calculation |
| Broadcast | `/super-admin/broadcast` | Email composer & send history |
| Content | `/super-admin/content` | Recharts graphs: letter mastery, hardest letters, song plays |
| System | `/super-admin/system` | Health checks for DB, webhooks, email, audio |

### 4. **Access Control**
- Middleware protection: Added `/super-admin` to protected routes in `src/lib/supabase/middleware.ts`
- Client verification: Each page calls `GET /api/super-admin/verify` on mount
- Server verification: Each API route checks `user.email === 'akinwoleolaclinton@gmail.com'`
- Double protection: Page + API = if someone bypasses one, the other blocks them

### 5. **Dependencies Added**
- `resend@^4.0.1` — Email API for broadcasts
- Added to `package.json` — Run `npm install` to fetch

---

## Pre-Deployment Checklist

### Step 1: Run SQL Migration
Copy & run this in your Supabase SQL Editor:

```sql
create table if not exists public.broadcast_history (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  recipient_filter text not null check (recipient_filter in ('all', 'free', 'paid', 'school_admin', 'new_this_week')),
  recipient_count int not null,
  sent_at timestamptz default now(),
  sent_by text not null
);

alter table public.broadcast_history enable row level security;

create policy 'Service role only' on public.broadcast_history
  for all
  to service_role
  using (true)
  with check (true);
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Add Environment Variables

In `.env.local` (already there), update:

```
RESEND_API_KEY=your-resend-api-key
```

Get your Resend API key from: https://resend.com/api-keys

### Step 4: Deploy to Vercel

```bash
npm run build
# Push to GitHub
git add -A
git commit -m "feat: add super admin dashboard"
git push origin main
```

---

## Security Notes

### Access Control
- Only `akinwoleolaclinton@gmail.com` can access `/super-admin`
- Non-super-admins are silently redirected to `/home`
- All API routes verify super admin status server-side
- No links to `/super-admin` anywhere in the app

### Data Protection
- Service role used for privileged DB writes (subscription changes, etc.)
- Broadcast emails exclude super admin's own email
- All email sending goes through Resend API (no plaintext credentials)
- Broadcast history stored in RLS-protected table

### Operations
- Subscriptions can be manually activated (sets expires_at = 1 year from now)
- Deactivation is instant (sets active = false)
- Email broadcasts are fire-and-forget (errors logged but don't break flow)
- System health checks are read-only

---

## Usage Examples

### Manually Activate a User's Subscription
1. Go to `/super-admin/users`
2. Find user in table
3. Click **Activate** button
4. ✅ Their subscription is now active for 1 year

### Send an Email Broadcast
1. Go to `/super-admin/broadcast`
2. Select recipient filter (e.g., "Paid Users Only")
3. Write subject & message
4. Click **📧 Send Broadcast**
5. Check **Send History** section

### View Content Stats
1. Go to `/super-admin/content`
2. See bar charts for:
   - Most mastered letters (green)
   - Hardest letters (red)
   - Most played songs (amber)

### Monitor System Health
1. Go to `/super-admin/system`
2. See status of: Database, Paystack webhooks, Email service, Audio files
3. Auto-refreshes every 5 minutes

---

## Pricing Assumptions
- Explorer (individual): ₦1,500/month
- Family (school): ₦2,500/month
- Monthly Recurring Revenue (MRR) = (explorers × 1500) + (families × 2500)

Adjust in `src/app/api/super-admin/revenue/route.ts` if needed.

---

## Future Enhancements

- Delete user button (currently just displays, needs confirmation modal)
- School deactivation toggle (API ready, UI not implemented)
- Student bulk import/export for school admins
- Export revenue reports as CSV
- Webhook retry logic for failed emails
- Real "last_activity" tracking (currently defaults to created_at)

---

## Testing Locally

1. Sign in as `akinwoleolaclinton@gmail.com` locally
2. Visit `http://localhost:3000/super-admin`
3. You should see the dashboard
4. Try different pages and filters
5. Test broadcast sending (will fail without RESEND_API_KEY, but shows error clearly)

---

## Deployed URL
Once live on Vercel:
```
https://ami-by-koko.vercel.app/super-admin
```

Only accessible when logged in as the super admin email.

---

## Troubleshooting

### "Forbidden" error
- Confirm you're logged in as `akinwoleolaclinton@gmail.com`
- Check browser console for auth errors
- Verify `.env.local` has correct Supabase keys

### Broadcast not sending
- Confirm `RESEND_API_KEY` is set in `.env.local`
- Check Resend API key has email sending permission
- Check server logs in Vercel dashboard

### Stats showing zero
- Ensure users/subscriptions/progress exist in Supabase
- Check RLS policies aren't blocking service role reads
- Service role client should bypass RLS, but verify in SQL Editor

### Sidebar not collapsing
- Try hard refresh (Ctrl+Shift+R)
- State managed client-side, should work out of box

---

## Support
Contact Clinton if issues arise. This dashboard is admin-only and should be treated with security first.
