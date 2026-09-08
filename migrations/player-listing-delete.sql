-- Allow players to delete their own player-market listings.
-- Run once in the Supabase SQL Editor for an existing project.

alter table public.player_listings enable row level security;

drop policy if exists "Users can delete their own listing" on public.player_listings;
create policy "Users can delete their own listing"
  on public.player_listings for delete
  using (auth.uid() = profile_id);