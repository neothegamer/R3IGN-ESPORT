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
- Site-wide online presence:
  - `OnlinePresenceProvider` + `Providers` in root layout
  - Channel `r3ign-online` (any signed-in page, not only `/messages`)
  - Messages uses `useOnlinePresence()` for Online/Offline + delivery ticks
- Header: chat icon (replaced bell), settings icon matched size
- Env: `NEXT_PUBLIC_SUPABASE_URL` + legacy JWT anon key in `app-next/.env.local`

## In Progress
- Optional messages polish (typing indicator, soft-delete, etc. — user picks)

## Next Up
1. Nav account menu / post-verify session refresh (if still flaky)
2. Live data for sample-backed browse pages (orgs, rankings, events…)
3. Admin (registration review)
4. TikTok OAuth → `app/api/` route handlers
5. Resend SMTP for auth email (after Vercel host)
6. PWA + legacy cleanup (last)

## Decisions Made
- Supabase remains backend (DB, auth, RLS); browser via `@supabase/ssr`
- API routes only for secrets (TikTok OAuth, future webhooks)
- One task at a time; user applies files locally
- Messages receipts: delivered when recipient online or opens thread; read when thread opened
- Edit/delete only for sender; reflected via Realtime
- Message actions: long-press (mobile) / right-click (desktop)
- Online = signed-in user with app open (layout presence provider)

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
- Online status requires a signed-in session and Realtime enabled on the project
- Resend SMTP deferred until after Vercel deploy
- Some browse pages still use sample data until live queries are wired
- Confirm email / “Email not confirmed” if user skips OTP verify
