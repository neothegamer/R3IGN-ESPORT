# R3IGN Esports League (REL) — Website

A fully static, framework-free site for R3IGN Esports League (REL). Plain HTML/CSS/JS — no build step, no dependencies, works by just opening `index.html` or hosting the folder anywhere.

## What's included

- **Pages:** Home, Leagues, Divisions, Rankings, Organizations, Player Market, Messages, Awards, News, Media, Partnerships, Guide, Community, Merch, About, Support, Register, Terms, Privacy, Copyright
- **Functionality:**
  - Responsive nav with mobile menu and a status ticker
  - Filterable rankings, organizations, and news (client-side, no reload)
  - Six-division ladder page (promotion/relegation structure)
  - Player Market: free-agent directory (now backed by real `player_listings` rows, with a sample-data fallback) + a "list yourself" form
  - Direct messaging (`messages.html`): a "Message" button on any real Player Market listing opens a private conversation with that player — inbox-style conversation list, unread indicator in the nav, all backed by the `messages` table with row-level security so only the two participants can ever read a thread
  - Awards page with award categories and a Hall of Champions grid
  - Accordion FAQ on the Support page
  - Validated team registration form and player-market listing form (front-end validation only — see note below)
  - Fully responsive layout, keyboard-focus states, and reduced-motion support
- **No build tools required** — it's just `.html`, `.css`, and `.js` files.

### What's *not* real (by design)

A few things are represented as static UI only, since making them actually work needs a real backend/database — building fake versions of these would be misleading:
- **Sign in / accounts** — not implemented; there's no auth system.
- **Merch store** — `merch.html` is a "coming soon" placeholder, not a working storefront.
- **Live rankings, kill leaderboards** — sample/fallback data is hard-coded directly in each page's inline script (used only until Supabase has real rows), not pulled from a live match-results database by default.
- **Registration / player-market forms** — validate in the browser and show a success message, but don't send anywhere until you connect a backend (see "Editing content" below).

## File structure

```
r3ign/
├── index.html
├── leagues.html
├── rankings.html
├── events.html
├── organizations.html
├── player-market.html
├── match-highlights.html
├── register.html
├── news.html
├── about.html
├── support.html
├── signin.html
├── signup.html
├── account.html
├── admin.html
├── terms.html
├── privacy.html
├── copyright.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── README.md
├── README.txt         # plain-text copy of this file
├── _headers          # Netlify security headers
├── vercel.json        # Vercel security headers
├── schema.sql         # run this in Supabase SQL Editor — see below
├── css/
│   └── styles.css
├── js/
│   ├── main.js
│   ├── auth.js
│   ├── assistant.js
│   └── supabase-config.js
├── scripts/
│   └── generate-config.js
├── assets/
│   ├── r3ign-logo.jpg
│   ├── r3ign-logo-256.jpg
│   ├── favicon.png
│   ├── icons/          # Discord logo, used on signin.html/signup.html (TikTok uses an inline SVG icon — no image asset needed)
│   └── games/         # Call of Duty: Mobile, Free Fire, Blood Strike, PUBG Mobile, Mobile Legends, Arena of Valor logos
└── legacy/
    └── build.py.outdated-do-not-run   # archived — see warning below, no longer part of the workflow
```

**This site no longer uses a page generator.** It originally did — a `build.py` script that generated every `.html` file, `robots.txt`, `sitemap.xml`, `_headers`, and `vercel.json` from shared templates. Since the Aug 2026 passes (nav restructure, Events/Scrims/Match Highlights pages, admin panels, the Ops Dossier redesign) were all hand-edited directly into the generated files, that script fell out of sync with the real site and regenerating from it would have silently overwritten all of that work.

Rather than leave a warning that depends on someone reading it before typing `python3 build.py`, the file has been **renamed and moved** to `legacy/build.py.outdated-do-not-run` — that exact filename no longer exists at the project root, so the command it used to be run with simply won't find anything to execute. The `.html`/`.css`/`.js` files are the permanent source of truth now; edit them directly. The archived script (with a full explanation at the top of the file) is kept only in case someone wants to rebuild a template system from scratch later — it would need every template updated to match the current site before it's safe to use again.

**If you've updated from an earlier copy of this site:** re-run `schema.sql` in the Supabase SQL Editor before testing — it adds the `league_id` column, the `events` table, the `registrations` table, and the two new storage buckets (`game-profiles`, `player-market-uploads`). It's safe to run again on an existing database — every statement uses `if not exists` / `create or replace` / `drop policy if exists` so it won't duplicate anything already there.

## Backend status: connected ✅

This copy of the site is already wired to a live Supabase project (region eu-west-2):
- `.env` stores the local Project URL and anon key and is ignored by Git
- `npm run build` generates `js/supabase-config.js` from those environment variables
- `schema.sql` has been applied — `profiles`, `organizations`, `rankings`, `player_listings`, and `registrations` tables all exist with row-level security on
- `rankings` is seeded with 5 sample Season 4 rows — `rankings.html` is already reading them live
- Email/password sign-up and sign-in work right now, with no further setup
- The team registration form (`register.html`) and player-market listing form (`player-market.html`) write straight into the database

What's left is two things only *you* can do, because they require accounts on Discord's and TikTok's own developer platforms — I can't create OAuth apps on your behalf. (Google sign-in has been removed from the site, so there's no setup step for it.)

### Enable Discord sign-in
1. [Discord Developer Portal](https://discord.com/developers/applications) → **New Application → OAuth2**
2. Add this as a **Redirect URI**:
   ```
   https://nyditfrfzarntmekcyli.supabase.co/auth/v1/callback
   ```
3. In your [Supabase dashboard](https://supabase.com/dashboard/project/nyditfrfzarntmekcyli/auth/providers) → **Authentication → Providers → Discord**, paste in the **Client ID** and **Client Secret**, then toggle it **on**

### Enable TikTok sign-in
TikTok isn't one of Supabase's built-in social providers (unlike Discord), so it has to be added as a **Custom OAuth2 Provider** instead — a couple of extra steps compared to Discord, but still no code changes needed on your end:

1. [TikTok for Developers](https://developers.tiktok.com/) → create an app → add the **Login Kit** product
2. Add this as the **Redirect URI**:
   ```
   https://nyditfrfzarntmekcyli.supabase.co/auth/v1/callback
   ```
3. Copy the app's **Client Key** and **Client Secret**
4. In your [Supabase dashboard](https://supabase.com/dashboard/project/nyditfrfzarntmekcyli/auth/providers) → **Authentication → Providers** → **Add provider → Custom** (manual OAuth2 configuration), and fill in:
   - **Identifier**: `custom:tiktok` (must match exactly — this is what `js/auth.js` calls)
   - **Client ID**: your TikTok Client Key
   - **Client Secret**: your TikTok Client Secret
   - **Authorization URL**: `https://www.tiktok.com/v2/auth/authorize/`
   - **Token URL**: `https://open.tiktokapis.com/v2/oauth/token/`
   - **UserInfo URL**: `https://open.tiktokapis.com/v2/user/info/`
5. Save and toggle the provider **on**

## Linked game accounts + verification (COD:Mobile, Free Fire, Blood Strike)

None of these games have a public sign-in API, so there's no real "Sign in with COD Mobile" button possible — this is true for every third-party esports site, not a limitation of this build. Instead:

1. A signed-in player goes to **My Account** (`account.html`) and enters their in-game name (and player UID, if the game shows one) for RCML, RFCL, and/or RBSL.
2. Saving it generates a short **verification code** and sets status to **Pending Review**.
3. A league admin opens **Admin** (`admin.html`) and marks each submission **Verified** or **Rejected** after checking it against the player's actual in-game profile by eye (e.g. asking them to place the code in their in-game bio/clan tag temporarily, or just recognizing a known player).
4. If a verified player later edits their IGN or UID, it automatically drops back to "Pending" so it gets re-reviewed.

### Making yourself the first admin
The very first admin has to be added directly in the database — after that, existing admins can promote new ones from the **Admin** page itself (search a player by League ID or email, click **Make Admin**), no database access needed:
1. Sign up on the live site normally (email, Discord, or TikTok)
2. In Supabase → **Table Editor → profiles**, find your row and copy your `id`
3. Go to **Table Editor → admins → Insert row**, paste that `id` into `profile_id`, save

Once that's done, `admin.html` will show you the **Verify** / **Reject** buttons for every submission — everyone else can view the queue but the database blocks them from approving anything, regardless of what the page shows them.

### Once you deploy to GitHub Pages
Go to **Authentication → URL Configuration** in Supabase and set:
- **Site URL** → `https://yourname.github.io/r3ign-esports/`
- **Redirect URLs** → add `https://yourname.github.io/r3ign-esports/account.html`

Until you set this, OAuth sign-in will redirect back to `localhost` instead of your live site — email/password sign-in isn't affected by this setting.

### Email confirmation: 6-digit code (not a link)
By default, Supabase's "Confirm signup" email contains a clickable link. This site instead shows a 6-digit code entry screen right after sign-up (`signup.html` calls `verifyOtp()`), which is a better spam/fake-email filter — but it requires **one manual change in your Supabase dashboard**, since email templates aren't something I can edit through the tools I have:

1. Go to **Authentication → Email Templates → Confirm signup**
2. Replace the template body with something that includes `{{ .Token }}` (the 6-digit code) instead of `{{ .ConfirmationURL }}`. A minimal version:
   ```html
   <h2>Confirm your R3IGN account</h2>
   <p>Enter this code on the site to finish creating your account:</p>
   <p style="font-size:32px; font-weight:700; letter-spacing:4px;">{{ .Token }}</p>
   <p>This code expires shortly, so use it right away.</p>
   ```
3. Save.

**If your confirmation emails aren't arriving at all** (not even in spam): that's almost always because Supabase's *built-in* email sender is a shared, rate-limited service meant only for testing — it's not meant to reliably deliver in production, with or without this OTP change. The fix is to connect a real email provider under **Authentication → Providers → Email → SMTP Settings**. [Resend](https://resend.com) has a generous free tier and is the most commonly recommended option for Supabase projects; Postmark and SendGrid also work fine.

If you'd rather not require email confirmation at all while testing, you can turn it off under **Authentication → Providers → Email → Confirm email** — but note the 6-digit code screen on `signup.html` assumes confirmation is required, so turning it off means new accounts skip straight to being signed in instead of seeing that screen.

### Loading real rankings
The 5 rows in `rankings` right now are the same sample data from before — send me your real last-season standings (team, tag, wins, losses, points, division) and I'll insert them directly into the live table for you.

### Player Market uploads
Screenshots uploaded on `player-market.html` go to a **public** storage bucket (`player-market-uploads`) — unlike the account-verification screenshots on `account.html`, these are meant for recruiting captains to see, so anyone can view them, but a player can only upload/replace their own.



This site uses [Supabase](https://supabase.com) as its backend — a free hosted Postgres database + auth service you control. GitHub Pages still just serves your static files; Supabase handles everything that needs a real server (accounts, sessions, OAuth, the rankings database). Nothing to install locally.

### 1. Create a Supabase project
1. Go to [supabase.com](https://supabase.com) → **New project** (free tier is enough to start)
2. Once it's created, go to **Project Settings → API**
3. Copy the **Project URL** and the **`anon` `public`** key (never use the `service_role` key in front-end code — it bypasses all security rules)
4. Copy `.env.example` to `.env` and fill in the values:
   ```js
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_ANON_KEY=your-anon-key
   ```
5. Run `npm run build` before opening the site locally. The generated `js/supabase-config.js` is ignored by the deployment workflow's source configuration and must not be edited manually.

### Deployment environment variables

The GitHub Pages workflow generates the browser config during deployment. Add these repository secrets under **Settings → Secrets and variables → Actions**:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

The anon key is designed to be exposed to the browser and must be protected by Supabase Row Level Security. Never put a `service_role` key in `.env`, `js/supabase-config.js`, or any static page.

### 2. Create the database tables
1. In Supabase, open **SQL Editor → New query**
2. Paste in the entire contents of `schema.sql` (included in this repo) and click **Run**
3. This creates `profiles`, `organizations`, `rankings`, and `player_listings` tables, sets up row-level security so people can only edit their own data, and seeds `rankings` with sample Season 4 data — replace that seed data with real results whenever you have them (see below).

### 3. Turn on email sign-in
Email/password auth is on by default in Supabase — no extra setup needed. By default Supabase requires email confirmation before first sign-in; you can turn that off for testing under **Authentication → Providers → Email → Confirm email**.

### 4. Turn on Discord sign-in
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) → **New Application → OAuth2**
2. In Supabase, go to **Authentication → Providers → Discord** to find the **Redirect URI** to paste into Discord's OAuth2 settings
3. Copy Discord's **Client ID** and **Client Secret** into that Supabase Discord provider screen, and toggle it **on**

### 5. Set your site URL (important for OAuth redirects to work once deployed)
In Supabase, go to **Authentication → URL Configuration** and set:
- **Site URL** → your GitHub Pages URL, e.g. `https://yourname.github.io/r3ign-esports/`
- **Redirect URLs** → add both `https://yourname.github.io/r3ign-esports/account.html` and, for local testing, `http://localhost:8000/account.html`

### 6. Push real rankings data
The `rankings` table only has sample Season 4 numbers right now. To load your real last-season results:
- Easiest: send me the standings (team name, tag, wins, losses, points, division) and I'll turn them into `INSERT` statements you can paste into the Supabase SQL Editor
- Or: edit rows directly in Supabase under **Table Editor → rankings**
- `rankings.html` automatically fetches from this table once Supabase is configured — no code changes needed after that

### What's now wired up vs. what's still a placeholder
| Feature | Status |
|---|---|
| Email/password sign up + sign in | Real — via Supabase Auth |
| Discord / TikTok sign-in | Real, once you complete the steps above |
| League ID (`R3E######`) | Real — auto-generated once for every new profile |
| Account page (`account.html`) | Real — game picker, IGN/UID, optional screenshot upload for review |
| Admin page (`admin.html`) | Real — verify game accounts, post events, promote/remove other admins |
| Events (`events.html`) | Real — reads from the `events` table; falls back to sample dates if not configured. "Add to Calendar" downloads a real `.ics` file (works on iOS/Android/macOS/Windows) and links to Google Calendar |
| Live rankings (`rankings.html`) | Real — reads from the `rankings` table once configured; falls back to sample rows if not |
| Team registration (`register.html`) | Real — writes to `registrations`; only shown to signed-in players (signed-out visitors see a sign-in prompt instead of the form) |
| Player Market (`player-market.html`) | Real — the browse grid reads from `player_listings` (falls back to sample cards if empty/not configured); the form writes to `player_listings`, including an optional profile-screenshot upload; only shown to signed-in players |
| Messages (`messages.html`) | Real — reads/writes the `messages` table; a "Message" button appears on any real (non-sample) Player Market listing for signed-in users viewing someone else's listing |
| Match Highlights (`match-highlights.html`) | Real — reads from `match_highlights` (table now actually exists — see changelog); falls back to sample clips if empty |
| News (`news.html`) | Real — reads from `news_posts`; falls back to sample articles if empty. Admin-only posting via "Manage News" in `admin.html` |
| Awards / Hall of Champions (`awards.html`) | Real — the "Recent MVPs" grid reads from `award_winners`; falls back to the original sample names if empty. Admin-only posting via "Manage Hall of Champions" in `admin.html` |
| Events (`events.html`) | Real — reads from `events` (table now actually exists — see changelog); falls back to sample events if empty |
| Tournament Bracket (`brackets.html`) | Real — reads from `tournaments`/`bracket_matches` (tables now actually exist — see changelog), seeded with one live sample bracket |
| Division org counts (`divisions.html`) / League team counts (`leagues.html`) | Real — computed live from the `organizations` table; falls back to the original static numbers if Supabase isn't configured |
| Merch store | Still a placeholder — needs a real storefront provider |

## Site structure & recent additions

- **Nav dropdown** — "Organizations" now has a submenu with **Player Market** underneath it, both on desktop (hover/click) and mobile (tap to expand).
- **"Register Team" moved** — it no longer sits next to Sign In in the header. It's reachable from the footer and from My Account once you're signed in; the page itself checks your session and shows a sign-in prompt instead of the form if you're logged out.
- **404 page** (`404.html`) — branded not-found page with links back to Home and Support.
- **`robots.txt` / `sitemap.xml`** — hand-maintained now (previously generated by `build.py`; see the note in "File structure" above about why that script was retired). `admin.html` and `account.html` are excluded from crawling.
- **Security headers** (`_headers` for Netlify, `vercel.json` for Vercel) — sets CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and HSTS. **GitHub Pages can't serve custom headers at all**, so if you deploy there these files are inert — there's no static-hosting equivalent, you'd need to switch hosts or put a CDN in front. Note the CSP allows `'unsafe-inline'` scripts because most pages' form logic is an inline `<script>` block — tightening that further means moving each page's script to its own file, which touches every page.
- **Cookie/consent banner** — appears on first visit, choice is remembered in `localStorage`. It's a real accept/decline UI but doesn't yet block or defer any analytics script (there isn't one loaded yet) — wire that up if you add analytics later.
- **Skip-to-main-content link** — first focusable element on every page, for screen-reader and keyboard users.
- **Empty-state messages** — rankings/organizations/news filters now show "No results" text instead of a blank page when a filter matches nothing.
- **Logo compressed** — `assets/r3ign-logo.jpg` went from 393KB to ~29KB (resized + re-compressed); the header/nav use the smaller `r3ign-logo-256.jpg` either way.

### Latest update (Sept 2026 pass, part 4 — merged build)

This build reconciles two parallel passes on the site (one that added PWA support, page transitions, and admin-dashboard charts; another that redesigned the news-article detail view). Everything from both was combined, and three real bugs were fixed in the process:

- **PWA additions kept**: `manifest.json`, `sw.js` (offline caching), theme-color meta, page-transition overlay/fade, scroll-to-top button, reading progress bar, keyboard shortcuts, lazy-image fade-in, and the admin dashboard's 7-day verification chart + copy-to-clipboard verification codes.
- **News article detail restored** to the branded "Official Statement" card (logo, red kicker line, bordered box with accent corners) instead of the plain layout, and it now actually shows a reading-time estimate (the helper existed but was never called before).
- **Fixed**: the 404 page shipped with a "search for a page" script that referenced an `<input>` that didn't exist in the markup, so it silently did nothing. The input/results markup is now in place and the live-filtered page search works.
- **Fixed**: a broken conditional in `main.js`'s link-interception logic (`!href.indexOf(...) === 0`, which could never be true) meant same-origin absolute links weren't being detected correctly. Corrected to a proper same-origin check.

### Latest update (Sept 2026 pass, part 3)

- **Email sign-up now uses a 6-digit code instead of a confirmation link** — after submitting the sign-up form, `signup.html` shows a code-entry screen (`verifyOtp()` under the hood) instead of a "check your email" dead end. Includes a resend option (30-second cooldown to prevent spam) and a way to go back and fix a mistyped email.
- **Requires one manual dashboard step** (can't be done through my tools — see "Email confirmation: 6-digit code" above): the "Confirm signup" email template needs `{{ .Token }}` in it instead of the default link.
- Also worth knowing: if confirmation emails aren't arriving at all right now, that's very likely unrelated to this change — Supabase's built-in email sender is rate-limited and not meant for production use. See the same section above for the SMTP fix.

### Latest update (Sept 2026 pass, part 2)

**A site-wide audit for fake/hardcoded content, prompted by a request to add news posting for admins.** Turned up a bigger issue than expected: several pages were calling real-looking Supabase queries against tables that were defined in `schema.sql` but had never actually been applied to the live database — meaning `events.html`, `brackets.html`, and `match-highlights.html` (and their matching admin panels) had been silently running on sample fallback data this whole time, with no visible indication anything was wrong.

- **Applied the missing tables** — `events`, `tournaments`, `bracket_matches`, and `match_highlights` now exist for real, with the same RLS already designed for them in `schema.sql` (admin-only writes, public reads). The sample tournament bracket is now a real seeded row, not a hardcoded fallback. The existing "Manage Events" and "Manage Bracket" admin panels needed no code changes — they were correctly built, just pointed at tables that didn't exist yet.
- **News is now real** — new `news_posts` table, admin-only writes (checked against the `admins` table, same pattern as everywhere else). `news.html`'s grid now reads live posts (falling back to the original sample articles if empty), each post gets a real detail view at `news.html?post=<id>`, and there's a new "Manage News" panel in `admin.html` to post/publish/unpublish/delete stories.
- **Hall of Champions is now real** — new `award_winners` table, same admin-only pattern, plus a "Manage Hall of Champions" panel in `admin.html`. The "Recent MVPs" grid on `awards.html` reads live winners with the original 6 names kept only as a fallback.
- **Division and league team counts are now live** — `divisions.html`'s per-division org counts and `leagues.html`'s RCML team count now query the real `organizations` table instead of showing hardcoded numbers.
- **Two unrelated tables removed** (`shibo_players`, `shibo_matches`) — these didn't match anything in this project's schema and looked like they belonged to a different app sharing the same Supabase project. Both were confirmed empty (0 rows) before being dropped, along with their two supporting functions (`log_match`, `undo_last_match`), which existed solely to update those tables. `handle_new_user()` — a third `SECURITY DEFINER` function in the project — was checked and left in place, since it's R3IGN's real signup trigger (it's what creates a `profiles` row when someone signs up).
- **Fixed a latent bug while in here**: the unread-message nav badge (`refreshUnreadBadge` in `js/auth.js`) had no error handling — if that query ever failed for any reason, it could throw and interrupt the rest of the page's script. Wrapped it in a try/catch so it now fails silently as originally intended.

**Pages confirmed intentionally static** (editorial/legal copy, not data records — left as-is): About, Community, Copyright, Guide, Media, Merch, Partnerships, Privacy, Support, Terms, 404. The homepage's headline stats and the site-wide ticker banner numbers were also left as static marketing copy rather than live-computed, as a deliberate scope decision — those read as aspirational headline figures rather than specific factual records, unlike named award winners or dated news articles.

### Latest update (Sept 2026 pass)

- **Direct messaging shipped** — a new `messages.html` page, backed by a real `messages` table (with row-level security so only the sender/recipient can ever read a thread). Player Market listings now render for real from `player_listings` instead of static sample cards, and each real listing gets a "Message" button that opens a private conversation with that player. Signed-in users see a "Messages" link (with an unread-count dot) in the nav on every page, including the mobile menu.
- **Verified stamp badge removed** — the small circular "R3IGN VERIFIED" stamp on page headers is gone site-wide (the homepage's "OFFICIAL" hero stamp and the footer's "OPS" stamp were left as-is, since only the "VERIFIED" one was asked to go).
- **Sharp corners everywhere** — every rounded rectangle (buttons, cards, badges, chat bubbles, inputs) now has perfect 90° corners. True circles (status dots, avatars, the chat launcher) were left round on purpose, since rounding those further would turn them into squares.

- **R3IGN Scrims removed entirely** — the dedicated Scrims page, its Events-page tab, the "Manage Scrims" admin panel, its chatbot intent, and the `scrims`/`scrim_slots` tables in `schema.sql` are all gone (those tables were never actually applied to the live database, so nothing had to be migrated). Site-wide nav, footer, and ticker references were cleaned up to match.
- **Twitch sign-in replaced with TikTok** — see "Enable TikTok sign-in" above; unlike Discord/Twitch, TikTok isn't a built-in Supabase provider, so it's wired up as a Custom OAuth2 Provider (`custom:tiktok`) instead.
- **Hero "R3IGN" in red** — on the homepage hero ("WE ARE R3IGN"), the word R3IGN is now set in the brand red (`#D2452F`) instead of the muted fade color.

### Latest update (Aug 2026 pass)

- **"Elite Scrims" renamed to "R3IGN Scrims"** everywhere — nav, ticker, footer, page copy, breadcrumbs — kept consistent across every page (this pass was done via `build.py`, back when it was still the source of truth — see the "File structure" note above about why that's no longer the case).
- **Global search** (`js/search.js`) — search icon in the header, or press **Ctrl/Cmd+K** anywhere. Client-side index over every page, league, and game; no backend or API key involved.
- **Site assistant — "R3IGN Ops Bot"** (`js/assistant.js`) — a floating chat launcher (bottom-right, every page) that answers common questions about registration, rankings, divisions, the player market, etc. It's a rule-based keyword matcher, fully client-side, **with no API key hardcoded anywhere**. If you later want it backed by a real LLM, set `window.R3IGN_ASSISTANT_ENDPOINT` to your *own* server-side proxy inside `js/assistant.js` — never call a paid model API directly from browser code, since the key would be exposed the same way the audit flagged for Supabase.
- **Admin dashboard stats** — `admin.html` now shows live counts (organizations, registrations, player listings, pending verifications) pulled from Supabase for signed-in admins.
- **Nav dropdown redesign** — the "Organizations → Player Market" submenu is now a soft, translucent, blurred panel with a small pointer arrow and gentle scale/fade motion, instead of a hard bordered box — less visually jarring, more like a natural extension of the nav link.
- **Mobile menu background fix** — the open mobile nav previously could show a gap/see-through strip on some phones if the header's real rendered height didn't match the CSS's assumed value. `js/main.js` now measures the header with `ResizeObserver` and writes it to a `--header-h` CSS variable that the mobile menu's position and background are pinned to, so it's always a solid, flush panel — tested against the Android layout shown in the screenshot.
- **Scroll-reveal animations** — cards, stat blocks, and section headers on every page now fade/slide in as you scroll (`IntersectionObserver`-driven, staggered slightly, and fully disabled for anyone with `prefers-reduced-motion` set). Buttons, dropdowns, and card hovers all use eased `cubic-bezier` transitions rather than linear ones for a more polished feel.
- **Sign-in error from the screenshot** — `js/supabase-config.js` already has this project's real Supabase URL/anon key filled in (that's expected to be public in front-end code by Supabase's own design, since it's scoped by Row-Level Security — see the comment in that file). With it filled in, `signin.html` no longer shows the "Auth isn't connected yet" banner. **Nothing in this codebase or in this chat contains any of your other private API keys** — if you use this project with a different Supabase project later, update only `js/supabase-config.js`.



### Latest update (Aug 2026 pass, part 2)

- **Live rankings, fixed** — `rankings.html` previously only live-fetched RCML and would wipe the RFCL/RBSL "not started" placeholder rows the moment Supabase was configured. It now fetches all three leagues in one query and keeps each in sync with its filter chip.
- **How to update rankings so they go live:**
  1. Sign in to the site with an account that's in your `admins` table (see "Manage Admins" further up this README).
  2. Go to `/admin.html` → **Manage Rankings**. Existing teams show in an editable table — change W/L/points inline and click **Save**, or **Delete** a team.
  3. To add a new team, fill in the small form below the table (name, tag, league, season) and click **Add Team to Rankings**.
  4. Anyone visiting `/rankings.html` sees the update immediately — no rebuild or redeploy needed, since it's read live from Supabase on every page load.
  - Prefer working directly in the database instead? Open your Supabase project → **Table Editor** → `rankings`, and edit rows there — same effect, just without the site's UI. Useful for bulk-importing a whole season at once.
  - Note the `wins`/`losses` fields feed the win % shown on the page; `points` is only used for sort order, so keep it consistent with however you're currently ranking teams (Elo, standard points-per-win, etc).
- **Tournament bracket** — new `/brackets.html` page: a dependency-free, pure CSS/JS single-elimination bracket. Reads from two new tables, `tournaments` and `bracket_matches` (see `schema.sql`), with a sample 8-team bracket bundled in so the page never looks empty before you've added real data. Manage it from `/admin.html` → **Manage Bracket** (edits the most recently created tournament's matches — set both teams, then a score once the match is played, and the winner highlight updates automatically).
- **Team/org detail pages** — organization cards on `/organizations.html` now link out to `/org.html?id=<uuid>` (or `?name=<slug>` for the bundled sample teams), a single reusable template that shows a team's league record, roster, bio, and social links. The `organizations` table gained a few optional columns for this — `logo_url`, `description`, `captain_name`, `roster`, `discord_url`, `twitch_url`, `twitter_url` — all nullable, so nothing breaks for orgs that haven't filled them in yet. Edit these directly in Supabase's Table Editor for now (a dedicated "Edit My Org" form for team owners is a natural next addition).
- **Every table now has a solid background** — table rows previously had no background of their own and could visually blend into the page behind them depending on scroll position; every `<table class="rank-table">` (rankings, admin panels, org page, bracket admin) now sits on an explicit `--panel` background with subtle zebra-striping.
- **Don't forget to re-run the SQL** — `schema.sql` gained new tables/columns/policies in this pass (rankings admin write-access, organization profile fields, tournaments, bracket_matches). Re-run the file in Supabase's SQL Editor; every statement is written with `if not exists` / `drop policy if exists` so it's safe to run again even though you've run it before.

### Latest update (Aug 2026 pass, part 3)

**⚠️ Action required: re-run `schema.sql`.** This pass added three new tables (`scrims`, `scrim_slots`, `match_highlights`) and a new storage bucket (`match-highlights`). Until you re-run the full `schema.sql` file in Supabase's SQL Editor, R3IGN Scrims, the Events page's Scrims tab, and Match Highlights will all show **sample/placeholder data only** — the pages work fine either way, but won't reflect anything real until the SQL is applied. Same safe-to-rerun guarantee as before (`if not exists` / `drop policy if exists` throughout).

**Navigation**
- The logo in the header is no longer a link — it was clickable before, now it's decorative only (`index.html` is still reachable from the "Home" nav item).
- **Player Market** and a new **Highlights** page are now standalone top-level nav items. The old submenus (Bracket under Events, Player Market under Organizations) are gone entirely — the nav is now one flat row of 11 links instead of dropdowns.
- The search icon/Ctrl+K search (`js/search.js`) has been removed completely, including the file itself.
- Nav switches to the mobile hamburger menu starting at **1200px** instead of 880px — with 11 flat nav items, that's the width where "Player Market" could start wrapping onto two lines and pushing Sign In out of the row; the earlier breakpoint was too narrow for that many items.

**Events, Scrims, Match Highlights**
- `events.html` now has three tabs: **Upcoming Events**, **Ongoing Events**, and an embedded **R3IGN Scrims** schedule (reads from the same `scrims` table as the dedicated Scrims page).
- `scrims.html` gained an **Ongoing Scrims** section (live status) and a real **Assigned Slots** table (group/room/slot draw for the next scrim) below the schedule — both read from Supabase with sample fallbacks.
- Register buttons on the Scrims page/tab previously had a transparent "ghost" style that could read as disabled — they now have a solid background.
- New page: **`match-highlights.html`** — screen-recorded match clips, either an embedded YouTube/Twitch link or a directly uploaded video file (served from the new `match-highlights` storage bucket). Filter chips by league (RCML/RFCL/RBSL).
- `admin.html` gained three new panels for managing all of this:
  - **Manage Scrims** — post a scrim, mark it ongoing/completed, publish its assigned-slots draw
  - **Manage Match Highlights** — post a clip link or upload a recording file directly from the browser
  - **Player Review Assistant** — look up any player by R3E ID, email, or display name and see their linked game accounts + verification status in one table. The same lookup also works from the R3IGN Ops Bot chat widget while you're on the admin page and signed in — try typing "look up R3E482910" into it.

**Sign-in / sign-up**
- Discord and Twitch buttons on `signin.html`/`signup.html` now show the actual brand logos (`assets/icons/discord.jpg`, `assets/icons/twitch.jpg`) instead of a plain letter.

**Visual redesign — "Ops Dossier"**
The whole site went through a deliberate visual pass, distinct from the earlier "tactical dossier" look it started with:
- New color tokens in `css/styles.css` (`:root`) — a drier stamp-ink red, a desaturated brass instead of bright gold, and a new manila/khaki tone (`--manila`, `--manila-ink`) used for label chips.
- **Signature element:** a rotated, double-ruled ink stamp (`.ink-stamp` class) — largest on the homepage hero, a smaller version in the corner of every interior page's header, and a small one in the footer brand column on every page.
  - ⚠️ If you ever add your own small badge/tag component, don't reuse the class name `.stamp` — that's a pre-existing class used site-wide for small status badges ("Active", "Unverified", "Coming Soon", etc.), completely separate from `.ink-stamp`.
- Every card site-wide (team cards, news cards, market listings, highlight cards, award cards, form panels) now has a clipped top-right corner with a small brass "fastener" dot, instead of a plain rectangle.
- Eyebrow labels (the small tag above section headings) are now a manila tab chip instead of a thin line + text.
- A thin red/brass strip runs along the very top of the header, like a color-coded folder tab.
- New animated background (a slow drifting glow + faint diagonal sweep) replacing the old static grid pattern; respects `prefers-reduced-motion`.
- Footer column headers (League/Compete/Discover/Help) are bolder, with a small hover-arrow animation on every link.
- Button text on `.btn-primary` changed from off-white to pure white, and the red accent was tuned slightly, to keep text contrast at WCAG AA (4.5:1) with the new palette.

**Bug fixes**
- **Champions rail blank space** — the "Honoring the Champions" row on the homepage could show an empty-looking panel to the right of the 4 champion cards; they now grow to fill the full row evenly.
- **Uneven divider lines** — cards in the same row (e.g. the three "Community / Fair Competition / Rankings" pillars on the homepage) could briefly appear misaligned mid-scroll, because the fade-in animation moved each card vertically with a slight stagger. The vertical motion was removed from that animation site-wide (it's now a pure fade), so this can't happen anywhere it's used.
- Fixed a class mismatch where the scroll-reveal system was targeting CSS classes (`.dossier-card`, `.champ-card`) that didn't match the actual HTML (`.dossier`, `.champion-card`) — the homepage's league cards and champions rail weren't animating in at all before this fix.

1. Create a new repository on GitHub (e.g. `r3ign-esports`).
2. Upload everything in this folder to the repository (or `git push` it — see below).
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Pick the `main` branch and `/ (root)` folder, then **Save**.
6. GitHub will publish your site at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

### Using git from the command line

```bash
git init
git add .
git commit -m "R3IGN Esports site"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Then follow steps 3–6 above.

## Editing content

- Text and structure for each page live directly in the `.html` files now — open the one you want to edit (e.g. `rankings.html`) and change it in place. (There used to be a `build.py` template system; it's been retired — see the "File structure" section above.)
- Colors, type, and spacing are all defined as CSS custom properties at the top of `css/styles.css` (`:root { ... }`) — change a value there to restyle the whole site.
- The registration form (`register.html`) currently only validates in the browser and shows a success message — it doesn't send anywhere yet. To actually receive submissions, either:
  - Point the `<form>` at a service like [Formspree](https://formspree.io) or [Netlify Forms](https://docs.netlify.com/forms/setup/) (add their `action` attribute), or
  - Wire it up to your own backend endpoint.

## Notes on the rebuild

This site is an original recreation inspired by the layout and copy of the live R3IGN Framer site — built with new code, a new visual system (dark "operations dossier" theme), and an original SVG mark, since Framer's exported assets and code aren't reusable outside Framer. Sample data (team records, standings, news items) mirrors what's on the live site and should be swapped for real, current data.
