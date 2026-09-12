-- ============================================================================
-- R3IGN — PLAYER PROFILE ONBOARDING SCHEMA ADDITIONS
-- Run this in the Supabase SQL Editor after the base schema.sql
-- Safe to re-run (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
-- ============================================================================

-- ---------- extend profiles for onboarding ----------
alter table public.profiles
  add column if not exists country text,
  add column if not exists bio text,
  add column if not exists player_id text unique,
  add column if not exists onboarding_step int default 1,
  add column if not exists onboarding_completed boolean default false,
  add column if not exists selected_games text[] default '{}',
  add column if not exists r3ign_hq_joined boolean default false;

-- Player ID generator: R3N-XXXXXX (6 random digits)
create or replace function public.generate_player_id()
returns text as $$
declare
  candidate text;
  taken boolean;
begin
  perform pg_advisory_xact_lock(hashtext('r3ign-player-id'));
  loop
    -- R3N- + 6 random digits (000000–999999)
    candidate := 'R3N-' || lpad(floor(random() * 1000000)::int::text, 6, '0');
    select exists(select 1 from public.profiles where player_id = candidate) into taken;
    exit when not taken;
  end loop;
  return candidate;
end;
$$ language plpgsql set search_path = public;

-- Ensure every profile has a Player ID in the new R3N- format
-- (fills nulls and converts any old R3HQ- / other formats)
do $$
declare
  r record;
begin
  for r in
    select id from public.profiles
    where player_id is null
       or player_id not like 'R3N-%'
  loop
    update public.profiles
    set player_id = public.generate_player_id()
    where id = r.id;
  end loop;
end $$;

-- Keep handle_new_user in sync so brand-new signups get R3N- IDs
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email, league_id, player_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    public.generate_league_id(),
    public.generate_player_id()
  )
  on conflict (id) do update set
    player_id = coalesce(public.profiles.player_id, public.generate_player_id());
  return new;
exception
  when others then
    begin
      insert into public.profiles (id, display_name, email)
      values (
        new.id,
        coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', new.email),
        new.email
      )
      on conflict (id) do nothing;
    exception
      when others then
        null;
    end;
    return new;
end;
$$;

-- ---------- game_profiles (richer than the existing game_accounts table) ----------
-- One row per user per game. Stores all Step 3 fields.
create table if not exists public.game_profiles (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  game text not null check (game in ('codm', 'freefire', 'bloodstrike')),
  ign text,
  player_uid text,
  country text,
  role text,
  team_clan text,
  experience text,          -- codm only: Beginner / Intermediate / Advanced
  extra jsonb default '{}', -- future-proof (e.g. main hero later)
  updated_at timestamptz default now(),
  unique (profile_id, game)
);

alter table public.game_profiles enable row level security;

drop policy if exists "Game profiles are viewable by everyone" on public.game_profiles;
create policy "Game profiles are viewable by everyone"
  on public.game_profiles for select using (true);

drop policy if exists "Users can insert their own game profiles" on public.game_profiles;
create policy "Users can insert their own game profiles"
  on public.game_profiles for insert with check (auth.uid() = profile_id);

drop policy if exists "Users can update their own game profiles" on public.game_profiles;
create policy "Users can update their own game profiles"
  on public.game_profiles for update using (auth.uid() = profile_id);

drop policy if exists "Users can delete their own game profiles" on public.game_profiles;
create policy "Users can delete their own game profiles"
  on public.game_profiles for delete using (auth.uid() = profile_id);

-- ---------- connections (config-driven social links) ----------
create table if not exists public.connections (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  provider text not null,   -- 'discord' | 'tiktok' | 'google' | 'instagram' | 'youtube' | 'twitch'
  provider_user_id text,
  username text,
  connected_at timestamptz default now(),
  unique (profile_id, provider)
);

alter table public.connections enable row level security;

drop policy if exists "Connections are viewable by owner" on public.connections;
create policy "Connections are viewable by owner"
  on public.connections for select using (auth.uid() = profile_id);

drop policy if exists "Users can insert their own connections" on public.connections;
create policy "Users can insert their own connections"
  on public.connections for insert with check (auth.uid() = profile_id);

drop policy if exists "Users can update their own connections" on public.connections;
create policy "Users can update their own connections"
  on public.connections for update using (auth.uid() = profile_id);

drop policy if exists "Users can delete their own connections" on public.connections;
create policy "Users can delete their own connections"
  on public.connections for delete using (auth.uid() = profile_id);

-- Public read for Discord/TikTok usernames if you want them visible on public profiles later:
-- create policy "Public social usernames" on public.connections for select using (true);

comment on table public.game_profiles is 'Per-game competitive profiles collected during onboarding Step 3';
comment on table public.connections is 'Linked social accounts (Discord, TikTok, etc.) — config-driven for future providers';
