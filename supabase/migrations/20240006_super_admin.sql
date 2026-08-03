-- ============================================================
-- Àmì by Kòkò — Migration 006
-- Super Admin Dashboard & Email Broadcast
-- ============================================================

-- Create broadcast_history table for tracking email sends
create table if not exists public.broadcast_history (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  recipient_filter text not null check (recipient_filter in ('all', 'free', 'paid', 'school_admin', 'new_this_week')),
  recipient_count int not null,
  sent_at timestamptz default now(),
  sent_by text not null
);

-- Enable RLS on broadcast_history
alter table public.broadcast_history enable row level security;

-- Only service role can access broadcast_history
create policy "Service role only" on public.broadcast_history
  for all
  to service_role
  using (true)
  with check (true);
