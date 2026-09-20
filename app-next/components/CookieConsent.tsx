"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "r3ign-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const t = setTimeout(() => setVisible(true), 400);
        return () => clearTimeout(t);
      }
    } catch {
      // storage blocked — show banner
      setVisible(true);
    }
  }, []);

  const decide = (value: "accepted" | "declined") => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={`consent-banner${visible ? " is-visible" : ""}`}
      id="consent-banner"
      role="dialog"
      aria-label="Cookie notice"
    >
      <p>
        We use essential cookies to run this site, plus optional analytics
        cookies to understand traffic. See our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <div className="consent-actions">
        <button
          type="button"
          className="btn btn-ghost"
          id="consent-decline"
          onClick={() => decide("declined")}
        >
          Decline
        </button>
        <button
          type="button"
          className="btn btn-primary"
          id="consent-accept"
          onClick={() => decide("accepted")}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
