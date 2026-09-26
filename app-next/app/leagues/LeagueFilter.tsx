"use client";

import { useState } from "react";
import Link from "next/link";

const LEAGUES = [
  {
    id: "rcml",
    tags: "active",
    code: "RCML",
    stamp: "stamp-live",
    stampLabel: "Active",
    badge: "/assets/leagues/rcml-badge.png",
    badgeAlt: "R3IGN COD: Mobile Multiplayer League badge",
    title: "R3IGN COD:Mobile Multiplayer League",
    description:
      "Competitive 5v5 Call of Duty Mobile Multiplayer, run across a regular season and single-elimination playoffs. Currently in Season 4.",
    meta: "FORMAT  5v5, Multiplayer\nPLATFORM  Mobile\nSTATUS  Season 4 in progress",
    footLeft: "10 Teams",
    footHref: "/rankings",
    footLabel: "View Standings →",
  },
  {
    id: "rfcl",
    tags: "soon",
    code: "RFCL",
    stamp: "stamp-soon",
    stampLabel: "Coming Soon",
    badge: "/assets/leagues/rfcl-badge.png",
    badgeAlt: "R3IGN Free Fire Clash Squad League badge",
    title: "R3IGN Free Fire Clash Squad League",
    description:
      "Competitive Free Fire Clash Squad operations. Registration opens ahead of the inaugural season — get on the waitlist early.",
    meta: "FORMAT  Clash Squad\nPLATFORM  Mobile\nSTATUS  Registration opening soon",
    footLeft: "Season 1",
    footHref: "/register",
    footLabel: "Register Interest →",
  },
  {
    id: "rbsl",
    tags: "soon",
    code: "RBSL",
    stamp: "stamp-soon",
    stampLabel: "Coming Soon",
    badge: "/assets/leagues/rbsl-badge.png",
    badgeAlt: "R3IGN Blood Strike Squad Fight League badge",
    title: "R3IGN Blood Strike Squad Fight League",
    description:
      "Competitive Blood Strike Squad Fight operations. Format and season dates will be announced alongside RFCL.",
    meta: "FORMAT  Squad Fight\nPLATFORM  Mobile\nSTATUS  Registration opening soon",
    footLeft: "Season 1",
    footHref: "/register",
    footLabel: "Register Interest →",
  },
];

export default function LeagueFilter() {
  const [filter, setFilter] = useState("all");

  const visible = LEAGUES.filter(
    (l) => filter === "all" || l.tags === filter
  );

  return (
    <>
      <div className="filter-bar">
        <button
          className="filter-chip"
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
        >
          All Leagues
        </button>
        <button
          className="filter-chip"
          aria-pressed={filter === "active"}
          onClick={() => setFilter("active")}
        >
          Active
        </button>
        <button
          className="filter-chip"
          aria-pressed={filter === "soon"}
          onClick={() => setFilter("soon")}
        >
          Coming Soon
        </button>
      </div>

      {visible.length === 0 && (
        <p className="empty-state">
          No leagues match that filter. Try a different option.
        </p>
      )}

      <div className="dossier-grid">
        {visible.map((league) => (
          <div key={league.id} className="dossier league-full">
            <div className="dossier-head">
              <span>{league.code}</span>
              <span className={`stamp ${league.stamp}`}>
                {league.stampLabel}
              </span>
            </div>
            <div className="dossier-badge">
              <img
                src={league.badge}
                alt={league.badgeAlt}
                loading="lazy"
              />
            </div>
            <div className="dossier-body">
              <h3>{league.title}</h3>
              <p>{league.description}</p>
              <p
                style={{
                  marginTop: "1rem",
                  fontFamily: "var(--f-mono)",
                  fontSize: "0.78rem",
                  color: "var(--steel)",
                  whiteSpace: "pre-line",
                }}
              >
                {league.meta}
              </p>
            </div>
            <div className="dossier-foot">
              <span id={league.id === "rcml" ? "rcml-team-count" : undefined}>
                {league.footLeft}
              </span>
              <Link href={league.footHref}>{league.footLabel}</Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}