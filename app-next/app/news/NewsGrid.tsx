"use client";

import { useState } from "react";

type NewsPost = {
  id: string;
  title: string;
  category: string;
  body: string;
  created_at: string;
};

const CATEGORY_TAG: Record<string, string> = {
  "League Update": "update",
  "Match Recap": "recap",
  Announcement: "announcement",
  Community: "community",
};

const SAMPLE_NEWS: NewsPost[] = [
  {
    id: "sample-1",
    title: "RCML Season 4 enters its final stretch",
    category: "League Update",
    body: "A legendary season filled with intense battles and unforgettable moments.",
    created_at: "2026-05-28T00:00:00Z",
  },
  {
    id: "sample-2",
    title: "RFCL registration window opens next month",
    category: "Announcement",
    body: "A legendary season filled with intense battles and unforgettable moments.",
    created_at: "2026-05-28T00:00:00Z",
  },
  {
    id: "sample-3",
    title: "Aether Esports edges Siroxx in a top-of-table clash",
    category: "Match Recap",
    body: "A legendary season filled with intense battles and unforgettable moments.",
    created_at: "2026-05-28T00:00:00Z",
  },
  {
    id: "sample-4",
    title: "Player pool crosses 1,500 across 50+ teams",
    category: "Community",
    body: "A legendary season filled with intense battles and unforgettable moments.",
    created_at: "2026-05-28T00:00:00Z",
  },
  {
    id: "sample-5",
    title: "7SIN Esports crowned RCML Season 3 champion",
    category: "Match Recap",
    body: "A legendary season filled with intense battles and unforgettable moments.",
    created_at: "2026-03-12T00:00:00Z",
  },
  {
    id: "sample-6",
    title: "RBSL format and rules revealed",
    category: "Announcement",
    body: "A legendary season filled with intense battles and unforgettable moments.",
    created_at: "2026-02-20T00:00:00Z",
  },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function excerpt(body: string) {
  const text = body.replace(/\s+/g, " ").trim();
  return text.length > 140 ? text.slice(0, 140).trim() + "…" : text;
}

export default function NewsGrid() {
  const [filter, setFilter] = useState("all");

  const visible = SAMPLE_NEWS.filter((post) => {
    if (filter === "all") return true;
    return CATEGORY_TAG[post.category] === filter;
  });

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
          aria-pressed={filter === "update"}
          onClick={() => setFilter("update")}
        >
          League Update
        </button>
        <button
          className="filter-chip"
          aria-pressed={filter === "recap"}
          onClick={() => setFilter("recap")}
        >
          Match Recap
        </button>
        <button
          className="filter-chip"
          aria-pressed={filter === "announcement"}
          onClick={() => setFilter("announcement")}
        >
          Announcement
        </button>
        <button
          className="filter-chip"
          aria-pressed={filter === "community"}
          onClick={() => setFilter("community")}
        >
          Community
        </button>
      </div>

      {visible.length === 0 && (
        <p className="empty-state">No stories match that filter.</p>
      )}

      <div className="news-grid">
        {visible.map((post) => (
          <div key={post.id} className="news-card news-item">
            <div className="news-thumb">
              <span className="eyebrow">{post.category}</span>
            </div>
            <div className="news-body">
              <span className="eyebrow">News</span>
              <h3>{post.title}</h3>
              <p>{excerpt(post.body)}</p>
              <div className="news-foot">
                <span>{fmtDate(post.created_at)}</span>
                {/* Sample posts hide "Read More" — real posts will link to detail later */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}