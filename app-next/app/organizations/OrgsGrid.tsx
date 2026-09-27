"use client";

import Link from "next/link";
import { useState } from "react";

type Org = {
  slug: string;
  league: string;
  rank: string;
  tag: string;
  name: string;
  record: string;
  pct: string;
  bar: string;
};

const SAMPLE: Org[] = [
  { slug: "aether-esports", league: "rcml", rank: "RCML · #1", tag: "AE", name: "Aether Esports", record: "W10–L1", pct: "90.9%", bar: "90.9%" },
  { slug: "siroxx", league: "rcml", rank: "RCML · #2", tag: "SX", name: "Siroxx", record: "W10–L1", pct: "90.9%", bar: "90.9%" },
  { slug: "infinite", league: "rcml", rank: "RCML · #3", tag: "IN", name: "Infinite", record: "W9–L2", pct: "81.8%", bar: "81.8%" },
  { slug: "eleventh-order", league: "rcml", rank: "RCML · #4", tag: "EO", name: "Eleventh Order", record: "W8–L3", pct: "72.7%", bar: "72.7%" },
  { slug: "seven-esports", league: "rcml", rank: "RCML · #5", tag: "SE", name: "Seven Esports", record: "W7–L4", pct: "63.6%", bar: "63.6%" },
  { slug: "7sin-esports", league: "rcml", rank: "RCML · #6", tag: "7S", name: "7SIN Esports", record: "W6–L5", pct: "54.5%", bar: "54.5%" },
  { slug: "nightshade", league: "rcml", rank: "RCML · #7", tag: "NS", name: "Nightshade", record: "W5–L6", pct: "45.5%", bar: "45.5%" },
  { slug: "ironclad", league: "rcml", rank: "RCML · #8", tag: "IC", name: "Ironclad", record: "W4–L7", pct: "36.4%", bar: "36.4%" },
  { slug: "vortex-squad", league: "rcml", rank: "RCML · #9", tag: "VS", name: "Vortex Squad", record: "W3–L8", pct: "27.3%", bar: "27.3%" },
  { slug: "last-watch", league: "rcml", rank: "RCML · #10", tag: "LW", name: "Last Watch", record: "W1–L10", pct: "9.1%", bar: "9.1%" },
];

export default function OrgsGrid() {
  const [filter, setFilter] = useState("all");

  const visible =
    filter === "all" ? SAMPLE : SAMPLE.filter((o) => o.league === filter);

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
        Showing sample RCML standings — connect Supabase and register
        organizations for the live list.
      </p>
    </>
  );
}