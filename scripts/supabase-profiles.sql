-- EduLink - tabela profiles/utilizatori pentru Supabase
-- Ruleaza in Supabase SQL Editor dupa ce auth este activ.

create extension if not exists pgcrypto;

-- Additive: supports the combined secondary + bachelor program displayed in onboarding.
do $$
begin
  if exists (select 1 from pg_type where typname = 'degree_type') then
    alter type public.degree_type add value if not exists 'bacalaureat_licenta';
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('student', 'institution', 'company', 'admin');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  email text unique not null,
  full_name text not null,
  role public.user_role not null default 'student',
  headline text,
  bio text,
  avatar_url text,
  background_url text,
  location text,
  followers_count integer not null default 0 check (followers_count >= 0),
  qr_code_slug text unique
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, qr_code_slug)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, 'utilizator@edulink.local'), '@', 1), 'Utilizator nou'),
    lower(
      regexp_replace(
        coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, 'user'), '@', 1), 'user'),
        '[^a-zA-Z0-9]+',
        '-',
        'g'
      )
    ) || '-' || substring(new.id::text, 1, 8)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
on public.profiles
for select
using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
on public.profiles
for delete
using (auth.uid() = id);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_qr_code_slug on public.profiles(qr_code_slug);

-- ============================================================================
-- EduLink incremental domain migration (2026-07-31)
-- This section is intentionally additive/idempotent: it preserves existing rows
-- and can safely be re-run. Apply it after the base schema above.
-- ============================================================================

create extension if not exists citext;

create or replace function public.generate_16_char_code()
returns text
language plpgsql
volatile
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text := '';
  i integer;
begin
  for i in 1..16 loop
    code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::integer, 1);
    if i in (4, 8, 12) then code := code || '-'; end if;
  end loop;
  return code;
end;
$$;

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists institution_id uuid;

create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name citext not null unique,
  type text not null check (type in ('liceu', 'colegiu', 'universitate')),
  city text,
  website text,
  invite_code text unique default public.generate_16_char_code(),
  verified boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
  drop constraint if exists profiles_institution_id_fkey,
  add constraint profiles_institution_id_fkey foreign key (institution_id)
    references public.institutions(id) on delete set null;

alter table public.companies
  add column if not exists website text,
  add column if not exists company_size text,
  add column if not exists idno text,
  add column if not exists invite_code text,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.companies set invite_code = public.generate_16_char_code() where invite_code is null;
alter table public.companies alter column invite_code set default public.generate_16_char_code();
create unique index if not exists companies_invite_code_unique on public.companies(invite_code) where invite_code is not null;
create unique index if not exists institutions_invite_code_unique on public.institutions(invite_code) where invite_code is not null;

create table if not exists public.company_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  job_title text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, company_id)
);

create table if not exists public.institution_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  job_title text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, institution_id)
);

create table if not exists public.student_preferences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  desired_job_titles text[] not null default '{}',
  opportunity_types text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Recommendation requests contain contact data and must remain private until
-- a future consented publishing workflow explicitly releases a recommendation.
create table if not exists public.recommendation_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  recipient_name text not null check (char_length(trim(recipient_name)) between 2 and 160),
  recipient_email citext not null check (recipient_email ~* '^[^@[:space:]]+@[^@[:space:]]+\\.[^@[:space:]]+$'),
  relationship text,
  message text check (message is null or char_length(message) <= 1500),
  status text not null default 'draft' check (status in ('draft', 'requested', 'received', 'declined')),
  recommendation_text text check (recommendation_text is null or char_length(recommendation_text) <= 4000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.institution_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  type text not null check (type in ('liceu', 'colegiu', 'universitate')),
  city text not null,
  official_email citext not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (requested_by, name, official_email)
);

alter table public.educations
  add column if not exists institution_id uuid references public.institutions(id) on delete set null,
  add column if not exists graduation_year smallint;

alter table public.events
  add column if not exists title text,
  add column if not exists event_type public.event_type_enum not null default 'student_project';

alter table public.jobs
  add column if not exists work_mode public.work_mode,
  add column if not exists job_type public.job_type,
  add column if not exists location text,
  add column if not exists application_deadline timestamptz,
  add column if not exists is_active boolean not null default true;

alter table public.follows
  add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.follows drop constraint if exists follows_target_type_check;
alter table public.follows add constraint follows_target_type_check
  check (target_type in ('user', 'company', 'institution')) not valid;

create unique index if not exists follows_unique_target on public.follows(follower_id, target_type, target_id);
create index if not exists follows_follower_created_at_idx on public.follows(follower_id, created_at desc);
create index if not exists posts_creator_created_at_idx on public.posts(creator_id, created_at desc);
create index if not exists events_start_date_idx on public.events(start_date) where start_date is not null;
create index if not exists profiles_institution_id_idx on public.profiles(institution_id);
create index if not exists company_members_company_id_idx on public.company_members(company_id);
create index if not exists institution_members_institution_id_idx on public.institution_members(institution_id);

create or replace function public.is_company_admin(target_company_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.company_members cm where cm.company_id = target_company_id and cm.user_id = auth.uid() and cm.role = 'admin');
$$;
create or replace function public.is_institution_admin(target_institution_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.institution_members im where im.institution_id = target_institution_id and im.user_id = auth.uid() and im.role = 'admin');
$$;

-- RLS is enabled on every new relation. Policies deliberately grant only the
-- minimum access needed by onboarding, feed discovery, and member settings.
alter table public.institutions enable row level security;
alter table public.company_members enable row level security;
alter table public.institution_members enable row level security;
alter table public.student_preferences enable row level security;
alter table public.recommendation_requests enable row level security;
alter table public.institution_requests enable row level security;
alter table public.follows enable row level security;

do $$ begin
  create policy "institutions readable" on public.institutions for select using (verified or public.is_institution_admin(id));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "company memberships readable by members" on public.company_members for select using (user_id = auth.uid() or public.is_company_admin(company_id));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "institution memberships readable by members" on public.institution_members for select using (user_id = auth.uid() or public.is_institution_admin(institution_id));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "student preferences private" on public.student_preferences for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "recommendation requests private" on public.recommendation_requests for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;
drop trigger if exists set_recommendation_requests_updated_at on public.recommendation_requests;
create trigger set_recommendation_requests_updated_at
before update on public.recommendation_requests
for each row execute function public.set_updated_at();

do $$ begin
  create policy "institution requests own" on public.institution_requests for insert with check (requested_by = auth.uid());
  create policy "institution requests requester read" on public.institution_requests for select using (requested_by = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "follows owner only" on public.follows for all using (follower_id = auth.uid()) with check (follower_id = auth.uid());
exception when duplicate_object then null; end $$;

-- Student community content is allowed; jobs stay constrained to company admins.
do $$ begin
  create policy "post creators need active profile" on public.posts for insert with check (creator_id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.onboarding_completed));
  create policy "event creators need active profile" on public.events for insert with check (creator_id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.onboarding_completed));
exception when duplicate_object then null; end $$;
drop policy if exists "only company role can create jobs" on public.jobs;
drop policy if exists "only company admins can create jobs" on public.jobs;
create policy "only company admins can create jobs" on public.jobs for insert
with check (
  public.is_company_admin(company_id)
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'company' and p.onboarding_completed
  )
);

-- Storage policy for avatars: users own the first path segment, their UUID.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
do $$ begin
  create policy "avatar owner manages files" on storage.objects for all to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
exception when duplicate_object then null; end $$;

-- Project/certificate media is intentionally a separate, public bucket: an
-- uploaded file is shown only where the student links it from their profile.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-media', 'profile-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
do $$ begin
  create policy "profile media owner manages files" on storage.objects for all to authenticated
  using (bucket_id = 'profile-media' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'profile-media' and (storage.foldername(name))[1] = auth.uid()::text);
exception when duplicate_object then null; end $$;

-- Product decision: GPA is not collected or retained by EduLink. This is a
-- destructive, user-requested removal; export any historic values before apply.
alter table public.educations drop column if exists gpa;

-- A self-directed project, volunteer activity or internship can legitimately
-- have no employer. Preserve that fact instead of inserting a fictional name.
alter table public.experiences alter column company_name drop not null;

-- Normalize skill levels used by the redesigned student onboarding.
alter table public.skills drop constraint if exists skills_level_check;
alter table public.skills add constraint skills_level_check
  check (level is null or level in ('incepator', 'intermediar', 'avansat')) not valid;

-- Defense in depth for legacy permissive RLS policies: a client cannot promote
-- itself after onboarding and cannot insert a job unless it is a company.
create or replace function public.prevent_completed_profile_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.onboarding_completed and new.role is distinct from old.role then
    raise exception 'Rolul nu poate fi modificat după finalizarea onboarding-ului';
  end if;
  return new;
end;
$$;
drop trigger if exists prevent_completed_profile_role_change on public.profiles;
create trigger prevent_completed_profile_role_change before update of role on public.profiles
for each row execute function public.prevent_completed_profile_role_change();

create or replace function public.enforce_company_job_creator()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'company' and p.onboarding_completed) then
    raise exception 'Doar conturile companie finalizate pot publica joburi';
  end if;
  if not public.is_company_admin(new.company_id) then
    raise exception 'Utilizatorul nu este administrator al companiei selectate';
  end if;
  return new;
end;
$$;
drop trigger if exists enforce_company_job_creator on public.jobs;
create trigger enforce_company_job_creator before insert or update on public.jobs
for each row execute function public.enforce_company_job_creator();
