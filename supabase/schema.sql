-- Intelligent CRM — Supabase schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Single shared workspace: every signed-in user reads/writes the same pipeline
-- (mirrors the app's current design — "assigned to" is a display label, not an
-- access boundary). Add per-workspace RLS later if this ever serves more than
-- one team.

-- ids are generated client-side (see src/lib/id.ts) and sent explicitly on
-- insert, so both tables use a plain text primary key rather than a
-- DB-generated uuid.

create table if not exists leads (
  id text primary key,
  company text not null,
  contact_name text not null,
  email text not null,
  phone text not null default '',
  project_type text not null,
  source text not null,
  stage text not null default 'new'
    check (stage in ('new', 'contacted', 'followup', 'opportunity', 'won', 'lost')),
  est_value numeric not null default 0,
  probability integer not null default 20,
  proposal_cost numeric not null default 0,
  created_at timestamptz not null default now(),
  last_contact_at timestamptz not null default now(),
  next_follow_up_at timestamptz,
  close_date timestamptz,
  assigned_to text not null default 'You',
  loss_reason text
);

create table if not exists activities (
  id text primary key,
  lead_id text not null references leads(id) on delete cascade,
  date timestamptz not null default now(),
  type text not null check (type in ('call', 'email', 'meeting', 'note', 'system')),
  text text not null,
  author text not null default 'You'
);

create index if not exists activities_lead_id_idx on activities (lead_id);
create index if not exists leads_stage_idx on leads (stage);

alter table leads enable row level security;
alter table activities enable row level security;

-- Any signed-in user can read and write; anonymous (logged-out) requests are
-- rejected. This is the auth gate — Postgres enforces it even if the app's
-- own login screen were bypassed.
-- Postgres has no "CREATE POLICY IF NOT EXISTS", so each is dropped first —
-- safe to run this whole script again if you're not sure what already applied.
drop policy if exists "leads: authenticated read" on leads;
create policy "leads: authenticated read" on leads
  for select using (auth.role() = 'authenticated');
drop policy if exists "leads: authenticated insert" on leads;
create policy "leads: authenticated insert" on leads
  for insert with check (auth.role() = 'authenticated');
drop policy if exists "leads: authenticated update" on leads;
create policy "leads: authenticated update" on leads
  for update using (auth.role() = 'authenticated');
drop policy if exists "leads: authenticated delete" on leads;
create policy "leads: authenticated delete" on leads
  for delete using (auth.role() = 'authenticated');

drop policy if exists "activities: authenticated read" on activities;
create policy "activities: authenticated read" on activities
  for select using (auth.role() = 'authenticated');
drop policy if exists "activities: authenticated insert" on activities;
create policy "activities: authenticated insert" on activities
  for insert with check (auth.role() = 'authenticated');
drop policy if exists "activities: authenticated update" on activities;
create policy "activities: authenticated update" on activities
  for update using (auth.role() = 'authenticated');
drop policy if exists "activities: authenticated delete" on activities;
create policy "activities: authenticated delete" on activities
  for delete using (auth.role() = 'authenticated');
