# SKILLX

SKILLX is a Next.js + Supabase learning platform with separate Student and Teacher flows.

## Current MVP
- Student signup/login
- Teacher signup/login
- Role-based dashboards
- Teacher course management
- Teacher lesson management
- YouTube/video lesson playback
- Student course catalogue
- Student lesson progress

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and add your Supabase public project values:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

3. Start development:

```bash
npm run dev
```

4. Production check:

```bash
npm run build
npm run lint
```

## Canonical routes
- `/` — Homepage
- `/login` — Login
- `/signup/student` — Student signup
- `/signup/teacher` — Teacher signup
- `/dashboard` — Student dashboard
- `/dashboard/courses` — Student course catalogue
- `/dashboard/teacher` — Teacher dashboard
- `/dashboard/teacher/courses` — Teacher course manager
- `/dashboard/teacher/courses/new` — New course

## Security
Production security depends on correct Supabase Row Level Security policies. See `SKILLX_AUDIT.md` before launch.
