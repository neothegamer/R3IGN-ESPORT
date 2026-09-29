# R3IGN-ESPORT → Next.js Migration Log

## Done
- Scaffold: App Router layout, Header, Footer, globals.css, public assets
- Static / marketing pages ported (about, community, support, legal, etc.)
- Dynamic browse pages: home, leagues, rankings, events, brackets, highlights, news, media, awards, divisions, merch, organizations, org
- Auth: signin/signup (AuthForm), password strength UI, email confirm OTP flow
- Unique display names (DB constraint + `is_display_name_taken` RPC) and duplicate-email handling on signup
- Profiles backfill + `handle_new_user` trigger guidance (FK for messages.sender_id)
- Register (live RegisterForm → registrations)
- Player Market (live listings create/delete + optional upload)
- Messages (live):
  - Conversations list, thread, compose
  - Unread sort + header badge dot
  - Send/delivered/read ticks (✓ / ✓✓ grey / ✓✓ black when read)
  - Edit/delete own messages (long-press / right-click)
  - Realtime INSERT/UPDATE/DELETE
  - Presence channel `r3ign-online` for Online/Offline
- Header: message icon (replaces bell), settings icon sized to match
- Env: `NEXT_PUBLIC_SUPABASE_URL` + legacy JWT anon key in `app-next/.env.local`

## In Progress
- Messages UI polish (layout vs footer, compact bubbles)
- Presence accuracy when users are not on `/messages`

## Next Up
1. Site-wide online presence (layout-level channel, not only messages page)
2. Nav account menu polish / post-verify session refresh
3. Live data for sample-backed browse pages (orgs, rankings, events…)
4. Admin (registration review)
5. TikTok OAuth → `app/api/` route handlers
6. Resend SMTP for auth email (after Vercel host)
7. PWA + legacy cleanup (last)

## Decisions Made
- Supabase remains backend (DB, auth, RLS); browser via `@supabase/ssr`
- API routes only for secrets (TikTok OAuth, future webhooks)
- One task at a time; user applies files locally
- Messages receipts: delivered when recipient online or opens thread; read when thread opened
- Edit/delete only for sender; reflected via Realtime
- Message actions: long-press (mobile) / right-click (desktop), not permanent hover buttons

## Legacy → New file mapping
| Legacy | Next.js |
|--------|---------|
| `signin.html` / `signup.html` | `app/signin`, `app/signup`, `components/auth/AuthForm.tsx` |
| `register.html` | `app/register`, `components/auth/RegisterForm.tsx` |
| `player-market.html` | `app/player-market`, `MarketClient.tsx` |
| `messages.html` | `app/messages`, `MessagesClient.tsx` |
| `js/supabase-config.js` | `app-next/.env.local` + `lib/supabase/*` |
| Header account / bell | `NavAccount.tsx` + `NavAccountClient.tsx` |

## Known Issues
- Online status only while both users have a page subscribed to presence (currently messages client)
- Messages layout previously left large empty space / footer collision — CSS fill-height fix in progress
- Resend SMTP deferred until after Vercel deploy
- Some browse pages still use sample data until live queries are wired
