"use client";

import { useState } from "react";

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
  {
    league: "rfcl",
    pos: "—",
    team: "RFCL standings open once Season 1 begins.",
    tag: "",
    wins: "",
    losses: "",
    pct: "",
    isPlaceholder: true,
  },
  {
    league: "rbsl",
    pos: "—",
    team: "RBSL standings open once Season 1 begins.",
    tag: "",
    wins: "",
    losses: "",
    pct: "",
    isPlaceholder: true,
  },
];

export default function RankingsTable() {
  const [filter, setFilter] = useState("rcml");

  const visible = SAMPLE_ROWS.filter((r) => r.league === filter);

  const statusText =
    filter === "rcml"
      ? "Showing RCML Season 4 · sample data — connect Supabase for live standings."
      : filter === "rfcl"
        ? "Showing RFCL · Season not yet started."
        : "Showing RBSL · Season not yet started.";

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

      {visible.length === 0 && (
        <p className="empty-state">
          No teams match that filter. Try a different league.
        </p>
      )}

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