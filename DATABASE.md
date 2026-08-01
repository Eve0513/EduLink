## Table `profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `email` | `text` |  Unique |
| `full_name` | `text` |  |
| `role` | `user_role` |  |
| `headline` | `text` |  Nullable |
| `bio` | `text` |  Nullable |
| `avatar_url` | `text` |  Nullable |
| `background_url` | `text` |  Nullable |
| `location` | `text` |  Nullable |
| `followers_count` | `int4` |  Nullable |
| `qr_code_slug` | `text` |  Nullable Unique |
| `first_name` | `text` |  Nullable |
| `last_name` | `text` |  Nullable |
| `onboarding_completed` | `bool` |  |
| `institution_id` | `uuid` |  Nullable |

## Table `educations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `profile_id` | `uuid` |  |
| `institution_name` | `text` |  |
| `degree` | `degree_type` |  |
| `field_of_study` | `text` |  |
| `start_date` | `date` |  |
| `end_date` | `date` |  Nullable |
| `is_current` | `bool` |  Nullable |
| `institution_id` | `uuid` |  Nullable |
| `graduation_year` | `int2` |  Nullable |

## Table `experiences`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `profile_id` | `uuid` |  |
| `company_name` | `text` |  Nullable |
| `position_title` | `text` |  |
| `location` | `text` |  Nullable |
| `work_mode` | `work_mode` |  Nullable |
| `job_type` | `job_type` |  Nullable |
| `start_date` | `date` |  |
| `end_date` | `date` |  Nullable |
| `is_current` | `bool` |  Nullable |
| `description` | `text` |  Nullable |

## Table `projects`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `profile_id` | `uuid` |  |
| `experience_id` | `uuid` |  Nullable |
| `education_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `github_url` | `text` |  Nullable |
| `live_demo_url` | `text` |  Nullable |
| `technologies` | `_text` |  Nullable |
| `image_url` | `text` |  Nullable |

## Table `certificates`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `profile_id` | `uuid` |  |
| `title` | `text` |  |
| `issuing_organization` | `text` |  |
| `issue_date` | `date` |  Nullable |
| `expiry_date` | `date` |  Nullable |
| `credential_url` | `text` |  Nullable |

## Table `skills`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `profile_id` | `uuid` |  |
| `name` | `text` |  |
| `level` | `text` |  Nullable |

## Table `ai_generations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `profile_id` | `uuid` |  |
| `created_at` | `timestamptz` |  |
| `generation_type` | `ai_generation_type` |  |
| `input_prompt` | `text` |  Nullable |
| `generated_content` | `jsonb` |  |
| `ats_score` | `int4` |  Nullable |

## Table `qr_codes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `profile_id` | `uuid` |  |
| `qr_slug` | `text` |  Unique |
| `qr_svg_url` | `text` |  Nullable |
| `qr_png_url` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `companies`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  Unique |
| `location` | `text` |  Nullable |
| `sector` | `text` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `link_site` | `text` |  Nullable |
| `verified` | `bool` |  Nullable |
| `created_at` | `timestamp` |  Nullable |
| `phone` | `text` |  Nullable |
| `contact_email` | `text` |  Nullable |
| `contact_link` | `text` |  Nullable |
| `website` | `text` |  Nullable |
| `company_size` | `text` |  Nullable |
| `idno` | `text` |  Nullable |
| `invite_code` | `text` |  Nullable |
| `updated_at` | `timestamptz` |  |

## Table `posts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `creator_id` | `uuid` |  |
| `content` | `text` |  |
| `image_url` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `jobs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `company_id` | `uuid` |  |
| `title` | `text` |  |
| `description` | `text` |  |
| `requirements` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `work_mode` | `work_mode` |  Nullable |
| `job_type` | `job_type` |  Nullable |
| `location` | `text` |  Nullable |
| `application_deadline` | `timestamptz` |  Nullable |
| `is_active` | `bool` |  |

## Table `events`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `creator_id` | `uuid` |  |
| `image_url` | `text` |  Nullable |
| `location` | `text` |  Nullable |
| `start_date` | `date` |  Nullable |
| `start_time` | `time` |  Nullable |
| `timezone` | `text` |  Nullable |
| `mode` | `event_mode` |  Nullable |
| `description` | `text` |  Nullable |
| `frequency` | `event_frequency` |  Nullable |
| `end_date` | `date` |  Nullable |
| `end_time` | `time` |  Nullable |
| `created_at` | `timestamptz` |  |
| `event_type` | `event_type_enum` |  |
| `title` | `text` |  Nullable |

## Table `follows`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `follower_id` | `uuid` |  |
| `target_type` | `text` |  |
| `target_id` | `uuid` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `institutions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `citext` |  Unique |
| `type` | `text` |  |
| `city` | `text` |  Nullable |
| `website` | `text` |  Nullable |
| `invite_code` | `text` |  Nullable Unique |
| `verified` | `bool` |  |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `company_members`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `company_id` | `uuid` |  |
| `role` | `text` |  |
| `job_title` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `institution_members`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `institution_id` | `uuid` |  |
| `role` | `text` |  |
| `job_title` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `student_preferences`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `profile_id` | `uuid` |  Unique |
| `desired_job_titles` | `_text` |  |
| `opportunity_types` | `_text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `institution_requests`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `requested_by` | `uuid` |  |
| `name` | `text` |  |
| `type` | `text` |  |
| `city` | `text` |  |
| `official_email` | `citext` |  |
| `status` | `text` |  |
| `reviewed_by` | `uuid` |  Nullable |
| `reviewed_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `recommendation_requests`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `profile_id` | `uuid` |  |
| `recipient_name` | `text` |  |
| `recipient_email` | `citext` |  |
| `relationship` | `text` |  Nullable |
| `message` | `text` |  Nullable |
| `status` | `text` |  |
| `recommendation_text` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Custom Types / Enums

### `event_type_enum`

`academic_lecture` | `workshop_training` | `hackathon_contest` | `student_project` | `career_fair` | `networking_meetup` | `volunteer_charity` | `webinar_online` | `sports_recreation` | `other`

### `ai_generation_type`

`cv_optimization` | `website_portfolio` | `ats_check`

### `user_role`

`student` | `institution` | `company` | `admin`

### `work_mode`

`onsite` | `hybrid` | `remote`

### `job_type`

`fulltime` | `parttime` | `contract` | `volunteer` | `temporary` | `internship` | `other`

### `event_mode`

`fizic` | `virtual`

### `event_frequency`

`niciodata` | `zilnic` | `saptamanal`

### `degree_type`

`licenta` | `master` | `doctorat` | `bacalaureat` | `bacalaureat_licenta`

## RLS Policies

### `profiles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Profiles are publicly readable` | SELECT | public | PERMISSIVE | `true` | — |
| `Users can insert their own profile` | INSERT | public | PERMISSIVE | — | `(auth.uid() = id)` |
| `Users can update their own profile` | UPDATE | public | PERMISSIVE | `(auth.uid() = id)` | `(auth.uid() = id)` |
| `Users can delete their own profile` | DELETE | public | PERMISSIVE | `(auth.uid() = id)` | — |
| `Profilurile sunt publice pentru vizualizare` | SELECT | public | PERMISSIVE | `true` | — |
| `Utilizatorii își pot crea doar propriul profil` | INSERT | public | PERMISSIVE | — | `(auth.uid() = id)` |
| `Utilizatorii își pot modifica doar propriul profil` | UPDATE | public | PERMISSIVE | `(auth.uid() = id)` | `(auth.uid() = id)` |
| `Utilizatorii își pot șterge doar propriul profil` | DELETE | public | PERMISSIVE | `(auth.uid() = id)` | — |

### `recommendation_requests`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `recommendation requests private` | ALL | public | PERMISSIVE | `(profile_id = auth.uid())` | `(profile_id = auth.uid())` |

### `jobs`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `only company admins can create jobs` | INSERT | public | PERMISSIVE | — | `(is_company_admin(company_id) AND (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.role = 'company'::user_role) AND p.onboarding_completed))))` |
| `Joburile sunt vizibile publicului` | SELECT | public | PERMISSIVE | `true` | — |
| `Doar companiile isi pot gestiona joburile` | ALL | public | PERMISSIVE | `(auth.uid() = company_id)` | `(auth.uid() = company_id)` |

### `educations`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Educatia este publica` | SELECT | public | PERMISSIVE | `true` | — |
| `CRUD propriu pe educatie` | ALL | public | PERMISSIVE | `(auth.uid() = profile_id)` | — |

### `experiences`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Experienta este publica` | SELECT | public | PERMISSIVE | `true` | — |
| `CRUD propriu pe experienta` | ALL | public | PERMISSIVE | `(auth.uid() = profile_id)` | — |

### `projects`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Proiectele sunt publice` | SELECT | public | PERMISSIVE | `true` | — |
| `CRUD propriu pe proiecte` | ALL | public | PERMISSIVE | `(auth.uid() = profile_id)` | — |

### `certificates`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Certificatele sunt publice` | SELECT | public | PERMISSIVE | `true` | — |
| `CRUD propriu pe certificate` | ALL | public | PERMISSIVE | `(auth.uid() = profile_id)` | — |

### `skills`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Skill-urile sunt publice` | SELECT | public | PERMISSIVE | `true` | — |
| `CRUD propriu pe skills` | ALL | public | PERMISSIVE | `(auth.uid() = profile_id)` | — |

### `ai_generations`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Generarile AI sunt strict private` | ALL | public | PERMISSIVE | `(auth.uid() = profile_id)` | — |

### `qr_codes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Codurile QR sunt private` | ALL | public | PERMISSIVE | `(auth.uid() = profile_id)` | — |

### `companies`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Companiile sunt publice pentru vizualizare` | SELECT | public | PERMISSIVE | `(verified = true)` | — |
| `Creatorul poate edita compania` | UPDATE | public | PERMISSIVE | `(auth.uid() = created_by)` | — |

### `events`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Evenimentele sunt publice pentru vizualizare` | SELECT | public | PERMISSIVE | `true` | — |
| `CRUD propriu pe evenimente` | ALL | public | PERMISSIVE | `(auth.uid() = creator_id)` | — |
| `Evenimentele sunt vizibile publicului` | SELECT | public | PERMISSIVE | `true` | — |
| `CRUD complet pe evenimentele proprii` | ALL | public | PERMISSIVE | `(auth.uid() = creator_id)` | `(auth.uid() = creator_id)` |
| `event creators need active profile` | INSERT | public | PERMISSIVE | — | `((creator_id = auth.uid()) AND (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND p.onboarding_completed))))` |

### `posts`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Postarile sunt vizibile publicului` | SELECT | public | PERMISSIVE | `true` | — |
| `CRUD complet pe postari proprii` | ALL | public | PERMISSIVE | `(auth.uid() = creator_id)` | `(auth.uid() = creator_id)` |
| `post creators need active profile` | INSERT | public | PERMISSIVE | — | `((creator_id = auth.uid()) AND (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND p.onboarding_completed))))` |

### `follows`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Oricine poate citi urmaririle` | SELECT | public | PERMISSIVE | `true` | — |
| `Utilizatorii autentificati pot da follow` | INSERT | public | PERMISSIVE | — | `(auth.uid() = follower_id)` |
| `Utilizatorii isi pot sterge propriul follow` | DELETE | public | PERMISSIVE | `(auth.uid() = follower_id)` | — |
| `follows owner only` | ALL | public | PERMISSIVE | `(follower_id = auth.uid())` | `(follower_id = auth.uid())` |

### `institutions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `institutions readable` | SELECT | public | PERMISSIVE | `(verified OR is_institution_admin(id))` | — |

### `company_members`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `company memberships readable by members` | SELECT | public | PERMISSIVE | `((user_id = auth.uid()) OR is_company_admin(company_id))` | — |

### `institution_members`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `institution memberships readable by members` | SELECT | public | PERMISSIVE | `((user_id = auth.uid()) OR is_institution_admin(institution_id))` | — |

### `student_preferences`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `student preferences private` | ALL | public | PERMISSIVE | `(profile_id = auth.uid())` | `(profile_id = auth.uid())` |

### `institution_requests`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `institution requests own` | INSERT | public | PERMISSIVE | — | `(requested_by = auth.uid())` |
| `institution requests requester read` | SELECT | public | PERMISSIVE | `(requested_by = auth.uid())` | — |

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'student'::user_role,
  headline text,
  bio text,
  avatar_url text,
  background_url text,
  location text,
  followers_count integer DEFAULT 0,
  qr_code_slug text UNIQUE,
  first_name text,
  last_name text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  institution_id uuid,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.educations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  institution_name text NOT NULL,
  degree USER-DEFINED NOT NULL,
  field_of_study text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  is_current boolean DEFAULT false,
  institution_id uuid,
  graduation_year smallint,
  CONSTRAINT educations_pkey PRIMARY KEY (id),
  CONSTRAINT educations_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT educations_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id)
);
CREATE TABLE public.experiences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  company_name text,
  position_title text NOT NULL,
  location text,
  work_mode USER-DEFINED,
  job_type USER-DEFINED,
  start_date date NOT NULL,
  end_date date,
  is_current boolean DEFAULT false,
  description text,
  CONSTRAINT experiences_pkey PRIMARY KEY (id),
  CONSTRAINT experiences_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  experience_id uuid,
  education_id uuid,
  title text NOT NULL,
  description text,
  github_url text,
  live_demo_url text,
  technologies ARRAY,
  image_url text,
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT projects_experience_id_fkey FOREIGN KEY (experience_id) REFERENCES public.experiences(id),
  CONSTRAINT projects_education_id_fkey FOREIGN KEY (education_id) REFERENCES public.educations(id)
);
CREATE TABLE public.certificates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  title text NOT NULL,
  issuing_organization text NOT NULL,
  issue_date date,
  expiry_date date,
  credential_url text,
  CONSTRAINT certificates_pkey PRIMARY KEY (id),
  CONSTRAINT certificates_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.skills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  name text NOT NULL,
  level text CHECK (level IS NULL OR (level = ANY (ARRAY['incepator'::text, 'intermediar'::text, 'avansat'::text]))) NOT VALI),
  CONSTRAINT skills_pkey PRIMARY KEY (id),
  CONSTRAINT skills_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.ai_generations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  generation_type USER-DEFINED NOT NULL,
  input_prompt text,
  generated_content jsonb NOT NULL,
  ats_score integer CHECK (ats_score >= 0 AND ats_score <= 100),
  CONSTRAINT ai_generations_pkey PRIMARY KEY (id),
  CONSTRAINT ai_generations_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.qr_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  qr_slug text NOT NULL UNIQUE,
  qr_svg_url text,
  qr_png_url text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT qr_codes_pkey PRIMARY KEY (id),
  CONSTRAINT qr_codes_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.companies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  location text,
  sector text,
  created_by uuid,
  link_site text,
  verified boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  phone text CHECK (phone ~ '^[0-9+() -]{6,20}$'::text),
  contact_email text CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text),
  contact_link text CHECK (contact_link ~* '^https?://'::text),
  website text,
  company_size text,
  idno text,
  invite_code text DEFAULT generate_16_char_code(),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT companies_pkey PRIMARY KEY (id),
  CONSTRAINT companies_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  content text NOT NULL,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  requirements text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  work_mode USER-DEFINED,
  job_type USER-DEFINED,
  location text,
  application_deadline timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT jobs_pkey PRIMARY KEY (id),
  CONSTRAINT jobs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  image_url text,
  location text,
  start_date date,
  start_time time without time zone,
  timezone text,
  mode USER-DEFINED,
  description text,
  frequency USER-DEFINED,
  end_date date,
  end_time time without time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  event_type USER-DEFINED NOT NULL DEFAULT 'student_project'::event_type_enum,
  title text,
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.follows (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type = ANY (ARRAY['user'::text, 'company'::text, 'institution'::text])) NOT VALI),
  target_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT follows_pkey PRIMARY KEY (id),
  CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.institutions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name USER-DEFINED NOT NULL UNIQUE,
  type text NOT NULL CHECK (type = ANY (ARRAY['liceu'::text, 'colegiu'::text, 'universitate'::text])),
  city text,
  website text,
  invite_code text DEFAULT generate_16_char_code() UNIQUE,
  verified boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT institutions_pkey PRIMARY KEY (id),
  CONSTRAINT institutions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.company_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member'::text CHECK (role = ANY (ARRAY['admin'::text, 'member'::text])),
  job_title text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT company_members_pkey PRIMARY KEY (id),
  CONSTRAINT company_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT company_members_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.institution_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  institution_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member'::text CHECK (role = ANY (ARRAY['admin'::text, 'member'::text])),
  job_title text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT institution_members_pkey PRIMARY KEY (id),
  CONSTRAINT institution_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT institution_members_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id)
);
CREATE TABLE public.student_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE,
  desired_job_titles ARRAY NOT NULL DEFAULT '{}'::text[],
  opportunity_types ARRAY NOT NULL DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT student_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT student_preferences_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.institution_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  requested_by uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['liceu'::text, 'colegiu'::text, 'universitate'::text])),
  city text NOT NULL,
  official_email USER-DEFINED NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT institution_requests_pkey PRIMARY KEY (id),
  CONSTRAINT institution_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.profiles(id),
  CONSTRAINT institution_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.recommendation_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  recipient_name text NOT NULL CHECK (char_length(TRIM(BOTH FROM recipient_name)) >= 2 AND char_length(TRIM(BOTH FROM recipient_name)) <= 160),
  recipient_email USER-DEFINED NOT NULL CHECK (recipient_email ~* '^[^@[:space:]]+@[^@[:space:]]+\\.[^@[:space:]]+$'::citext),
  relationship text,
  message text CHECK (message IS NULL OR char_length(message) <= 1500),
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'requested'::text, 'received'::text, 'declined'::text])),
  recommendation_text text CHECK (recommendation_text IS NULL OR char_length(recommendation_text) <= 4000),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT recommendation_requests_pkey PRIMARY KEY (id),
  CONSTRAINT recommendation_requests_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);