# R3IGN-ESPORT → Next.js Migration Log

## Done
- Scaffold: App Router layout, Header, Footer, globals.css, public assets
- Static / marketing pages ported (about, community, support, legal, etc.)
- Dynamic browse pages: home, leagues, rankings, events, brackets, highlights, news, media, awards, divisions, merch, organizations, org
- Auth: signin/signup (`AuthForm`), password strength UI, email confirm OTP flow
- Unique display names (DB constraint + `is_display_name_taken` RPC) and duplicate-email handling on signup
- Profiles backfill + `handle_new_user` trigger (required for `messages.sender_id` FK)
- Register (live `RegisterForm` → `registrations`)
- Player Market (live listings create/delete + optional upload)
- Messages (live):
  - Conversations list, thread, compose
  - Unread sort + header badge dot
  - Send / delivered / read ticks (`✓` / `✓✓` grey / `✓✓` black when read)
  - Edit / delete own messages (long-press or right-click)
  - Realtime INSERT / UPDATE / DELETE on `messages`
  - Compact bubbles; chat panel fills viewport under header
  - `app/messages/page.tsx` wraps `MessagesClient` in `<Suspense>` (fixed `useSearchParams()` prerender error; `npm run build` now passes, 34/34 pages)
- Site-wide online presence:
  - `OnlinePresenceProvider` + `Providers` in root layout
  - Channel `r3ign-online` (any signed-in page, not only `/messages`)
  - Messages uses `useOnlinePresence()` for Online/Offline + delivery ticks
- Header: chat icon (replaced bell), settings icon matched size
- Env: `NEXT_PUBLIC_SUPABASE_URL` + legacy JWT anon key in `app-next/.env.local`
- Live data: Events (`app/events/page.tsx` server fetch + `EventsClient.tsx` against real `events` columns: id, title, description, league, location, start_time, end_time, created_by, created_at, ended_at; tabs Upcoming / Ongoing / Past; events are ended only by admins via `ended_at` (migrations/NNN_events_ended_at.sql, nullable timestamptz; write access already admin-only via existing RLS policies): Upcoming = not ended and start in the future, Ongoing = not ended and already started (scheduled `end_time` does not end an event), Past = `ended_at` set, most recently ended first, no calendar buttons on past cards; falls back to sample schedule if empty/error (Past empty in sample mode); public read via existing policy "Events are viewable by everyone"; existing event marked ended via SQL; confirmed on localhost)
- Live data: Rankings (`app/rankings/page.tsx` server fetch + `RankingsTable.tsx` against real `rankings` columns: id, organization_id, team_name, tag, league, season, division, wins, losses, points, updated_at; no `position` column — rank computed per league from points, then win %, then wins; league match is case-insensitive; falls back to the sample RCML table if empty/error; empty league shows "standings open once Season 1 begins" row; public read via existing policy "Rankings are viewable by everyone"; confirmed live on localhost (5 RCML Season 4 teams); table currently holds only rcml / Season 4 / division 1)
- Live data: Organizations (`app/organizations/page.tsx` server fetch + `OrgsGrid.tsx`; `organizations` columns: id, owner_id, name, tag, league, division, region, created_at — no stats columns, so rank / record / win % come from `rankings` (matched by `organization_id`, else by team name; rank = position within league by points, then win %, then wins); organizations without a ranking row show "—"; falls back to the sample list if `organizations` is empty/error; public read via existing policy "Organizations are viewable by everyone"; table was empty, so migrations/NNN_seed_organizations_from_rankings.sql created one organization per ranked team (5) and set `rankings.organization_id`; card links are `/org?name=<slug>` with slug derived from the name; confirmed on localhost)
- Live data: Org profile (`app/org/page.tsx`, server component; finds the organization whose name slug matches `?name=`; shows name, tag, league, division, region from `organizations` and League Record rows (real season, W–L, win %) from `rankings` by `organization_id`, else team name; description, roster and socials use their existing placeholders because those columns/tables do not exist; falls back to the sample profiles only if `organizations` is empty/error, otherwise an unknown slug shows "Not Found")

## In Progress
- Optional messages polish (typing indicator, soft-delete, etc. — user picks)

## Next Up
1. Roster for org profiles (no table links players to organizations; `game_profiles.team_clan` is free text — propose a link table + RLS design and wait for approval before building)
2. Live data for remaining sample-backed browse pages (candidate tables: `match_results`, `bracket_matches`, `tournaments`, `award_winners`, `match_highlights`, `news_posts`; check each against the repo)
3. Nav account menu / post-verify session refresh (if still flaky)
4. Admin (registration review; "End event" action that sets `events.ended_at`; `events` already has admin-only write policies via the `admins` table; `organizations` has none — admin edits will need new policies)
5. TikTok OAuth → `app/api/` route handlers
6. Resend SMTP for auth email (after Vercel host)
7. PWA + legacy cleanup (last)

## Decisions Made
- Supabase remains backend (DB, auth, RLS); browser via `@supabase/ssr`
- API routes only for secrets (TikTok OAuth, future webhooks)
- One task at a time; user applies files locally
- Messages receipts: delivered when recipient online or opens thread; read when thread opened
- Edit/delete only for sender; reflected via Realtime
- Message actions: long-press (mobile) / right-click (desktop)
- Online = signed-in user with app open (layout presence provider)
- Rankings have no `position` column; rank is derived in the app (positions 1..n, no shared places on ties)
- Rankings component file stays `RankingsTable.tsx` (no `RankingsClient.tsx`)
- Organization cards take rank/record from `rankings`; `organizations` stores identity only (name, tag, league, division, region, owner)
- Org profile URL is `/org?name=<slug>`; slug = lowercased name with non-alphanumerics collapsed to `-` (same rule in `OrgsGrid.tsx` and `app/org/page.tsx`)
- Check `pg_policies` before adding any RLS policy, to avoid duplicates
- Events end only when an admin sets `ended_at`; they never move to Past automatically by time; `end_time` is only the scheduled end (used for calendar exports)
- Events page has three tabs: Upcoming, Ongoing, Past; past events show no calendar buttons
- Pages that use `useSearchParams()` must wrap the client component in `<Suspense>` in their `page.tsx`
- Don't mark a page "live" in this log until it is confirmed on localhost (Grok's earlier claims for Rankings and Organizations were wrong)

## Legacy → New file mapping
| Legacy | Next.js |
|--------|---------|
| `signin.html` / `signup.html` | `app/signin`, `app/signup`, `components/auth/AuthForm.tsx` |
| `register.html` | `app/register`, `components/auth/RegisterForm.tsx` |
| `player-market.html` | `app/player-market`, `MarketClient.tsx` |
| `messages.html` | `app/messages`, `MessagesClient.tsx` |
| `js/supabase-config.js` | `app-next/.env.local` + `lib/supabase/*` |
| Header account / bell | `NavAccount.tsx` + `NavAccountClient.tsx` |
| (n/a — new) | `components/OnlinePresenceProvider.tsx`, `components/Providers.tsx` |

## Known Issues
- No UI yet for admins to end an event; until the Admin page exists, set `ended_at` in the Supabase table editor or SQL. An unended event stays under Ongoing (Live Now) even after its scheduled end time
- `organizations` currently holds only the 5 teams seeded from `rankings`; the "50+ Registered Orgs" eyebrow on /organizations is static text; seeded orgs have no `region`, so profiles show "Region not set" until set
- Org profile description, roster and socials have no database columns/tables yet; they show placeholders
- Build warnings (non-blocking): multiple lockfiles / workspace root inference; `metadataBase` not set
- Online status requires a signed-in session and Realtime enabled on the project
- Resend SMTP deferred until after Vercel deploy
- Some browse pages still use sample data until live queries are wired
- Confirm email / “Email not confirmed” if user skips OTP verify
- Running `npm run build` while `npm run dev` is running breaks the dev server (ChunkLoadError / unstyled page); stop dev, `rm -rf .next`, restart