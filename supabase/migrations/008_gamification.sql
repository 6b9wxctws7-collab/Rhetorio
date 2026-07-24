-- Gamification: XP, Tagesziel, Streak-Freeze und Abzeichen.

alter table public.profiles
  add column if not exists xp int not null default 0,
  add column if not exists daily_goal_sessions int not null default 1,
  -- Ein Streak-Freeze überbrückt einen verpassten Tag. Er lädt sich alle
  -- 7 Tage nach dem letzten Verbrauch wieder auf (Logik im Client-Service).
  add column if not exists streak_freeze_used_at timestamptz;

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_key text not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_key)
);

alter table public.achievements enable row level security;

create policy "Users can read own achievements"
  on public.achievements for select
  using (auth.uid() = user_id);

create policy "Users can insert own achievements"
  on public.achievements for insert
  with check (auth.uid() = user_id);
