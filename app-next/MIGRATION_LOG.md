# R3IGN-ESPORT → Next.js Migration Log

## Done
- Scaffold: layout.tsx, Header.tsx, Footer.tsx, globals.css, next.config.ts, tsconfig.json, public/assets/
- Meta: not-found.tsx, sitemap.ts, robots.ts, manifest.ts
- Static pages: about, community, copyright, guide, partnerships, privacy, support, terms
- Homepage completed (`app/page.tsx`)
- leagues (`app/leagues/page.tsx` + LeagueFilter.tsx)
- merch (`app/merch/page.tsx`)
- media (`app/media/page.tsx`)
- news (`app/news/page.tsx` + NewsGrid.tsx)
- awards (`app/awards/page.tsx`)
- divisions (`app/divisions/page.tsx`)
- rankings (`app/rankings/page.tsx` + RankingsTable.tsx)
- events (`app/events/page.tsx` + EventsClient.tsx) — hydration fixed
- **brackets** (`app/brackets/page.tsx`) — sample bracket; live tournaments/bracket_matches deferred

## In Progress
- Step 2: Remaining static pages

## Next Up
1. match-highlights
2. organizations
3. org

## Decisions Made
- Supabase stays the backend. Browser talks directly via @supabase/ssr cookie sessions.
- Next.js API routes only for secrets (TikTok OAuth) and future webhooks.
- Switch to layout-only Header/Footer pattern going forward.
- Preserve all business logic, table/column names, RLS assumptions, env var names.
- Work one task at a time; user applies changes and confirms.
- Events sample dates generated client-side only (useEffect) to avoid hydration mismatch.
- Brackets uses static sample data. Live `tournaments` + `bracket_matches` query deferred until Supabase client step.

## Legacy → New file mapping
| Legacy | New |
|--------|-----|
| index.html | app/page.tsx |
| leagues.html | app/leagues/page.tsx + app/leagues/LeagueFilter.tsx |
| merch.html | app/merch/page.tsx |
| media.html | app/media/page.tsx |
| news.html | app/news/page.tsx + app/news/NewsGrid.tsx |
| awards.html | app/awards/page.tsx |
| divisions.html | app/divisions/page.tsx |
| rankings.html | app/rankings/page.tsx + app/rankings/RankingsTable.tsx |
| events.html | app/events/page.tsx + app/events/EventsClient.tsx |
| brackets.html | app/brackets/page.tsx |
| css/styles.css | app/globals.css |
| (header/footer markup) | components/Header.tsx + Footer.tsx + app/layout.tsx |

## Known Issues
- Some already-migrated pages still import/render Header/Footer themselves (harmless nesting).
- Countdown timers, newsletter form submit, RCML team-count, live news/awards/divisions/rankings/events/brackets still depend on main.js / auth.js / Supabase client (not yet ported).
- Consent banner not yet ported.