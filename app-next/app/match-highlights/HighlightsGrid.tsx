"use client";

import { useState } from "react";

type Highlight = {
  title: string;
  description: string;
  league: string;
  match_label: string;
  video_url: string;
  created_at: string;
};

const SAMPLE: Highlight[] = [
  {
    title: "Aether Esports clutch triple in Division 1 final",
    description:
      "The last-round push that sealed the RCML Season 4 Division 1 title.",
    league: "rcml",
    match_label: "RCML S4 · Division 1 · Grand Final",
    video_url: "",
    created_at: "2026-03-15T12:00:00.000Z",
  },
  {
    title: "RFCL opening week — top frag of the night",
    description: "Vanta's 24-kill run from RFCL's opening week.",
    league: "rfcl",
    match_label: "RFCL S1 · Week 1",
    video_url: "",
    created_at: "2026-03-14T12:00:00.000Z",
  },
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function ShareButton({ h }: { h: Highlight }) {
  const [label, setLabel] = useState("Share");

  async function handleShare() {
    const shareData = {
      title: h.title || "R3IGN Match Highlight",
      text: h.description || "Check out this match highlight on R3IGN.",
      url: h.video_url || (typeof window !== "undefined" ? window.location.href : ""),
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // cancelled or failed — fall through to clipboard
      }
    }

    const url = shareData.url || window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setLabel("Link copied");
      setTimeout(() => setLabel("Share"), 1800);
    } catch {
      setLabel("Share");
    }
  }

  return (
    <button
      type="button"
      className="btn btn-ghost share-btn"
      style={{ padding: "0.3em 0.6em", fontSize: "0.7rem" }}
      title="Share this highlight"
      onClick={handleShare}
    >
      {label}
    </button>
  );
}

export default function HighlightsGrid() {
  const [filter, setFilter] = useState("all");

  const visible =
    filter === "all" ? SAMPLE : SAMPLE.filter((h) => h.league === filter);

  return (
    <>
      <div className="filter-bar">
        {(["all", "rcml", "rfcl", "rbsl"] as const).map((v) => (
          <button
            key={v}
            className="filter-chip"
            aria-pressed={filter === v}
            onClick={() => setFilter(v)}
          >
            {v === "all" ? "All" : v.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="news-grid" id="highlights-grid">
        {visible.length === 0 ? (
          <p
            className="field-hint center empty-state"
            style={{ marginTop: "1.5rem" }}
          >
            No highlights posted yet — check back after the next match.
          </p>
        ) : (
          <>
            {visible.map((h, i) => (
              <div
                key={i}
                className="news-card highlight-card"
                data-tags={h.league}
              >
                <div className="news-thumb">
                  <span className="eyebrow">No Video Yet</span>
                </div>
                <div className="news-body">
                  <span className="eyebrow">{h.match_label}</span>
                  <h3>{h.title}</h3>
                  <p>{h.description}</p>
                  <div className="news-foot">
                    <span>{formatDate(h.created_at)}</span>
                    <ShareButton h={h} />
                  </div>
                </div>
              </div>
            ))}
            <p className="field-hint" style={{ gridColumn: "1 / -1" }}>
              Sample highlights shown — admins can upload real clips from the
              Admin page.
            </p>
          </>
        )}
      </div>
    </>
  );
}