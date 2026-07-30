-- EduLink - additive Supabase migration
-- Safe to run more than once. It does not drop user data or replace existing tables.
-- Review in Supabase SQL Editor before applying to production.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role' and typnamespace = 'public'::regnamespace) then
    create type public.user_role as enum ('student', 'institution', 'company', 'admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'event_type_enum' and typnamespace = 'public'::regnamespace) then
    create type public.event_type_enum as enum (
      'academic_lecture', 'workshop_training', 'hackathon_contest',
      'student_project', 'career_fair', 'networking_meetup',
      'volunteer_charity', 'webinar_online', 'sports_recreation', 'other'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'member_role' and typnamespace = 'public'::regnamespace) then
    create type public.member_role as enum ('admin', 'member');
  end if;
end $$;

-- Existing profile table: retain all values and extend it for onboarding.
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists desired_roles text[] not null default '{}',
  add column if not exists desired_opportunity_types text[] not null default '{}';

create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  institution_type text not null check (institution_type in ('high_school', 'college', 'university', 'other')),
  city text,
  official_email text,
  website text,
  invite_code text not null unique,
  created_by uuid references public.profiles(id) on delete set null,
  is_verified boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (name, city)
);

alter table public.profiles
  add column if not exists institution_id uuid references public.institutions(id) on delete set null;

alter table public.companies
  add column if not exists invite_code text,
  add column if not exists tax_id text,
  add column if not exists team_size text,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

-- Make invite codes readable but non-sequential: XXXX-XXXX-XXXX-XXXX.
create or replace function public.generate_invite_code()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  raw text := '';
  i integer;
begin
  for i in 1..16 loop
    raw := raw || substr(alphabet, 1 + floor(random() * length(alphabet))::integer, 1);
  end loop;
  return substr(raw, 1, 4) || '-' || substr(raw, 5, 4) || '-' || substr(raw, 9, 4) || '-' || substr(raw, 13, 4);
end;
$$;

-- Populate only records that do not yet have a code, then enforce uniqueness.
update public.companies
set invite_code = public.generate_invite_code()
where invite_code is null;

alter table public.companies
  alter column invite_code set default public.generate_invite_code();

create unique index if not exists companies_invite_code_key on public.companies(invite_code) where invite_code is not null;

create table if not exists public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  member_role public.member_role not null default 'member',
  job_title text,
  joined_at timestamptz not null default timezone('utc', now()),
  primary key (company_id, profile_id)
);

create table if not exists public.institution_members (
  institution_id uuid not null references public.institutions(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  member_role public.member_role not null default 'member',
  position_title text,
  joined_at timestamptz not null default timezone('utc', now()),
  primary key (institution_id, profile_id)
);

create table if not exists public.institution_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  institution_type text not null check (institution_type in ('high_school', 'college', 'university', 'other')),
  city text not null,
  official_email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('user', 'company', 'institution')),
  target_id uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (follower_id, target_type, target_id),
  check (target_type <> 'user' or follower_id <> target_id)
);

-- The existing events table was created previously. Extend it only when present.
do $$
begin
  if to_regclass('public.events') is not null then
    alter table public.events
      add column if not exists event_type public.event_type_enum not null default 'student_project';
  end if;
end $$;

-- Update timestamps without deleting prior triggers.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_institutions_updated_at on public.institutions;
create trigger set_institutions_updated_at before update on public.institutions
for each row execute function public.set_updated_at();

drop trigger if exists set_companies_updated_at on public.companies;
create trigger set_companies_updated_at before update on public.companies
for each row execute function public.set_updated_at();

-- A completed user cannot self-escalate or change their account type later.
create or replace function public.prevent_completed_role_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.onboarding_completed and new.role is distinct from old.role then
    raise exception 'Role cannot be changed after onboarding';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_completed_role_change on public.profiles;
create trigger prevent_completed_role_change before update on public.profiles
for each row execute function public.prevent_completed_role_change();

-- New organization creators become the first admins automatically.
create or replace function public.add_company_creator_as_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is not null then
    insert into public.company_members (company_id, profile_id, member_role)
    values (new.id, new.created_by, 'admin')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists add_company_creator_as_admin on public.companies;
create trigger add_company_creator_as_admin after insert on public.companies
for each row execute function public.add_company_creator_as_admin();

create or replace function public.add_institution_creator_as_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is not null then
    insert into public.institution_members (institution_id, profile_id, member_role)
    values (new.id, new.created_by, 'admin')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists add_institution_creator_as_admin on public.institutions;
create trigger add_institution_creator_as_admin after insert on public.institutions
for each row execute function public.add_institution_creator_as_admin();

-- Invite-code matching stays on the server; clients can never list invite codes.
create or replace function public.join_company_with_invite(p_company_id uuid, p_invite_code text, p_job_title text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if not exists (select 1 from public.companies where id = p_company_id and invite_code = upper(trim(p_invite_code))) then
    raise exception 'Invalid invite code';
  end if;
  insert into public.company_members (company_id, profile_id, job_title)
  values (p_company_id, auth.uid(), nullif(trim(p_job_title), ''))
  on conflict (company_id, profile_id) do update set job_title = excluded.job_title;
  return true;
end;
$$;

create or replace function public.join_institution_with_invite(p_institution_id uuid, p_invite_code text, p_position_title text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if not exists (select 1 from public.institutions where id = p_institution_id and invite_code = upper(trim(p_invite_code))) then
    raise exception 'Invalid invite code';
  end if;
  insert into public.institution_members (institution_id, profile_id, position_title)
  values (p_institution_id, auth.uid(), nullif(trim(p_position_title), ''))
  on conflict (institution_id, profile_id) do update set position_title = excluded.position_title;
  return true;
end;
$$;

grant execute on function public.join_company_with_invite(uuid, text, text) to authenticated;
grant execute on function public.join_institution_with_invite(uuid, text, text) to authenticated;

-- RLS. Invite codes are deliberately omitted from every public SELECT policy.
alter table public.profiles enable row level security;
alter table public.institutions enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.institution_members enable row level security;
alter table public.institution_requests enable row level security;
alter table public.follows enable row level security;

drop policy if exists profiles_public_read on public.profiles;
create policy profiles_public_read on public.profiles for select using (true);
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists institutions_public_read on public.institutions;
create policy institutions_public_read on public.institutions for select using (true);
drop policy if exists institutions_create_by_institution_user on public.institutions;
create policy institutions_create_by_institution_user on public.institutions for insert with check (auth.uid() = created_by);
drop policy if exists institutions_manage_by_admin on public.institutions;
create policy institutions_manage_by_admin on public.institutions for update using (
  exists (select 1 from public.institution_members m where m.institution_id = id and m.profile_id = auth.uid() and m.member_role = 'admin')
) with check (
  exists (select 1 from public.institution_members m where m.institution_id = id and m.profile_id = auth.uid() and m.member_role = 'admin')
);

drop policy if exists companies_public_read on public.companies;
create policy companies_public_read on public.companies for select using (true);
drop policy if exists companies_create_by_company_user on public.companies;
create policy companies_create_by_company_user on public.companies for insert with check (auth.uid() = created_by);
drop policy if exists companies_manage_by_admin on public.companies;
create policy companies_manage_by_admin on public.companies for update using (
  exists (select 1 from public.company_members m where m.company_id = id and m.profile_id = auth.uid() and m.member_role = 'admin')
) with check (
  exists (select 1 from public.company_members m where m.company_id = id and m.profile_id = auth.uid() and m.member_role = 'admin')
);

drop policy if exists company_members_visible_to_members on public.company_members;
create policy company_members_visible_to_members on public.company_members for select using (
  profile_id = auth.uid() or exists (select 1 from public.company_members mine where mine.company_id = company_id and mine.profile_id = auth.uid())
);
drop policy if exists company_members_manage_by_admin on public.company_members;
create policy company_members_manage_by_admin on public.company_members for all using (
  exists (select 1 from public.company_members mine where mine.company_id = company_id and mine.profile_id = auth.uid() and mine.member_role = 'admin')
) with check (
  exists (select 1 from public.company_members mine where mine.company_id = company_id and mine.profile_id = auth.uid() and mine.member_role = 'admin')
);

drop policy if exists institution_members_visible_to_members on public.institution_members;
create policy institution_members_visible_to_members on public.institution_members for select using (
  profile_id = auth.uid() or exists (select 1 from public.institution_members mine where mine.institution_id = institution_id and mine.profile_id = auth.uid())
);
drop policy if exists institution_members_manage_by_admin on public.institution_members;
create policy institution_members_manage_by_admin on public.institution_members for all using (
  exists (select 1 from public.institution_members mine where mine.institution_id = institution_id and mine.profile_id = auth.uid() and mine.member_role = 'admin')
) with check (
  exists (select 1 from public.institution_members mine where mine.institution_id = institution_id and mine.profile_id = auth.uid() and mine.member_role = 'admin')
);

drop policy if exists institution_requests_own_insert on public.institution_requests;
create policy institution_requests_own_insert on public.institution_requests for insert with check (requester_id = auth.uid());
drop policy if exists institution_requests_own_read on public.institution_requests;
create policy institution_requests_own_read on public.institution_requests for select using (requester_id = auth.uid());

drop policy if exists follows_own_read on public.follows;
create policy follows_own_read on public.follows for select using (follower_id = auth.uid());
drop policy if exists follows_own_write on public.follows;
create policy follows_own_write on public.follows for all using (follower_id = auth.uid()) with check (follower_id = auth.uid());

-- Student/community publishing is allowed. Job creation stays restricted to company accounts.
do $$
begin
  if to_regclass('public.posts') is not null then
    alter table public.posts enable row level security;
    execute 'drop policy if exists posts_public_read on public.posts';
    execute 'create policy posts_public_read on public.posts for select using (true)';
    execute 'drop policy if exists posts_own_write on public.posts';
    execute 'create policy posts_own_write on public.posts for all using (creator_id = auth.uid()) with check (creator_id = auth.uid())';
  end if;
  if to_regclass('public.events') is not null then
    alter table public.events enable row level security;
    execute 'drop policy if exists events_public_read on public.events';
    execute 'create policy events_public_read on public.events for select using (true)';
    execute 'drop policy if exists events_own_write on public.events';
    execute 'create policy events_own_write on public.events for all using (creator_id = auth.uid()) with check (creator_id = auth.uid())';
  end if;
  if to_regclass('public.jobs') is not null then
    alter table public.jobs enable row level security;
    execute 'drop policy if exists jobs_public_read on public.jobs';
    execute 'create policy jobs_public_read on public.jobs for select using (true)';
    execute 'drop policy if exists jobs_company_write on public.jobs';
    execute $policy$create policy jobs_company_write on public.jobs for all
      using (company_id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'company'))
      with check (company_id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'company'))$policy$;
  end if;
end $$;

create index if not exists idx_profiles_institution_id on public.profiles(institution_id);
create index if not exists idx_follows_follower_created_at on public.follows(follower_id, created_at desc);
create index if not exists idx_company_members_profile_id on public.company_members(profile_id);
create index if not exists idx_institution_members_profile_id on public.institution_members(profile_id);
create index if not exists idx_institutions_name on public.institutions(name);
create index if not exists idx_posts_creator_created_at on public.posts(creator_id, created_at desc);
create index if not exists idx_events_start_date on public.events(start_date);
