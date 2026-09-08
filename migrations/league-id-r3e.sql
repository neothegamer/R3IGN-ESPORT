-- R3IGN League ID migration
-- Run this once in the Supabase SQL Editor for an existing project.
-- It updates old or missing IDs and keeps future signup IDs in the same format.

alter table public.profiles add column if not exists league_id text;
create unique index if not exists profiles_league_id_unique on public.profiles(league_id);

create or replace function public.generate_league_id()
returns text as $$
declare
  candidate text;
  taken boolean;
begin
  perform pg_advisory_xact_lock(hashtext('r3ign-league-id'));
  loop
    candidate := 'R3E' || lpad(floor(random() * 1000000)::text, 6, '0');
    select exists(select 1 from public.profiles where league_id = candidate) into taken;
    exit when not taken;
  end loop;
  return candidate;
end;
$$ language plpgsql set search_path = public;

insert into public.profiles (id, display_name, email, league_id)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'full_name', u.email),
  u.email,
  public.generate_league_id()
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);

do $$
declare
  profile_row record;
begin
  for profile_row in
    select id
    from public.profiles
    where league_id is null or league_id !~ '^R3E[0-9]{6}$'
  loop
    update public.profiles
    set league_id = public.generate_league_id()
    where id = profile_row.id;
  end loop;
end $$;

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
