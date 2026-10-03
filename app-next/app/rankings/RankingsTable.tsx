"use client";

import { useMemo, useState } from "react";

export type LiveRanking = {
  team_name: string;
  tag: string | null;
  league: string | null;
  wins: number | null;
  losses: number | null;
  points: number | null;
};

type RankRow = {
  league: string;
  pos: number | string;
  team: string;
  tag: string;
  wins: number | string;
  losses: number | string;
  pct: string;
  isPlaceholder?: boolean;
};

const SAMPLE_ROWS: RankRow[] = [
  { league: "rcml", pos: 1, team: "Aether Esports", tag: "AE", wins: 10, losses: 1, pct: "90.9%" },
  { league: "rcml", pos: 2, team: "Siroxx", tag: "SX", wins: 10, losses: 1, pct: "90.9%" },
  { league: "rcml", pos: 3, team: "Infinite", tag: "IN", wins: 9, losses: 2, pct: "81.8%" },
  { league: "rcml", pos: 4, team: "Eleventh Order", tag: "EO", wins: 8, losses: 3, pct: "72.7%" },
  { league: "rcml", pos: 5, team: "Seven Esports", tag: "SE", wins: 7, losses: 4, pct: "63.6%" },
  { league: "rcml", pos: 6, team: "7SIN Esports", tag: "7S", wins: 6, losses: 5, pct: "54.5%" },
  { league: "rcml", pos: 7, team: "Nightshade", tag: "NS", wins: 5, losses: 6, pct: "45.5%" },
  { league: "rcml", pos: 8, team: "Ironclad", tag: "IC", wins: 4, losses: 7, pct: "36.4%" },
  { league: "rcml", pos: 9, team: "Vortex Squad", tag: "VS", wins: 3, losses: 8, pct: "27.3%" },
  { league: "rcml", pos: 10, team: "Last Watch", tag: "LW", wins: 1, losses: 10, pct: "9.1%" },
];

const PLACEHOLDERS: Record<string, string> = {
  rfcl: "RFCL standings open once Season 1 begins.",
  rbsl: "RBSL standings open once Season 1 begins.",
  rcml: "RCML standings open once Season 4 begins.",
};

function winRate(wins: number, losses: number) {
  const games = wins + losses;
  return games > 0 ? wins / games : 0;
}

function formatPct(rate: number) {
  return (rate * 100).toFixed(1) + "%";
}

function buildLiveRows(rows: LiveRanking[], league: string): RankRow[] {
  return rows
    .filter((r) => (r.league ?? "").toLowerCase() === league)
    .map((r) => {
      const wins = Number(r.wins ?? 0);
      const losses = Number(r.losses ?? 0);
      return {
        team: r.team_name,
        tag: r.tag ?? "",
        wins,
        losses,
        points: Number(r.points ?? 0),
        rate: winRate(wins, losses),
      };
    })
    .sort(
      (a, b) => b.points - a.points || b.rate - a.rate || b.wins - a.wins
    )
    .map((r, i) => ({
      league,
      pos: i + 1,
      team: r.team,
      tag: r.tag,
      wins: r.wins,
      losses: r.losses,
      pct: formatPct(r.rate),
    }));
}

export default function RankingsTable({
  rows,
  live,
}: {
  rows: LiveRanking[];
  live: boolean;
}) {
  const [filter, setFilter] = useState("rcml");

  const visible: RankRow[] = useMemo(() => {
    const source = live
      ? buildLiveRows(rows, filter)
      : SAMPLE_ROWS.filter((r) => r.league === filter);
    if (source.length > 0) return source;
    return [
      {
        league: filter,
        pos: "—",
        team: PLACEHOLDERS[filter] ?? "No standings yet.",
        tag: "",
        wins: "",
        losses: "",
        pct: "",
        isPlaceholder: true,
      },
    ];
  }, [rows, live, filter]);

  const hasRows = visible.some((r) => !r.isPlaceholder);

  const statusText = !live
    ? filter === "rcml"
      ? "Showing RCML Season 4 · sample data — no live standings found yet."
      : `Showing ${filter.toUpperCase()} · Season not yet started.`
    : hasRows
      ? "Showing live standings from Supabase."
      : `Showing ${filter.toUpperCase()} · Season not yet started.`;

  return (
    <>
      <div className="filter-bar">
        <button
          className="filter-chip"
          aria-pressed={filter === "rcml"}
          onClick={() => setFilter("rcml")}
        >
          RCML · Season 4
        </button>
        <button
          className="filter-chip"
          aria-pressed={filter === "rfcl"}
          onClick={() => setFilter("rfcl")}
        >
          RFCL
        </button>
        <button
          className="filter-chip"
          aria-pressed={filter === "rbsl"}
          onClick={() => setFilter("rbsl")}
        >
          RBSL
        </button>
      </div>

      <div className="table-wrap">
        <table className="rank-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Team</th>
              <th>Tag</th>
              <th>W</th>
              <th>L</th>
              <th>Win %</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) =>
              row.isPlaceholder ? (
                <tr key={i} className="rank-row">
                  <td className="pos">—</td>
                  <td
                    className="team-name"
                    colSpan={5}
                    style={{ color: "var(--steel)" }}
                  >
                    {row.team}
                  </td>
                </tr>
              ) : (
                <tr key={i} className="rank-row">
                  <td className="pos">{row.pos}</td>
                  <td className="team-name">{row.team}</td>
                  <td>{row.tag}</td>
                  <td>{row.wins}</td>
                  <td>{row.losses}</td>
                  <td>{row.pct}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <p
        style={{
          marginTop: "1rem",
          fontFamily: "var(--f-mono)",
          fontSize: "0.78rem",
          color: "var(--steel)",
        }}
        id="rankings-status"
      >
        {statusText}
      </p>
    </>
  );
}