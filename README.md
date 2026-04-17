# LLW — Live, Learn, Win

A custom-built training log for golf, tennis, and the strength work that makes both better. Built with Next.js 15, Supabase, and Tailwind. Runs on the web, installs to your phone like a native app.

## What's in here

- **Auth** — email/password signup, login, protected routes
- **Sessions** — log strength, cardio, power, agility, golf practice, golf rounds, tennis practice, tennis matches, recovery, rest
- **Dashboard** — weekly summary + recent sessions
- **Stats** — last-28-day overview with breakdown by training type
- **Profile** — handicap, UTR, bodyweight unit
- **Database** — Postgres schema with row-level security, ready for golf round details, tennis match data, daily metrics (bodyweight, sleep, soreness), and a full exercise library

## Setup (about 10 minutes)

### 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Pick a name and a strong database password (save it)
3. Wait ~2 min for provisioning
4. In the project dashboard → **Settings → API**, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Run the schema

1. In Supabase → **SQL Editor** → New query
2. Paste the entire contents of `supabase/migrations/0001_init.sql`
3. Click **Run**. You should see "Success."

This creates all tables, sets up row-level security, adds a trigger that creates a profile row whenever someone signs up, and seeds 31 starter exercises.

### 3. Configure email auth (optional but recommended for dev)

In Supabase → **Authentication → Providers → Email**:
- For local dev you can disable "Confirm email" so you can sign up and test immediately. Re-enable before going to production.

### 4. Run locally

```bash
cp .env.example .env.local
# paste your Supabase URL and anon key into .env.local

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, log a session.

### 5. Deploy to Vercel

```bash
# push to GitHub first
git init
git add .
git commit -m "initial commit"
gh repo create llw-app --private --source=. --push
# or use the GitHub web UI

# then in vercel.com:
# - New Project → Import from GitHub → select llw-app
# - In Environment Variables, add the same NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# - Click Deploy
```

You'll get a live URL like `llw-app-abc.vercel.app`. Open it on your phone, "Add to Home Screen" — you've got an installable app.

## Project structure

```
src/
  app/
    (auth)/         signup, login, logout server actions
    (app)/          dashboard, log, sessions, stats, profile (auth-required)
    page.tsx        landing
  lib/
    supabase/       client + server Supabase instances
    database.types.ts
  middleware.ts     refreshes auth, protects routes
supabase/
  migrations/
    0001_init.sql   full schema, RLS, seed exercises
```

## What to build next (suggested order)

1. **Strength session detail** — add exercises to a strength session, log sets/reps/weight per exercise. The schema already supports this (`session_exercises`, `exercise_sets`).
2. **Golf round logging** — score, putts, fairways, GIR. Schema is in `golf_rounds`.
3. **Tennis match logging** — opponent, surface, score, result. Schema is in `tennis_sessions`.
4. **Daily check-in** — bodyweight, sleep, soreness, energy. Schema is in `daily_metrics`.
5. **Real charts** — strength PR progression, golf score trend, tennis win rate. Use `recharts` or `chart.js`.
6. **Whoop / Garmin integration** — pull HRV, sleep, recovery via their APIs.
7. **Multi-user** — when ready to share with other athletes, add a billing layer (Stripe), a landing page, and onboarding.

## Stack

- **Next.js 15** with App Router and Server Components
- **Supabase** — Postgres, auth, real-time, file storage (all free tier sufficient for personal use)
- **Tailwind CSS** for styling
- **TypeScript** throughout
- **lucide-react** for icons
- **date-fns** for dates

## Notes

- Row-level security is on for every table. You can never accidentally see another user's data.
- The `database.types.ts` file is hand-written for now. Once you set up the Supabase CLI, regenerate with `npx supabase gen types typescript --project-id YOUR_REF > src/lib/database.types.ts`.
- The data model already supports everything you need for the next 6 months of features. Don't migrate the schema lightly.
