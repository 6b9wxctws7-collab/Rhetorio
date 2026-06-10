-- Voice usage tracking (cost guard) and custom scenario cleanup.

create table if not exists public.voice_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_seconds int not null check (duration_seconds > 0),
  created_at timestamptz not null default now()
);

create index if not exists voice_usage_user_id_started_at_idx
  on public.voice_usage(user_id, started_at);

alter table public.voice_usage enable row level security;

create policy "Users read own voice usage"
  on public.voice_usage for select
  to authenticated
  using (user_id = auth.uid());

-- Inserts happen through the record-voice-usage Edge Function with the
-- service role, so no insert policy for regular users is needed.

-- Deletes the caller's custom scenarios that no session references, so
-- repeated custom trainings do not pile up rows forever. SECURITY DEFINER
-- lets the check see all sessions regardless of row-level security.
create or replace function public.cleanup_unused_custom_scenarios()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.scenarios s
  where s.user_id = auth.uid()
    and s.is_custom = true
    and not exists (
      select 1 from public.sessions x where x.scenario_id = s.id
    );
$$;

revoke all on function public.cleanup_unused_custom_scenarios() from public;
grant execute on function public.cleanup_unused_custom_scenarios() to authenticated;
