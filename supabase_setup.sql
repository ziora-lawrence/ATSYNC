-- ============================================================
-- ATSYNC — Supabase Database Setup
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PROFILES TABLE (stores agency name linked to auth user)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  agency_name text,
  email       text,
  created_at  timestamptz default now()
);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, agency_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'agency_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. WAITLIST TABLE
create table if not exists public.waitlist (
  id         bigserial primary key,
  email      text not null unique,
  status     text not null default 'waiting',
  created_at timestamptz default now()
);

-- 3. AGENT PROFILES TABLE (Bob's configuration per agency)
create table if not exists public.agent_profiles (
  id                   bigserial primary key,
  user_id              uuid references auth.users(id) on delete cascade,
  agency_name          text,
  city_country         text,
  description          text,
  team_size            text,
  years_operating      text,
  services             text[],
  popular_service      text,
  not_offered_services text,
  min_budget           text,
  deposit_required     text,
  turnaround_time      text,
  max_projects         text,
  response_time        text,
  process              text,
  tone                 text,
  never_say            text,
  delay_reasons        text,
  created_at           timestamptz default now(),
  unique (user_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS
alter table public.profiles      enable row level security;
alter table public.waitlist      enable row level security;
alter table public.agent_profiles enable row level security;

-- PROFILES: users can only read/update their own row
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- WAITLIST: anyone can insert (public sign-up), only authenticated admins can read
drop policy if exists "Anyone can join waitlist" on public.waitlist;
create policy "Anyone can join waitlist"
  on public.waitlist for insert
  with check (true);

-- AGENT PROFILES: users manage their own profile
drop policy if exists "Users can view own agent profile" on public.agent_profiles;
create policy "Users can view own agent profile"
  on public.agent_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own agent profile" on public.agent_profiles;
create policy "Users can insert own agent profile"
  on public.agent_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own agent profile" on public.agent_profiles;
create policy "Users can update own agent profile"
  on public.agent_profiles for update
  using (auth.uid() = user_id);

-- Allow dashboard to read aggregate counts (anon can count waitlist rows)
drop policy if exists "Anon can count waitlist" on public.waitlist;
create policy "Anon can count waitlist"
  on public.waitlist for select
  using (true);

drop policy if exists "Anon can count agent profiles" on public.agent_profiles;
create policy "Anon can count agent profiles"
  on public.agent_profiles for select
  using (true);

-- 4. APPROVALS TABLE
create table if not exists public.approvals (
  id               uuid primary key default gen_random_uuid(),
  agency_client_id uuid not null references public.agency_clients(id) on delete cascade,
  project_id       uuid references public.projects(id) on delete cascade,
  type             text not null check (type in ('delivery_approval', 'change_request', 'scope_creep_flag')),
  title            text not null,
  description      text,
  status           text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_by     uuid references auth.users(id),
  requested_at     timestamptz default now(),
  resolved_at      timestamptz
);

alter table public.approvals enable row level security;

drop policy if exists "Conversation members can read approvals" on public.approvals;
create policy "Conversation members can read approvals"
  on public.approvals for select
  using (
    exists (
      select 1 from public.agency_clients ac
      where ac.id = approvals.agency_client_id
        and (ac.agency_id = auth.uid() or ac.client_id = auth.uid())
    )
  );

drop policy if exists "Agency can create approvals" on public.approvals;
create policy "Agency can create approvals"
  on public.approvals for insert
  with check (
    exists (
      select 1 from public.agency_clients ac
      where ac.id = approvals.agency_client_id and ac.agency_id = auth.uid()
    )
  );

drop policy if exists "Client can update approval status" on public.approvals;
create policy "Client can update approval status"
  on public.approvals for update
  using (
    exists (
      select 1 from public.agency_clients ac
      where ac.id = approvals.agency_client_id and ac.client_id = auth.uid()
    )
  );

-- 5. PAYMENTS TABLE
create table if not exists public.payments (
  id                   uuid primary key default gen_random_uuid(),
  agency_client_id     uuid not null references public.agency_clients(id) on delete cascade,
  project_id           uuid references public.projects(id) on delete cascade,
  approval_id          uuid references public.approvals(id) on delete set null,
  amount               numeric not null,
  currency             text default 'NGN',
  status               text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  paystack_reference   text unique,
  paystack_access_code text,
  description          text,
  created_at           timestamptz default now(),
  paid_at              timestamptz
);

alter table public.payments enable row level security;

-- NOTE: Approval-triggered rule enforced in application logic (payments.js /initiate)
-- rather than a DB constraint, because cross-table status checks in Postgres
-- require triggers which add complexity. The Express route verifies approval.status = 'approved'
-- before creating a payment row.

drop policy if exists "Conversation members can read payments" on public.payments;
create policy "Conversation members can read payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.agency_clients ac
      where ac.id = payments.agency_client_id
        and (ac.agency_id = auth.uid() or ac.client_id = auth.uid())
    )
  );

drop policy if exists "Agency can create payments" on public.payments;
create policy "Agency can create payments"
  on public.payments for insert
  with check (
    exists (
      select 1 from public.agency_clients ac
      where ac.id = payments.agency_client_id and ac.agency_id = auth.uid()
    )
  );

-- Webhook updates use the service-role key (bypasses RLS), so no UPDATE policy needed for end-users.
-- If you want to allow service-role only updates via RLS: use a permissive policy scoped to service_role.
drop policy if exists "Service role can update payments" on public.payments;
create policy "Service role can update payments"
  on public.payments for update
  using (true);



