-- ============================================================
-- MIGRATION 0002 — Food log, nutrition targets, water tracking
-- ============================================================

-- Add nutrition target columns to profiles
alter table public.profiles
  add column if not exists cal_target int default 2400,
  add column if not exists protein_target int default 180,
  add column if not exists carbs_target int default 240,
  add column if not exists fat_target int default 80,
  add column if not exists bodyweight_goal numeric(5,2),
  add column if not exists tennis_utr numeric(4,2);

-- Add water tracking to daily_metrics
alter table public.daily_metrics
  add column if not exists water_l numeric(3,1),
  add column if not exists mobility text;

-- ----- food log entries -----
create table if not exists public.food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null default current_date,
  meal text not null check (meal in ('breakfast','lunch','dinner','snack')),
  name text not null,
  serving_size text,
  servings numeric(6,2) not null default 1,
  calories numeric(7,1) not null,
  protein numeric(6,1) default 0,
  carbs numeric(6,1) default 0,
  fat numeric(6,1) default 0,
  fiber numeric(5,1) default 0,
  is_custom boolean default false,
  created_at timestamptz default now()
);

create index if not exists food_entries_user_date_idx
  on public.food_entries(user_id, log_date desc);

-- ----- custom food library (user's own foods, for quick re-log) -----
create table if not exists public.custom_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  serving_size text,
  calories numeric(7,1) not null,
  protein numeric(6,1) default 0,
  carbs numeric(6,1) default 0,
  fat numeric(6,1) default 0,
  fiber numeric(5,1) default 0,
  times_used int default 1,
  last_used timestamptz default now(),
  created_at timestamptz default now(),
  unique(user_id, name)
);

create index if not exists custom_foods_user_idx
  on public.custom_foods(user_id, last_used desc);

-- ============================================================
-- Row Level Security on new tables
-- ============================================================
alter table public.food_entries enable row level security;
alter table public.custom_foods enable row level security;

create policy "own food_entries" on public.food_entries for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own custom_foods" on public.custom_foods for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Update the handle_new_user trigger to include nutrition defaults
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, display_name,
    cal_target, protein_target, carbs_target, fat_target
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)),
    2400, 180, 240, 80
  );
  return new;
end;
$$ language plpgsql security definer;
