# LandIt! — Job Application Tracker

**LandIt!** is a job application tracker that helps you manage applications on a Kanban board, track your pipeline on a dashboard, build resumes and cover letters, and prepare for interviews with categorized questions and notes.

## Features

- **Dashboard** — Stats, weekly application goal, job search health, pipeline chart, upcoming interviews, quick links to job boards.
- **Job applications** — Kanban board (Wishlist, Applied, Interview, Offer, Rejected, Ghosted) with drag-and-drop, interview details, and optional resume/cover letter file links.
- **Job requirements** — Checklist, resume builder (with PDF export and file library), cover letter builder and files.
- **Interview questions** — Categories and common questions with per-question notes and tips.
- **Settings** — Profile photo, display name, password change, weekly goal.

## Tech stack

Next.js 16 (App Router), React 19, Tailwind CSS, Supabase (Auth, Postgres, Storage).

## Getting started

1. **Install and env**

   ```bash
   npm install
   cp env.example .env.local
   ```

   Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` (from [Supabase Dashboard](https://supabase.com/dashboard) → Project → Settings → API).

2. **Supabase**

   - Enable Email auth (Authentication → Providers).
   - Run migrations in `supabase/migrations/` in order (01–05). Use `supabase db push` or run each SQL file. Existing databases that already ran the previous migration set need no re-run.

3. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Documentation

- [Project overview](docs/project-overview.md)
- [Features](docs/features.md)
- [User stories](docs/user-stories.md)
- [System architecture](docs/system-architecture.md)
- [Database schema](docs/database-schema.md)
- [How to use](docs/how-to-use.md) — Step-by-step usage guide
- [Future improvements](docs/future-improvements.md)

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Start production |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests (watch) |
| `npm run test:run` | Run tests once |

---

© LandIt! — Built for job seekers.
