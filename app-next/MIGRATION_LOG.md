# R3IGN-ESPORT → Next.js Migration Log

## Done
- Scaffold: layout.tsx, Header.tsx, Footer.tsx, globals.css, next.config.ts, tsconfig.json, public/assets/
- Meta: not-found.tsx, sitemap.ts, robots.ts, manifest.ts
- Static pages: about, community, copyright, guide, partnerships, privacy, support, terms
- Homepage, leagues, merch, media, news, awards, divisions, rankings, events, brackets, match-highlights
- **organizations** (`app/organizations/page.tsx` + OrgsGrid.tsx) — sample RCML cards + filter

## In Progress
- Step 2: Remaining static pages

## Next Up
1. org (detail page — `/org?name=...` or `/org/[slug]`)

## Decisions Made
- Supabase stays the backend. Browser talks directly via @supabase/ssr cookie sessions.
- Next.js API routes only for secrets (TikTok OAuth) and future webhooks.
- Layout-only Header/Footer pattern.
- Preserve all business logic, table/column names, RLS assumptions, env var names.
- Work one task at a time; user applies changes and confirms.
- Org cards link to `/org?name={slug}` to match legacy query-param style for now. Can switch to `/org/[slug]` when we port the detail page.

## Legacy → New file mapping
| Legacy | New |
|--------|-----|
| index.html | app/page.tsx |
| leagues.html | app/leagues/page.tsx + LeagueFilter.tsx |
| merch.html | app/merch/page.tsx |
| media.html | app/media/page.tsx |
| news.html | app/news/page.tsx + NewsGrid.tsx |
| awards.html | app/awards/page.tsx |
| divisions.html | app/divisions/page.tsx |
| rankings.html | app/rankings/page.tsx + RankingsTable.tsx |
| events.html | app/events/page.tsx + EventsClient.tsx |
| brackets.html | app/brackets/page.tsx |
| match-highlights.html | app/match-highlights/page.tsx + HighlightsGrid.tsx |
| organizations.html | app/organizations/page.tsx + OrgsGrid.tsx |
| css/styles.css | app/globals.css |
| (header/footer markup) | components/Header.tsx + Footer.tsx + app/layout.tsx |

## Known Issues
- `/org?name=...` will 404 until the org detail page is migrated.
- Live org list from Supabase deferred until client setup step.
- Consent banner not yet ported.