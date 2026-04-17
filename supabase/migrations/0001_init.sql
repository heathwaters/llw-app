-- ============================================================
-- ATHLETE APP — Core schema
-- Designed for: scratch golf + pro tennis + general fat-loss training
-- Built for: single user now, multi-tenant ready
-- ============================================================

-- ----- profiles (one per auth user) -----
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  bodyweight_unit text default 'lb' check (bodyweight_unit in ('lb','kg')),
  golf_handicap numeric(4,1),
  tennis_utr numeric(4,2),
  created_at timestamptz default now()
);

-- ----- exercise library (shared, can be extended per user) -----
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,  -- null = global
  name text not null,
  category text not null check (category in ('strength','power','cardio','mobility','agility','plyometric')),
  primary_muscle text,
  is_unilateral boolean default false,
  is_rotational boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- ----- sessions: every workout, round, match, or recovery day -----
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_date date not null default current_date,
  session_type text not null check (session_type in
    ('strength','cardio','power','agility','golf_practice','golf_round','tennis_practice','tennis_match','recovery','rest')),
  title text,
  duration_minutes int,
  rpe smallint check (rpe between 1 and 10),     -- rate of perceived exertion
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index sessions_user_date_idx on public.sessions(user_id, session_date desc);

-- ----- exercise log entries (within a strength/power session) -----
create table public.session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  sort_order int not null default 0,
  notes text
);

create table public.exercise_sets (
  id uuid primary key default gen_random_uuid(),
  session_exercise_id uuid not null references public.session_exercises(id) on delete cascade,
  set_number int not null,
  weight numeric(6,2),
  weight_unit text default 'lb' check (weight_unit in ('lb','kg')),
  reps int,
  duration_seconds int,                            -- for time-based work
  distance_meters numeric(8,2),                    -- for cardio
  rpe smallint check (rpe between 1 and 10),
  is_warmup boolean default false
);

create index exercise_sets_se_idx on public.exercise_sets(session_exercise_id);

-- ----- golf rounds (richer than a generic session) -----
create table public.golf_rounds (
  id uuid primary key default gen_random_uuid(),
  session_id uuid unique references public.sessions(id) on delete cascade,
  course_name text,
  tees text,
  course_rating numeric(4,1),
  slope_rating int,
  holes_played int default 18,
  total_score int,
  total_putts int,
  fairways_hit int,
  fairways_possible int,
  greens_in_regulation int,
  weather text,
  conditions_notes text
);

-- ----- tennis matches/sessions (richer than a generic session) -----
create table public.tennis_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid unique references public.sessions(id) on delete cascade,
  is_match boolean default false,
  opponent_name text,
  opponent_utr numeric(4,2),
  surface text check (surface in ('hard','clay','grass','indoor')),
  score text,                          -- e.g., "6-4 3-6 7-5"
  result text check (result in ('win','loss','draw')),
  serve_speed_max_mph int,
  notes text
);

-- ----- daily metrics: bodyweight, sleep, soreness, HRV -----
create table public.daily_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  metric_date date not null default current_date,
  bodyweight numeric(5,2),
  sleep_hours numeric(3,1),
  hrv_ms int,
  resting_hr int,
  soreness smallint check (soreness between 1 and 10),
  energy smallint check (energy between 1 and 10),
  stress smallint check (stress between 1 and 10),
  notes text,
  created_at timestamptz default now(),
  unique(user_id, metric_date)
);

create index daily_metrics_user_date_idx on public.daily_metrics(user_id, metric_date desc);

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security — every user only sees their own data
-- ============================================================
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.session_exercises enable row level security;
alter table public.exercise_sets enable row level security;
alter table public.golf_rounds enable row level security;
alter table public.tennis_sessions enable row level security;
alter table public.daily_metrics enable row level security;
alter table public.exercises enable row level security;

-- profiles: read own, update own
create policy "own profile read" on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- sessions: full CRUD on own
create policy "own sessions" on public.sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- session_exercises: through session ownership
create policy "own session_exercises" on public.session_exercises for all
  using (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()));

-- exercise_sets: through session_exercise -> session ownership
create policy "own exercise_sets" on public.exercise_sets for all
  using (exists (
    select 1 from public.session_exercises se
    join public.sessions s on s.id = se.session_id
    where se.id = session_exercise_id and s.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.session_exercises se
    join public.sessions s on s.id = se.session_id
    where se.id = session_exercise_id and s.user_id = auth.uid()
  ));

-- golf_rounds: through session ownership
create policy "own golf_rounds" on public.golf_rounds for all
  using (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()));

-- tennis_sessions: through session ownership
create policy "own tennis_sessions" on public.tennis_sessions for all
  using (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()));

-- daily_metrics: full CRUD on own
create policy "own daily_metrics" on public.daily_metrics for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- exercises: read all global + own; write own only
create policy "read exercises" on public.exercises for select using (owner_id is null or owner_id = auth.uid());
create policy "write own exercises" on public.exercises for insert with check (owner_id = auth.uid());
create policy "update own exercises" on public.exercises for update using (owner_id = auth.uid());
create policy "delete own exercises" on public.exercises for delete using (owner_id = auth.uid());

-- ============================================================
-- Seed a starter exercise library (global, owner_id = null)
-- ============================================================
insert into public.exercises (name, category, primary_muscle, is_unilateral, is_rotational) values
  -- Strength — bilateral
  ('Back Squat', 'strength', 'quads', false, false),
  ('Trap Bar Deadlift', 'strength', 'posterior chain', false, false),
  ('Romanian Deadlift', 'strength', 'hamstrings', false, false),
  ('Dumbbell Bench Press', 'strength', 'chest', false, false),
  ('Pull-up', 'strength', 'lats', false, false),
  ('Lat Pulldown', 'strength', 'lats', false, false),
  ('Barbell Row', 'strength', 'upper back', false, false),
  -- Strength — unilateral
  ('Bulgarian Split Squat', 'strength', 'quads', true, false),
  ('Single-Leg Hip Thrust', 'strength', 'glutes', true, false),
  ('Single-Arm DB Row', 'strength', 'lats', true, false),
  ('Half-Kneeling Landmine Press', 'strength', 'shoulders', true, false),
  ('Copenhagen Plank', 'strength', 'adductors', true, false),
  -- Power — rotational
  ('Med Ball Rotational Throw', 'power', 'core', true, true),
  ('Cable Lift (low-to-high)', 'power', 'core', true, true),
  ('Med Ball Scoop Toss', 'power', 'core', true, true),
  ('Med Ball Chest Pass', 'power', 'chest', false, false),
  ('Med Ball Overhead Slam', 'power', 'core', false, false),
  -- Power — lower
  ('Broad Jump', 'plyometric', 'legs', false, false),
  ('Lateral Bound', 'plyometric', 'legs', true, false),
  ('Kettlebell Swing', 'power', 'posterior chain', false, false),
  ('Push Press', 'power', 'shoulders', false, false),
  -- Anti-rotation core
  ('Pallof Press', 'strength', 'core', true, false),
  ('Suitcase Carry', 'strength', 'core', true, false),
  -- Agility
  ('5-10-5 Shuttle', 'agility', 'legs', false, false),
  ('Deceleration Drill', 'agility', 'legs', false, false),
  -- Cardio
  ('Incline Treadmill Walk', 'cardio', 'general', false, false),
  ('Assault Bike', 'cardio', 'general', false, false),
  ('Rower', 'cardio', 'general', false, false),
  -- Mobility
  ('Open Books (T-spine)', 'mobility', 'thoracic', true, true),
  ('Hip CARs', 'mobility', 'hips', true, false),
  ('90/90 Hip Rotation', 'mobility', 'hips', true, false);
