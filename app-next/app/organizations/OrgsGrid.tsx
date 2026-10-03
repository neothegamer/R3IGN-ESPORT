"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type OrgRow = {
  id: string;
  name: string;
  tag: string;
  league: string;
  division: number | null;
  region: string | null;
};

export type RankingRow = {
  organization_id: string | null;
  team_name: string;
  league: string | null;
  wins: number | null;
  losses: number | null;
  points: number | null;
};

type Org = {
  slug: string;
  league: string;
  rank: string;
  tag: string;
  name: string;
  record: string;
  pct: string;
  bar: string;
  pos: number;
};

const SAMPLE: Org[] = [
  { slug: "aether-esports", league: "rcml", rank: "RCML · #1", tag: "AE", name: "Aether Esports", record: "W10–L1", pct: "90.9%", bar: "90.9%", pos: 1 },
  { slug: "siroxx", league: "rcml", rank: "RCML · #2", tag: "SX", name: "Siroxx", record: "W10–L1", pct: "90.9%", bar: "90.9%", pos: 2 },
  { slug: "infinite", league: "rcml", rank: "RCML · #3", tag: "IN", name: "Infinite", record: "W9–L2", pct: "81.8%", bar: "81.8%", pos: 3 },
  { slug: "eleventh-order", league: "rcml", rank: "RCML · #4", tag: "EO", name: "Eleventh Order", record: "W8–L3", pct: "72.7%", bar: "72.7%", pos: 4 },
  { slug: "seven-esports", league: "rcml", rank: "RCML · #5", tag: "SE", name: "Seven Esports", record: "W7–L4", pct: "63.6%", bar: "63.6%", pos: 5 },
  { slug: "7sin-esports", league: "rcml", rank: "RCML · #6", tag: "7S", name: "7SIN Esports", record: "W6–L5", pct: "54.5%", bar: "54.5%", pos: 6 },
  { slug: "nightshade", league: "rcml", rank: "RCML · #7", tag: "NS", name: "Nightshade", record: "W5–L6", pct: "45.5%", bar: "45.5%", pos: 7 },
  { slug: "ironclad", league: "rcml", rank: "RCML · #8", tag: "IC", name: "Ironclad", record: "W4–L7", pct: "36.4%", bar: "36.4%", pos: 8 },
  { slug: "vortex-squad", league: "rcml", rank: "RCML · #9", tag: "VS", name: "Vortex Squad", record: "W3–L8", pct: "27.3%", bar: "27.3%", pos: 9 },
  { slug: "last-watch", league: "rcml", rank: "RCML · #10", tag: "LW", name: "Last Watch", record: "W1–L10", pct: "9.1%", bar: "9.1%", pos: 10 },
];

type Scored = {
  organization_id: string | null;
  team_name: string;
  league: string;
  wins: number;
  losses: number;
  points: number;
  rate: number;
  pos: number;
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildLiveOrgs(orgs: OrgRow[], rankings: RankingRow[]): Org[] {
  const scored: Scored[] = rankings.map((r) => {
    const wins = Number(r.wins ?? 0);
    const losses = Number(r.losses ?? 0);
    const games = wins + losses;
    return {
      organization_id: r.organization_id,
      team_name: r.team_name,
      league: (r.league ?? "").toLowerCase(),
      wins,
      losses,
      points: Number(r.points ?? 0),
      rate: games > 0 ? wins / games : 0,
      pos: 0,
    };
  });

  const leagues = Array.from(new Set(scored.map((s) => s.league)));
  for (const league of leagues) {
    scored
      .filter((s) => s.league === league)
      .sort((a, b) => b.points - a.points || b.rate - a.rate || b.wins - a.wins)
      .forEach((s, i) => {
        s.pos = i + 1;
      });
  }

  const byOrgId = new Map<string, Scored>();
  const byName = new Map<string, Scored>();
  for (const s of scored) {
    if (s.organization_id) byOrgId.set(s.organization_id, s);
    byName.set(s.team_name.trim().toLowerCase(), s);
  }

  return orgs
    .map((o) => {
      const league = (o.league ?? "").toLowerCase();
      const s = byOrgId.get(o.id) ?? byName.get(o.name.trim().toLowerCase());
      const leagueLabel = league.toUpperCase();
      if (!s) {
        return {
          slug: slugify(o.name),
          league,
          rank: leagueLabel,
          tag: o.tag,
          name: o.name,
          record: "—",
          pct: "—",
          bar: "0%",
          pos: 9999,
        };
      }
      const pct = (s.rate * 100).toFixed(1) + "%";
      return {
        slug: slugify(o.name),
        league,
        rank: `${leagueLabel} · #${s.pos}`,
        tag: o.tag,
        name: o.name,
        record: `W${s.wins}–L${s.losses}`,
        pct,
        bar: pct,
        pos: s.pos,
      };
    })
    .sort(
      (a, b) =>
        a.league.localeCompare(b.league) ||
        a.pos - b.pos ||
        a.name.localeCompare(b.name)
    );
}

export default function OrgsGrid({
  orgs,
  rankings,
  live,
}: {
  orgs: OrgRow[];
  rankings: RankingRow[];
  live: boolean;
}) {
  const [filter, setFilter] = useState("all");

  const all: Org[] = useMemo(
    () => (live ? buildLiveOrgs(orgs, rankings) : SAMPLE),
    [orgs, rankings, live]
  );

  const visible =
    filter === "all" ? all : all.filter((o) => o.league === filter);

  const statusText = live
    ? `Showing ${all.length} organization${all.length === 1 ? "" : "s"} from Supabase.`
    : "Showing sample RCML standings — connect Supabase and register organizations for the live list.";

  return (
    <>
      <div className="filter-bar">
        <button
          className="filter-chip"
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className="filter-chip"
          aria-pressed={filter === "rcml"}
          onClick={() => setFilter("rcml")}
        >
          RCML
        </button>
      </div>

      {visible.length === 0 && (
        <p className="empty-state">No organizations match that filter.</p>
      )}

      <div className="team-grid" id="org-grid">
        {visible.map((org) => (
          <Link
            key={org.slug}
            className="team-card team-item"
            data-tags={org.league}
            href={`/org?name=${org.slug}`}
          >
            <div className="team-rank">{org.rank}</div>
            <div className="team-badge">{org.tag}</div>
            <h3>{org.name}</h3>
            <div className="team-meta">
              <span>{org.record}</span>
              <span>{org.pct}</span>
            </div>
            <div className="win-bar">
              <span style={{ width: org.bar }}></span>
            </div>
          </Link>
        ))}
      </div>

      <p
        style={{
          marginTop: "1rem",
          fontFamily: "var(--f-mono)",
          fontSize: "0.78rem",
          color: "var(--steel)",
        }}
        id="orgs-status"
      >
        {statusText}
      </p>
    </>
  );
}