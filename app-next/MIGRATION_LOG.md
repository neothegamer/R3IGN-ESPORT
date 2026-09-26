# R3IGN-ESPORT → Next.js Migration Log

## Done
- Scaffold: layout.tsx, Header.tsx, Footer.tsx, globals.css, next.config.ts, tsconfig.json, public/assets/
- Meta: not-found.tsx, sitemap.ts, robots.ts, manifest.ts
- Static pages: about, community, copyright, guide, partnerships, privacy, support, terms
- Homepage completed (`app/page.tsx`)
- leagues (`app/leagues/page.tsx` + LeagueFilter.tsx)
- merch (`app/merch/page.tsx`)
- media (`app/media/page.tsx`)
- **news** (`app/news/page.tsx` + NewsGrid.tsx) — sample data + working filters; live Supabase fetch + detail view deferred

## In Progress
- Step 2: Remaining static pages

## Next Up
1. awards
2. divisions
3. rankings (static shell + fallback first)
4. events
5. brackets
6. match-highlights
7. organizations
8. org

## Decisions Made
- Supabase stays the backend. Browser talks directly via @supabase/ssr cookie sessions.
- Next.js API routes only for secrets (TikTok OAuth) and future webhooks.
- Switch to layout-only Header/Footer pattern going forward.
- Preserve all business logic, table/column names, RLS assumptions, env var names.
- Work one task at a time; user applies changes and confirms.
- News uses sample data for now (same 6 posts as original). Live `news_posts` query + `?post=` detail view will be added when Supabase client is set up.

## Legacy → New file mapping
| Legacy | New |
|--------|-----|
| index.html | app/page.tsx |
| leagues.html | app/leagues/page.tsx + app/leagues/LeagueFilter.tsx |
| merch.html | app/merch/page.tsx |
| media.html | app/media/page.tsx |
| news.html | app/news/page.tsx + app/news/NewsGrid.tsx |
| css/styles.css | app/globals.css |
| (header/footer markup) | components/Header.tsx + Footer.tsx + app/layout.tsx |

## Known Issues
- Some already-migrated pages still import/render Header/Footer themselves (harmless nesting).
- Countdown timers, newsletter form submit, RCML team-count, and live news fetch still depend on main.js / auth.js / Supabase client (not yet ported).
- Consent banner not yet ported.