-- R3IGN profile pictures and reliable player search
-- Run once in the Supabase SQL Editor.

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists avatar_url text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can view profile avatars" on storage.objects;
create policy "Anyone can view profile avatars"
  on storage.objects for select
  using (bucket_id = 'profile-avatars');

drop policy if exists "Users can upload their own profile avatar" on storage.objects;
create policy "Users can upload their own profile avatar"
  on storage.objects for insert
  with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update their own profile avatar" on storage.objects;
create policy "Users can update their own profile avatar"
  on storage.objects for update
  using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text);