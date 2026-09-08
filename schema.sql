-- ============================================================================
-- R3IGN — DATABASE SCHEMA FOR SUPABASE
--
-- How to use:
-- 1. Create a project at https://supabase.com
-- 2. Open the SQL Editor (left sidebar) → New Query
-- 3. Paste this whole file in and click "Run"
-- 4. Copy your Project URL + anon key into js/supabase-config.js
--
-- This creates: user profiles (auto-created on sign up), organizations,
-- rankings (what rankings.html reads live), matches, and player-market
-- listings — plus Row Level Security so people can only edit their own data.
-- ============================================================================

-- ---------- profiles (extends Supabase's built-in auth.users) ----------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  created_at timestamptz default now()
);

-- added later: league ID (e.g. R3E482910) and a copy of the user's email,
-- so admins can look someone up without needing service_role access
alter table public.profiles add column if not exists league_id text unique;
alter table public.profiles add column if not exists email text;

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- generates a unique league ID like R3E482910 (R3E + 6 random digits)
create or replace function public.generate_league_id()
returns text as $$
declare
  candidate text;
  taken boolean;
begin
  -- Serialize generation so two simultaneous signups cannot receive the
  -- same candidate between the existence check and the profile insert.
  perform pg_advisory_xact_lock(hashtext('r3ign-league-id'));
  loop
    candidate := 'R3E' || lpad(floor(random() * 1000000)::text, 6, '0');
    select exists(select 1 from public.profiles where league_id = candidate) into taken;
    exit when not taken;
  end loop;
  return candidate;
end;
$$ language plpgsql set search_path = public;

-- auto-create a profile row whenever someone signs up (email, Google, or Discord)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, email, league_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    public.generate_league_id()
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- backfill or migrate league IDs for accounts created before this ran
do $$
declare
  r record;
begin
  for r in select id from public.profiles
    where league_id is null or league_id !~ '^R3E[0-9]{6}$' loop
    update public.profiles set league_id = public.generate_league_id() where id = r.id;
  end loop;
end $$;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- ---------- organizations ----------
create table if not exists public.organizations (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  tag text not null,
  league text not null,            -- 'rcml' | 'rfcl' | 'rbsl'
  division int,                    -- 1-6, nullable until placed
  region text,
  created_at timestamptz default now()
);

alter table public.organizations enable row level security;

drop policy if exists "Organizations are viewable by everyone" on public.organizations;
create policy "Organizations are viewable by everyone"
  on public.organizations for select using (true);

drop policy if exists "Owners can insert their own organization" on public.organizations;
create policy "Owners can insert their own organization"
  on public.organizations for insert with check (auth.uid() = owner_id);

drop policy if exists "Owners can update their own organization" on public.organizations;
create policy "Owners can update their own organization"
  on public.organizations for update using (auth.uid() = owner_id);

-- ---------- rankings (this is what rankings.html reads live) ----------
create table if not exists public.rankings (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade,
  team_name text not null,         -- denormalized for easy display even if org is deleted
  tag text,
  league text not null,            -- 'rcml' | 'rfcl' | 'rbsl'
  season text not null,            -- e.g. 'Season 4'
  division int,
  wins int default 0,
  losses int default 0,
  points int default 0,
  updated_at timestamptz default now()
);

alter table public.rankings enable row level security;

drop policy if exists "Rankings are viewable by everyone" on public.rankings;
create policy "Rankings are viewable by everyone"
  on public.rankings for select using (true);

-- Only edit rankings via the Supabase dashboard or a trusted admin role —
-- intentionally no public insert/update policy, so scores can't be spoofed
-- by an end user's browser. Add match results as an authenticated admin.

-- ---------- player market ----------
create table if not exists public.player_listings (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade,
  ign text not null,
  role text not null,
  region text,
  notes text,
  league text,
  profile_screenshot_path text,
  created_at timestamptz default now()
);

alter table public.player_listings enable row level security;

drop policy if exists "Listings are viewable by everyone" on public.player_listings;
create policy "Listings are viewable by everyone"
  on public.player_listings for select using (true);

drop policy if exists "Users can create their own listing" on public.player_listings;
create policy "Users can create their own listing"
  on public.player_listings for insert with check (auth.uid() = profile_id);

drop policy if exists "Users can update their own listing" on public.player_listings;
create policy "Users can update their own listing"
  on public.player_listings for update using (auth.uid() = profile_id);

drop policy if exists "Users can delete their own listing" on public.player_listings;
create policy "Users can delete their own listing"
  on public.player_listings for delete using (auth.uid() = profile_id);

-- Player market screenshots are meant to be seen by recruiting captains, so
-- (unlike the private account-verification bucket) this one is public-read.
insert into storage.buckets (id, name, public)
values ('player-market-uploads', 'player-market-uploads', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can view player market uploads" on storage.objects;
create policy "Anyone can view player market uploads"
  on storage.objects for select
  using (bucket_id = 'player-market-uploads');

drop policy if exists "Users can upload their own player market screenshot" on storage.objects;
create policy "Users can upload their own player market screenshot"
  on storage.objects for insert
  with check (bucket_id = 'player-market-uploads' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update their own player market screenshot" on storage.objects;
create policy "Users can update their own player market screenshot"
  on storage.objects for update
  using (bucket_id = 'player-market-uploads' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- linked game accounts (in-game IDs per title) ----------
-- Games like COD:Mobile, Free Fire, and Blood Strike don't offer public
-- sign-in APIs, so instead players link their in-game name / UID to their
-- R3IGN account after signing in with email, Google, Discord, or Twitch —
-- then a league admin reviews and verifies the submission.
create table if not exists public.game_accounts (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  game text not null,              -- 'rcml' | 'rfcl' | 'rbsl'
  ign text not null,               -- in-game name
  game_uid text,                   -- in-game player ID / UID, if the game exposes one
  verification_status text default 'unverified' not null
    check (verification_status in ('unverified','pending','verified','rejected')),
  verification_code text,          -- auto-generated per submission, for an admin to cross-check
  updated_at timestamptz default now(),
  unique (profile_id, game)
);

alter table public.game_accounts enable row level security;

drop policy if exists "Game accounts are viewable by everyone" on public.game_accounts;
create policy "Game accounts are viewable by everyone"
  on public.game_accounts for select using (true);

drop policy if exists "Users can insert their own game accounts" on public.game_accounts;
create policy "Users can insert their own game accounts"
  on public.game_accounts for insert with check (auth.uid() = profile_id);

drop policy if exists "Users can update their own game accounts" on public.game_accounts;
create policy "Users can update their own game accounts"
  on public.game_accounts for update using (auth.uid() = profile_id);

drop policy if exists "Users can delete their own game accounts" on public.game_accounts;
create policy "Users can delete their own game accounts"
  on public.game_accounts for delete using (auth.uid() = profile_id);

-- auto-generate a verification code, and reset status to "pending" if a
-- verified player edits their IGN/UID (so a re-review happens)
create or replace function public.set_verification_code()
returns trigger as $$
begin
  if new.verification_code is null then
    new.verification_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
  end if;
  if TG_OP = 'UPDATE' and (old.ign is distinct from new.ign or old.game_uid is distinct from new.game_uid) then
    new.verification_status := 'pending';
  end if;
  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists on_game_account_write on public.game_accounts;
create trigger on_game_account_write
  before insert or update on public.game_accounts
  for each row execute procedure public.set_verification_code();

-- ---------- admins (league staff who can approve verifications) ----------
-- Add the FIRST admin yourself from the Supabase Table Editor (insert a row
-- with their profile_id) — after that, existing admins can promote new ones
-- from the Admin page on the site itself.
create table if not exists public.admins (
  profile_id uuid references public.profiles(id) on delete cascade primary key,
  created_at timestamptz default now()
);

alter table public.admins enable row level security;

drop policy if exists "Admin list viewable by everyone" on public.admins;
create policy "Admin list viewable by everyone"
  on public.admins for select using (true);

drop policy if exists "Admins can verify game accounts" on public.game_accounts;
create policy "Admins can verify game accounts"
  on public.game_accounts for update
  using (exists (select 1 from public.admins where profile_id = auth.uid()));

drop policy if exists "Admins can add admins" on public.admins;
create policy "Admins can add admins"
  on public.admins for insert
  with check (exists (select 1 from public.admins a where a.profile_id = auth.uid()));

drop policy if exists "Admins can remove admins" on public.admins;
create policy "Admins can remove admins"
  on public.admins for delete
  using (exists (select 1 from public.admins a where a.profile_id = auth.uid()));

-- ---------- events (posted by admins, visible to everyone) ----------
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  league text,                 -- 'rcml' | 'rfcl' | 'rbsl' | null for general R3IGN events
  location text,                -- e.g. 'Online' or a region
  start_time timestamptz not null,
  end_time timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.events enable row level security;

drop policy if exists "Events are viewable by everyone" on public.events;
create policy "Events are viewable by everyone"
  on public.events for select using (true);

drop policy if exists "Admins can create events" on public.events;
create policy "Admins can create events"
  on public.events for insert
  with check (exists (select 1 from public.admins where profile_id = auth.uid()));

drop policy if exists "Admins can update events" on public.events;
create policy "Admins can update events"
  on public.events for update
  using (exists (select 1 from public.admins where profile_id = auth.uid()));

drop policy if exists "Admins can delete events" on public.events;
create policy "Admins can delete events"
  on public.events for delete
  using (exists (select 1 from public.admins where profile_id = auth.uid()));

-- ---------- team registrations (submitted via register.html) ----------
create table if not exists public.registrations (
  id uuid default gen_random_uuid() primary key,
  submitted_by uuid references public.profiles(id) on delete set null,
  team_name text not null,
  team_tag text not null,
  league text not null,
  captain_name text not null,
  captain_email text not null,
  discord text,
  region text,
  roster text not null,
  notes text,
  status text default 'pending' not null check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

alter table public.registrations enable row level security;

drop policy if exists "Users can view their own registrations" on public.registrations;
create policy "Users can view their own registrations"
  on public.registrations for select using (auth.uid() = submitted_by);

drop policy if exists "Admins can view all registrations" on public.registrations;
create policy "Admins can view all registrations"
  on public.registrations for select
  using (exists (select 1 from public.admins where profile_id = auth.uid()));

drop policy if exists "Signed-in users can submit a registration" on public.registrations;
create policy "Signed-in users can submit a registration"
  on public.registrations for insert with check (auth.uid() = submitted_by);

drop policy if exists "Admins can update registrations" on public.registrations;
create policy "Admins can update registrations"
  on public.registrations for update
  using (exists (select 1 from public.admins where profile_id = auth.uid()));

-- ---------- game profile screenshots (Supabase Storage) ----------
-- Players upload a screenshot of their in-game profile for admin review.
-- Run this once — creates a private bucket + policies so only the owner
-- can upload/replace their own file, and only admins can read the others.
insert into storage.buckets (id, name, public)
values ('game-profiles', 'game-profiles', false)
on conflict (id) do nothing;

drop policy if exists "Users can upload their own game profile screenshot" on storage.objects;
create policy "Users can upload their own game profile screenshot"
  on storage.objects for insert
  with check (bucket_id = 'game-profiles' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update their own game profile screenshot" on storage.objects;
create policy "Users can update their own game profile screenshot"
  on storage.objects for update
  using (bucket_id = 'game-profiles' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Owners and admins can view game profile screenshots" on storage.objects;
create policy "Owners and admins can view game profile screenshots"
  on storage.objects for select
  using (
    bucket_id = 'game-profiles' and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (select 1 from public.admins where profile_id = auth.uid())
    )
  );

-- column on game_accounts pointing at the uploaded screenshot's storage path
alter table public.game_accounts add column if not exists profile_screenshot_path text;

-- ============================================================================
-- SEED DATA — replace with your actual last-season results.
-- Send me the real standings (team, W/L, points, division) and I'll turn
-- them into INSERT statements for you, or edit these rows directly.
-- ============================================================================
insert into public.rankings (team_name, tag, league, season, division, wins, losses, points)
values
  ('Aether Esports','AE','rcml','Season 4',1,10,1,3250),
  ('Siroxx','SX','rcml','Season 4',1,10,1,2781),
  ('Infinite','IN','rcml','Season 4',1,9,2,2591),
  ('Eleventh Order','EO','rcml','Season 4',1,8,3,1907),
  ('Seven Esports','SE','rcml','Season 4',1,7,4,1868)
on conflict do nothing;

-- ============================================================================
-- ADMIN WRITE ACCESS TO RANKINGS
-- The table above was originally select-only (dashboard-edit only). This adds
-- insert/update/delete for anyone listed in public.admins, so rankings can be
-- managed from the Admin page (admin.html) without opening Supabase directly.
-- ============================================================================
drop policy if exists "Admins can insert rankings" on public.rankings;
create policy "Admins can insert rankings"
  on public.rankings for insert
  with check (exists (select 1 from public.admins where profile_id = auth.uid()));

drop policy if exists "Admins can update rankings" on public.rankings;
create policy "Admins can update rankings"
  on public.rankings for update
  using (exists (select 1 from public.admins where profile_id = auth.uid()));

drop policy if exists "Admins can delete rankings" on public.rankings;
create policy "Admins can delete rankings"
  on public.rankings for delete
  using (exists (select 1 from public.admins where profile_id = auth.uid()));

-- ============================================================================
-- ORGANIZATION PROFILE FIELDS
-- Extra columns for the team/org detail page (org.html) — logo, bio, roster,
-- and socials. All optional (nullable) so existing rows keep working.
-- ============================================================================
alter table public.organizations add column if not exists logo_url text;
alter table public.organizations add column if not exists description text;
alter table public.organizations add column if not exists captain_name text;
alter table public.organizations add column if not exists roster text;          -- comma-separated player names, simplest v1
alter table public.organizations add column if not exists discord_url text;
alter table public.organizations add column if not exists twitch_url text;
alter table public.organizations add column if not exists twitter_url text;

-- ============================================================================
-- TOURNAMENT BRACKETS
-- Powers brackets.html. A tournament has many matches, each tagged with a
-- round number (1 = first round) and a slot/order within that round so the
-- bracket can be laid out visually without any extra logic.
-- ============================================================================
create table if not exists public.tournaments (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  league text,                     -- 'rcml' | 'rfcl' | 'rbsl' | null for cross-league
  status text default 'upcoming' not null check (status in ('upcoming','live','completed')),
  created_at timestamptz default now()
);

alter table public.tournaments enable row level security;

drop policy if exists "Tournaments are viewable by everyone" on public.tournaments;
create policy "Tournaments are viewable by everyone"
  on public.tournaments for select using (true);

drop policy if exists "Admins can manage tournaments" on public.tournaments;
create policy "Admins can manage tournaments"
  on public.tournaments for all
  using (exists (select 1 from public.admins where profile_id = auth.uid()))
  with check (exists (select 1 from public.admins where profile_id = auth.uid()));

create table if not exists public.bracket_matches (
  id uuid default gen_random_uuid() primary key,
  tournament_id uuid references public.tournaments(id) on delete cascade not null,
  round_number int not null,       -- 1, 2, 3... (higher = later round)
  round_name text,                 -- e.g. 'Quarterfinal', 'Semifinal', 'Final'
  match_order int not null,        -- position within the round, top to bottom, 0-based
  team_a text,
  team_b text,
  score_a int,
  score_b int,
  winner text,                     -- 'a' | 'b' | null (undecided)
  scheduled_at timestamptz,
  updated_at timestamptz default now()
);

alter table public.bracket_matches enable row level security;

drop policy if exists "Bracket matches are viewable by everyone" on public.bracket_matches;
create policy "Bracket matches are viewable by everyone"
  on public.bracket_matches for select using (true);

drop policy if exists "Admins can manage bracket matches" on public.bracket_matches;
create policy "Admins can manage bracket matches"
  on public.bracket_matches for all
  using (exists (select 1 from public.admins where profile_id = auth.uid()))
  with check (exists (select 1 from public.admins where profile_id = auth.uid()));

-- Seed: one sample 8-team single-elimination tournament so brackets.html has
-- something to show immediately. Safe to delete once you add a real one.
insert into public.tournaments (id, name, league, status)
values ('00000000-0000-0000-0000-000000000001', 'RCML Season 4 Playoffs', 'rcml', 'live')
on conflict (id) do nothing;

insert into public.bracket_matches (tournament_id, round_number, round_name, match_order, team_a, team_b, score_a, score_b, winner)
values
  ('00000000-0000-0000-0000-000000000001',1,'Quarterfinal',0,'Aether Esports','Last Watch',3,0,'a'),
  ('00000000-0000-0000-0000-000000000001',1,'Quarterfinal',1,'Siroxx','Vortex Squad',3,1,'a'),
  ('00000000-0000-0000-0000-000000000001',1,'Quarterfinal',2,'Infinite','Ironclad',3,2,'a'),
  ('00000000-0000-0000-0000-000000000001',1,'Quarterfinal',3,'Eleventh Order','Nightshade',2,3,'b'),
  ('00000000-0000-0000-0000-000000000001',2,'Semifinal',0,'Aether Esports','Siroxx',null,null,null),
  ('00000000-0000-0000-0000-000000000001',2,'Semifinal',1,'Infinite','Nightshade',null,null,null),
  ('00000000-0000-0000-0000-000000000001',3,'Final',0,null,null,null,null,null)
on conflict do nothing;

-- ============================================================================
-- MESSAGES
-- Powers messages.html — direct messages between recruiters/managers and
-- players listed on the Player Market. A message can optionally reference
-- the listing that started the conversation (listing_id), purely for
-- display context; the conversation itself is just sender/recipient.
-- ============================================================================
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  listing_id uuid references public.player_listings(id) on delete set null,
  body text not null check (char_length(body) > 0 and char_length(body) <= 2000),
  created_at timestamptz default now() not null,
  read_at timestamptz,
  constraint messages_no_self_send check (sender_id <> recipient_id)
);

create index if not exists messages_sender_idx on public.messages(sender_id, created_at desc);
create index if not exists messages_recipient_idx on public.messages(recipient_id, created_at desc);

alter table public.messages enable row level security;

drop policy if exists "Users can view their own messages" on public.messages;
create policy "Users can view their own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "Users can send messages" on public.messages;
create policy "Users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

drop policy if exists "Recipients can mark messages read" on public.messages;
create policy "Recipients can mark messages read"
  on public.messages for update
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

-- ============================================================================
-- MATCH HIGHLIGHTS
-- Powers match-highlights.html. Admins upload a screen recording (stored in
-- the 'match-highlights' storage bucket below) or paste a YouTube/Twitch
-- clip URL; either way a row here is what the highlights page renders.
-- ============================================================================
create table if not exists public.match_highlights (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  league text,                       -- 'rcml' | 'rfcl' | 'rbsl' | null
  match_label text,                  -- e.g. "RCML S4 · Division 1 · Week 6"
  video_url text,                    -- external link (YouTube/Twitch clip)
  storage_path text,                 -- path in 'match-highlights' bucket, if uploaded directly
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.match_highlights enable row level security;

drop policy if exists "Highlights are viewable by everyone" on public.match_highlights;
create policy "Highlights are viewable by everyone"
  on public.match_highlights for select using (true);

drop policy if exists "Admins can manage highlights" on public.match_highlights;
create policy "Admins can manage highlights"
  on public.match_highlights for all
  using (exists (select 1 from public.admins where profile_id = auth.uid()))
  with check (exists (select 1 from public.admins where profile_id = auth.uid()));

-- Storage bucket for uploaded match recordings. Public read (so the
-- highlights page can play them directly); only admins may upload/delete.
insert into storage.buckets (id, name, public)
values ('match-highlights', 'match-highlights', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can view match highlight files" on storage.objects;
create policy "Anyone can view match highlight files"
  on storage.objects for select
  using (bucket_id = 'match-highlights');

drop policy if exists "Admins can upload match highlight files" on storage.objects;
create policy "Admins can upload match highlight files"
  on storage.objects for insert
  with check (
    bucket_id = 'match-highlights' and
    exists (select 1 from public.admins where profile_id = auth.uid())
  );

drop policy if exists "Admins can delete match highlight files" on storage.objects;
create policy "Admins can delete match highlight files"
  on storage.objects for delete
  using (
    bucket_id = 'match-highlights' and
    exists (select 1 from public.admins where profile_id = auth.uid())
  );

-- ============================================================================
-- NEWS POSTS
-- Powers news.html. Strictly admin-authored: any signed-in visitor can read
-- published posts, but only admins (checked against the `admins` table, the
-- same pattern used for rankings/brackets/highlights elsewhere) can create,
-- edit, or delete one.
-- ============================================================================
create table if not exists public.news_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text not null,
  category text default 'Announcement' not null check (category in ('League Update','Match Recap','Announcement','Community')),
  author_name text,
  published boolean default true not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null
);

create index if not exists news_posts_created_idx on public.news_posts(created_at desc);

alter table public.news_posts enable row level security;

drop policy if exists "Published news is viewable by everyone" on public.news_posts;
create policy "Published news is viewable by everyone"
  on public.news_posts for select
  using (published = true or exists (select 1 from public.admins where profile_id = auth.uid()));

drop policy if exists "Admins can manage news" on public.news_posts;
create policy "Admins can manage news"
  on public.news_posts for all
  using (exists (select 1 from public.admins where profile_id = auth.uid()))
  with check (exists (select 1 from public.admins where profile_id = auth.uid()));

-- ============================================================================
-- AWARD WINNERS (Hall of Champions)
-- Powers the "Recent MVPs" grid on awards.html. Same admin-only-write shape.
-- ============================================================================
create table if not exists public.award_winners (
  id uuid default gen_random_uuid() primary key,
  award_label text default 'MVP' not null,
  player_name text not null,
  context text,
  season text,
  created_at timestamptz default now() not null
);

create index if not exists award_winners_created_idx on public.award_winners(created_at desc);

alter table public.award_winners enable row level security;

drop policy if exists "Award winners are viewable by everyone" on public.award_winners;
create policy "Award winners are viewable by everyone"
  on public.award_winners for select using (true);

drop policy if exists "Admins can manage award winners" on public.award_winners;
create policy "Admins can manage award winners"
  on public.award_winners for all
  using (exists (select 1 from public.admins where profile_id = auth.uid()))
  with check (exists (select 1 from public.admins where profile_id = auth.uid()));
