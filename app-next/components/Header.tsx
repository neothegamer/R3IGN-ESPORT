"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, type ReactNode } from "react";

type Props = {
  /** Server-rendered account area — avoids client flash */
  accountSlot: ReactNode;
};

export default function Header({ accountSlot }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const header = document.querySelector(".site-header") as HTMLElement;
    if (!header) return;
    const sync = () => {
      document.documentElement.style.setProperty(
        "--header-h",
        `${header.offsetHeight}px`
      );
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="site-header">
      <div className="wrap nav">
        <Link href="/" className="brand" aria-label="R3IGN HQ">
          <img
            src="/assets/r3ign-logo-256.jpg"
            alt=""
            className="brand-mark"
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
          <span className="brand-text">
            <span className="brand-name">R3IGN HQ</span>
            <span className="brand-tagline">League and competitive esports</span>
          </span>
        </Link>

        <nav aria-label="Primary">
          <ul className={`nav-links ${menuOpen ? "is-open" : ""}`} id="nav-links">
            <li>
              <Link href="/" aria-current={isActive("/") ? "page" : undefined}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/leagues" aria-current={isActive("/leagues") ? "page" : undefined}>
                Leagues
              </Link>
            </li>
            <li>
              <Link href="/rankings" aria-current={isActive("/rankings") ? "page" : undefined}>
                Rankings
              </Link>
            </li>
            <li>
              <Link href="/events" aria-current={isActive("/events") ? "page" : undefined}>
                Events
              </Link>
            </li>
            <li>
              <Link href="/organizations" aria-current={isActive("/organizations") ? "page" : undefined}>
                Organizations
              </Link>
            </li>
            <li>
              <Link href="/player-market" aria-current={isActive("/player-market") ? "page" : undefined}>
                Player Market
              </Link>
            </li>
            <li>
              <Link href="/match-highlights" aria-current={isActive("/match-highlights") ? "page" : undefined}>
                Highlights
              </Link>
            </li>
            <li>
              <Link href="/news" aria-current={isActive("/news") ? "page" : undefined}>
                News
              </Link>
            </li>
            <li>
              <Link href="/about" aria-current={isActive("/about") ? "page" : undefined}>
                About
              </Link>
            </li>
            <li>
              <Link href="/support" aria-current={isActive("/support") ? "page" : undefined}>
                Support
              </Link>
            </li>
            <li className="nav-links-signin">
              <Link href="/signin">Sign In</Link>
            </li>
          </ul>
        </nav>

        <div className="nav-cta">
          {accountSlot}
          <button
            className="nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="nav-links"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
          </button>
        </div>
      </div>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          <span>RCML SEASON 4 — DIVISION 1 IN PROGRESS</span>
          <span>RFCL — REGISTRATION OPENING SOON</span>
          <span>RBSL — REGISTRATION OPENING SOON</span>
          <span>1,500+ PLAYERS ACROSS 50+ ORGANIZATIONS</span>
          <span>RCML SEASON 4 — DIVISION 1 IN PROGRESS</span>
          <span>RFCL — REGISTRATION OPENING SOON</span>
          <span>RBSL — REGISTRATION OPENING SOON</span>
          <span>1,500+ PLAYERS ACROSS 50+ ORGANIZATIONS</span>
        </div>
      </div>
    </header>
  );
}
