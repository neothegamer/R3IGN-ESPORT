"use client";

import Link from "next/link";

type Listing = {
  id: string;
  ign: string;
  role: string;
  notes: string;
  league: string;
  region: string;
};

const SAMPLE: Listing[] = [
  {
    id: "sample-1",
    ign: "Kestrel",
    role: "IGL / Rifler",
    notes: "Looking for a Division 1–3 roster. Available immediately.",
    league: "rcml",
    region: "North America",
  },
  {
    id: "sample-2",
    ign: "Vale",
    role: "Support",
    notes: "Flex support player, prior playoff experience.",
    league: "rcml",
    region: "Europe",
  },
  {
    id: "sample-3",
    ign: "Onyx",
    role: "Entry Fragger",
    notes: "High aggression entry player seeking an active org.",
    league: "rcml",
    region: "Asia Pacific",
  },
  {
    id: "sample-4",
    ign: "Draft",
    role: "Sniper",
    notes: "Looking to join a Division 4–6 roster to build experience.",
    league: "rcml",
    region: "North America",
  },
];

export default function MarketClient() {
  return (
    <>
      <section className="section-tight">
        <div className="wrap">
          <div className="market-grid" id="market-grid">
            {SAMPLE.map((listing) => (
              <div key={listing.id} className="market-card">
                <div className="role">{listing.role}</div>
                <h3>{listing.ign}</h3>
                <p>{listing.notes}</p>
                <div className="market-tags">
                  <span className="market-tag">
                    {(listing.league || "rcml").toUpperCase()}
                  </span>
                  <span className="market-tag">
                    {listing.region || "Region TBD"}
                  </span>
                </div>
                <div className="market-card-foot">
                  <Link href="/signin" className="btn btn-ghost">
                    Sign in to message
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <p
            className="field-hint"
            style={{ marginTop: "1rem", gridColumn: "1 / -1" }}
          >
            Sample listings shown — connect Supabase for live player market
            data.
          </p>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap" style={{ maxWidth: "640px" }}>
          <div className="form-panel">
            <div className="auth-notice" id="mp-config-notice">
              Backend isn&apos;t connected yet. Player market listings and
              submissions will work once Supabase is wired up.
            </div>
            <div className="auth-notice" id="mp-signin-notice">
              <Link href="/signin" style={{ color: "var(--paper)" }}>
                Sign in
              </Link>{" "}
              to list yourself on the player market.
            </div>

            <form
              id="market-form"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <div className="field-row">
                <div className="field">
                  <label htmlFor="mp-name">
                    In-game name <span className="req">*</span>
                  </label>
                  <input type="text" id="mp-name" name="mp-name" required disabled />
                  <div className="field-error">Enter your in-game name.</div>
                </div>
                <div className="field">
                  <label htmlFor="mp-role">
                    Primary role <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="mp-role"
                    name="mp-role"
                    placeholder="e.g. IGL, Support, Sniper"
                    required
                    disabled
                  />
                  <div className="field-error">Enter your primary role.</div>
                </div>
              </div>
              <div className="field">
                <label htmlFor="mp-league">
                  Game <span className="req">*</span>
                </label>
                <select id="mp-league" name="mp-league" required disabled>
                  <option value="">Select a game</option>
                  <option value="rcml">Call of Duty: Mobile (RCML)</option>
                  <option value="rfcl">Free Fire (RFCL)</option>
                  <option value="rbsl">Blood Strike (RBSL)</option>
                </select>
                <div className="field-error">Select which game you play.</div>
              </div>
              <div className="field">
                <label htmlFor="mp-region">Region</label>
                <select id="mp-region" name="mp-region" disabled>
                  <option value="">Select a region</option>
                  <option>North America</option>
                  <option>South America</option>
                  <option>Europe</option>
                  <option>Middle East &amp; Africa</option>
                  <option>Asia Pacific</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="mp-notes">Availability &amp; experience</label>
                <textarea
                  id="mp-notes"
                  name="mp-notes"
                  placeholder="Divisions you're open to, availability, past results"
                  disabled
                />
              </div>
              <div className="field">
                <label htmlFor="mp-file">
                  Upload in-game profile screenshot (optional)
                </label>
                <input type="file" id="mp-file" accept="image/*" disabled />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-block"
                id="mp-submit"
                disabled
              >
                List Yourself
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}