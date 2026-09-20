"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type SearchItem = {
  title: string;
  url: string;
  description: string;
  category: string;
};

const SEARCH_INDEX: SearchItem[] = [
  { title: "Home", url: "/", description: "R3IGN mobile esports competition, leagues, events, and community.", category: "Page" },
  { title: "Leagues", url: "/leagues", description: "RCML, RFCL, and RBSL league formats, seasons, and competition.", category: "Page" },
  { title: "Rankings", url: "/rankings", description: "Current team standings, divisions, wins, losses, and points.", category: "Page" },
  { title: "Events", url: "/events", description: "Upcoming match nights, tournaments, and R3IGN league events.", category: "Page" },
  { title: "Organizations", url: "/organizations", description: "Browse registered R3IGN esports organizations and teams.", category: "Page" },
  { title: "Player Market", url: "/player-market", description: "Find free agents and list yourself for esports opportunities.", category: "Page" },
  { title: "Match Highlights", url: "/match-highlights", description: "Watch match footage, highlights, and standout plays.", category: "Page" },
  { title: "News", url: "/news", description: "R3IGN announcements, results, and community news.", category: "Page" },
  { title: "About", url: "/about", description: "About R3IGN HQ mission, structure, and competitive ecosystem.", category: "Page" },
  { title: "Support", url: "/support", description: "FAQ, help, and contact for R3IGN HQ.", category: "Page" },
  { title: "Sign In", url: "/signin", description: "Sign in to your R3IGN HQ account.", category: "Page" },
  { title: "Create Account", url: "/signup", description: "Create a R3IGN HQ account.", category: "Page" },
  { title: "Register Organization", url: "/register", description: "Submit your team for league placement.", category: "Page" },
  { title: "Guide", url: "/guide", description: "Getting started with R3IGN HQ.", category: "Page" },
  { title: "Community", url: "/community", description: "Community channels and Discord.", category: "Page" },
  { title: "Terms", url: "/terms", description: "Terms and Conditions.", category: "Page" },
  { title: "Privacy", url: "/privacy", description: "Privacy Policy.", category: "Page" },
];

export default function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return SEARCH_INDEX.slice(0, 8);
    return SEARCH_INDEX.filter((item) => {
      const text = (item.title + " " + item.description).toLowerCase();
      return terms.some((t) => text.includes(t));
    }).slice(0, 8);
  }, [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(-1);
    document.body.classList.remove("search-is-open");
  }, []);

  const openSearch = useCallback(() => {
    setOpen(true);
    document.body.classList.add("search-is-open");
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      }
      if (e.key === "Escape" && open) close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, openSearch, close]);

  return (
    <>
      <button
        type="button"
        className="search-trigger"
        aria-label="Search"
        title="Search (Ctrl+K)"
        onClick={openSearch}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      </button>

      {open && (
        <div
          className="search-overlay is-open"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="search-modal" role="dialog" aria-label="Site search">
            <div className="search-input-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
              <input
                ref={inputRef}
                type="search"
                placeholder="Search pages…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSelectedIndex((i) => Math.min(i + 1, matches.length - 1));
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSelectedIndex((i) => Math.max(i - 1, 0));
                  }
                  if (e.key === "Enter" && matches[selectedIndex >= 0 ? selectedIndex : 0]) {
                    window.location.href = matches[selectedIndex >= 0 ? selectedIndex : 0].url;
                  }
                }}
              />
              <kbd className="search-kbd">Esc</kbd>
              <button type="button" className="search-close" aria-label="Close search" onClick={close}>
                ×
              </button>
            </div>
            <div className="search-results" role="listbox">
              {!matches.length ? (
                <div className="search-empty">
                  No results found. Try searching for &apos;RCML&apos;, &apos;rankings&apos;, or &apos;news&apos;.
                </div>
              ) : (
                matches.map((item, index) => (
                  <Link
                    key={item.url}
                    href={item.url}
                    className={`search-result${index === selectedIndex ? " is-active" : ""}`}
                    onClick={close}
                  >
                    <span className="r-title">{item.title}</span>
                    <span className="r-meta">{item.description}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
