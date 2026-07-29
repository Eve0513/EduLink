# EduLink

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-149eca)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3fcf8e)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6)

EduLink is a desktop-first academic and professional identity platform for students, institutions, and companies. It combines authenticated profiles, structured onboarding, public portfolios, and AI-assisted CV preparation.

## Tech Stack

- **Framework:** Next.js 16 App Router, React 19, TypeScript strict mode
- **Auth and Data:** Supabase Auth, PostgreSQL, Storage, Row Level Security
- **UI:** Tailwind CSS v4, shadcn-style components, native light/dark CSS variables
- **Forms:** React Hook Form, Zod validation, inline error states
- **AI Prep:** OpenAI `gpt-4o-mini` route scaffold for ATS CV generation
- **Integrations:** Google Calendar API validation script scaffold

## Features

- Secure login and registration with email/password, Google, and GitHub through Supabase Auth
- Desktop-focused 3-column authentication layout with premium Deep Ocean Teal styling
- Role selection for Student, Company, and Institution onboarding paths
- Student 4-step onboarding wizard for contact data, avatar upload, education, experience, skills, projects, and final review
- Creatable autocomplete fields backed by local `mockData.ts`
- Server Actions for profile, education, experience, skill, and project persistence
- Optimistic profile editing in the student dashboard
- Dynamic public portfolio route at `/portofoliu/[slug]`
- AI route scaffolds for CV and portfolio website generation
- API key validation script for Supabase, OpenAI, and Google Calendar readiness

## Screenshots

Place production screenshots in `public/screenshots` and update these links:

- `public/screenshots/auth-login.png`
- `public/screenshots/onboarding-student.png`
- `public/screenshots/student-profile.png`
- `public/screenshots/public-portfolio.png`

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Required values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code.

## Validation

```bash
npm run lint
npm run build
```

API key checks:

```bash
npx tsx scripts/test-api-keys.ts
```

## Supabase Schema

The PRD defines these core resources with RLS enabled:

- `profiles`, `educations`, `experiences`, `projects`, `skills`, `certificates`
- `jobs`, `posts`, `events`, `ai_generations`
- ENUMs including `user_role` and `ai_generation_type`

Use Supabase MCP or the Supabase SQL editor to apply and inspect schema changes. RLS policies must combine `TO authenticated` with ownership predicates for private user data.

## License

This repository is prepared for open-source distribution. Add the final license file before publishing.
