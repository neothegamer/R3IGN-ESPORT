import Link from "next/link";

export default function HomePage() {
  return (
    <main id="main-content">
      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-frame">
            <span className="eyebrow">R3IGN HQ</span>
            <h1>
              WE ARE COMPETITORS.
              <br />
              WE ARE CHAMPIONS.
              <br />
              <span className="fade-accent">WE ARE R3IGN.</span>
            </h1>
            <p className="hero-copy">
              Building the future of mobile esports through structured leagues,
              elite competition, and thriving gaming communities.
            </p>
            <div className="hero-actions">
              <Link href="/leagues" className="btn btn-primary">
                View The League
              </Link>
              <Link href="/register" className="btn">
                Register Your Team
              </Link>
            </div>
          </div>
          <div className="ink-stamp hero-stamp" aria-hidden="true">
            <b>R3IGN</b>OFFICIAL
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="redaction-rule">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* STAT STRIP */}
      <div className="wrap">
        <div className="stat-strip">
          <div className="stat">
            <div className="num">1.5K+</div>
            <div className="lbl">Players</div>
          </div>
          <div className="stat">
            <div className="num">50+</div>
            <div className="lbl">Teams</div>
          </div>
          <div className="stat">
            <div className="num">3</div>
            <div className="lbl">League Titles</div>
          </div>
          <div className="stat">
            <div className="num">99.9%</div>
            <div className="lbl">Competitive</div>
          </div>
        </div>
      </div>

      {/* WHAT IS R3IGN */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">What Is R3IGN?</span>
              <h2>
                More than leagues.
                <br />
                We build legacies.
              </h2>
            </div>
            <p className="lede">
              R3IGN HQ is a competitive esports ecosystem designed to provide
              professional league operations, rankings, tournaments, media
              exposure, and growth opportunities for players, teams,
              organizations, and gaming communities. Our mission is to
              establish a trusted competitive environment where talent is
              discovered, competition thrives, and champions are crowned.
            </p>
          </div>
          <div className="pillars">
            <div className="pillar">
              <div className="num">01</div>
              <h3>Community</h3>
              <p>
                Join a growing network of players, teams, and competitive
                communities.
              </p>
            </div>
            <div className="pillar">
              <div className="num">02</div>
              <h3>Fair Competition</h3>
              <p>
                Clear rules, transparent administration, and unbiased
                decision-making.
              </p>
            </div>
            <div className="pillar">
              <div className="num">03</div>
              <h3>Rankings</h3>
              <p>
                Track team and player performance with accurate competitive
                rankings.
              </p>
            </div>
          </div>
          <div className="center mt-lg">
            <Link href="/about" className="btn btn-ghost">
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>

      {/* SUPPORTED GAMES */}
      <section className="section-tight">
        <div className="wrap">
          <span className="eyebrow">Supported Games</span>
          <div className="games-strip mt-lg" style={{ marginTop: "1.5rem" }}>
            <div className="game-tile">
              <img
                src="/assets/games/call-of-duty-mobile.jpg"
                alt="Call of Duty: Mobile"
                loading="lazy"
              />
              <span>
                Call of&nbsp;Duty:
                <br />
                Mobile
              </span>
            </div>
            <div className="game-tile">
              <img
                src="/assets/games/free-fire.jpg"
                alt="Free Fire"
                loading="lazy"
              />
              <span>Free Fire</span>
            </div>
            <div className="game-tile">
              <img
                src="/assets/games/blood-strike.jpg"
                alt="Blood Strike"
                loading="lazy"
              />
              <span>Blood Strike</span>
            </div>
            <div className="game-tile" style={{ color: "var(--steel)" }}>
              <img
                src="/assets/games/pubg-mobile.jpg"
                alt="PUBG Mobile"
                loading="lazy"
              />
              <span>
                PUBG&nbsp;Mobile
                <br />
                <span style={{ fontSize: "0.6rem" }}>Coming Soon</span>
              </span>
            </div>
            <div className="game-tile" style={{ color: "var(--steel)" }}>
              <img
                src="/assets/games/mobile-legends.jpg"
                alt="Mobile Legends: Bang Bang"
                loading="lazy"
              />
              <span>
                Mobile Legends:
                <br />
                Bang Bang
                <br />
                <span style={{ fontSize: "0.6rem" }}>Coming Soon</span>
              </span>
            </div>
            <div className="game-tile" style={{ color: "var(--steel)" }}>
              <img
                src="/assets/games/arena-of-valor.jpg"
                alt="Arena of Valor"
                loading="lazy"
              />
              <span>
                Arena of&nbsp;Valor
                <br />
                <span style={{ fontSize: "0.6rem" }}>Coming Soon</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* LEAGUE TITLES */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Our League Titles</span>
              <h2>Active operations</h2>
            </div>
            <Link href="/leagues" className="btn btn-ghost">
              View All Leagues
            </Link>
          </div>
          <div className="dossier-grid">
            <div className="dossier">
              <div className="dossier-head">
                <span>RCML</span>
                <span className="stamp stamp-live">Active</span>
              </div>
              <div className="dossier-body">
                <h3>R3IGN COD:Mobile Multiplayer League</h3>
                <p>Competitive 5v5 Call of Duty Mobile Multiplayer.</p>
              </div>
              <div className="dossier-foot">
                <span>Season 4</span>
                <Link href="/leagues">View League →</Link>
              </div>
            </div>
            <div className="dossier">
              <div className="dossier-head">
                <span>RFCL</span>
                <span className="stamp stamp-soon">Coming Soon</span>
              </div>
              <div className="dossier-body">
                <h3>R3IGN Free Fire Clash Squad League</h3>
                <p>Competitive Free Fire Clash Squad operations.</p>
                <div
                  className="countdown-inline"
                  data-countdown="2026-10-15T00:00:00"
                  data-countdown-label="Registration opens in"
                ></div>
              </div>
              <div className="dossier-foot">
                <span>Season TBA</span>
                <Link href="/leagues">View League →</Link>
              </div>
            </div>
            <div className="dossier">
              <div className="dossier-head">
                <span>RBSL</span>
                <span className="stamp stamp-soon">Coming Soon</span>
              </div>
              <div className="dossier-body">
                <h3>R3IGN Blood Strike Squad Fight League</h3>
                <p>Competitive Blood Strike Squad Fight operations.</p>
                <div
                  className="countdown-inline"
                  data-countdown="2026-11-01T00:00:00"
                  data-countdown-label="Registration opens in"
                ></div>
              </div>
              <div className="dossier-foot">
                <span>Season TBA</span>
                <Link href="/leagues">View League →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED TEAMS */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Featured Teams</span>
              <h2>Leading the standings</h2>
            </div>
            <Link href="/organizations" className="btn btn-ghost">
              View All Organizations
            </Link>
          </div>
          <div className="team-grid">
            <div className="team-card">
              <div className="team-rank">RCML · #1</div>
              <div className="team-badge">AE</div>
              <h3>Aether Esports</h3>
              <div className="team-meta">
                <span>W10–L1</span>
                <span>90.9%</span>
              </div>
              <div className="win-bar">
                <span style={{ width: "90.9%" }}></span>
              </div>
            </div>
            <div className="team-card">
              <div className="team-rank">RCML · #2</div>
              <div className="team-badge">SX</div>
              <h3>Siroxx</h3>
              <div className="team-meta">
                <span>W10–L1</span>
                <span>90.9%</span>
              </div>
              <div className="win-bar">
                <span style={{ width: "90.9%" }}></span>
              </div>
            </div>
            <div className="team-card">
              <div className="team-rank">RCML · #3</div>
              <div className="team-badge">IN</div>
              <h3>Infinite</h3>
              <div className="team-meta">
                <span>W9–L2</span>
                <span>81.8%</span>
              </div>
              <div className="win-bar">
                <span style={{ width: "81.8%" }}></span>
              </div>
            </div>
            <div className="team-card">
              <div className="team-rank">RCML · #4</div>
              <div className="team-badge">EO</div>
              <h3>Eleventh Order</h3>
              <div className="team-meta">
                <span>W8–L3</span>
                <span>72.7%</span>
              </div>
              <div className="win-bar">
                <span style={{ width: "72.7%" }}></span>
              </div>
            </div>
            <div className="team-card">
              <div className="team-rank">RCML · #5</div>
              <div className="team-badge">SE</div>
              <h3>Seven Esports</h3>
              <div className="team-meta">
                <span>W7–L4</span>
                <span>63.6%</span>
              </div>
              <div className="win-bar">
                <span style={{ width: "63.6%" }}></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED NEWS */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Featured News</span>
              <h2>From the newsroom</h2>
            </div>
            <Link href="/news" className="btn btn-ghost">
              View All News
            </Link>
          </div>
          <div className="news-grid">
            <div className="news-card">
              <div className="news-thumb">
                <span className="eyebrow">League Update</span>
              </div>
              <div className="news-body">
                <span className="eyebrow">News</span>
                <h3>RCML Season 4 enters its final stretch</h3>
                <p>
                  A legendary season filled with intense battles and
                  unforgettable moments.
                </p>
                <div className="news-foot">
                  <span>May 28, 2026</span>
                  <Link href="/news">Read More →</Link>
                </div>
              </div>
            </div>
            <div className="news-card">
              <div className="news-thumb">
                <span className="eyebrow">Announcement</span>
              </div>
              <div className="news-body">
                <span className="eyebrow">News</span>
                <h3>RFCL registration window opens next month</h3>
                <p>
                  A legendary season filled with intense battles and
                  unforgettable moments.
                </p>
                <div className="news-foot">
                  <span>May 28, 2026</span>
                  <Link href="/news">Read More →</Link>
                </div>
              </div>
            </div>
            <div className="news-card">
              <div className="news-thumb">
                <span className="eyebrow">Match Recap</span>
              </div>
              <div className="news-body">
                <span className="eyebrow">News</span>
                <h3>Aether Esports edges Siroxx in a top-of-table clash</h3>
                <p>
                  A legendary season filled with intense battles and
                  unforgettable moments.
                </p>
                <div className="news-foot">
                  <span>May 28, 2026</span>
                  <Link href="/news">Read More →</Link>
                </div>
              </div>
            </div>
            <div className="news-card">
              <div className="news-thumb">
                <span className="eyebrow">Community</span>
              </div>
              <div className="news-body">
                <span className="eyebrow">News</span>
                <h3>Player pool crosses 1,500 across 50+ teams</h3>
                <p>
                  A legendary season filled with intense battles and
                  unforgettable moments.
                </p>
                <div className="news-foot">
                  <span>May 28, 2026</span>
                  <Link href="/news">Read More →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEAGUE · CHAMPIONS */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">League · Champions</span>
              <h2>Honoring the champions</h2>
            </div>
            <p className="lede">
              Honoring the champions who have risen, dominated, and left their
              mark in R3IGN HQ.
            </p>
          </div>
          <div className="champions-rail">
            <div className="champion-card">
              <div className="season">RCML · Season 3</div>
              <div className="title">Champion</div>
              <h3>7SIN Esports</h3>
              <div className="date">March 2026</div>
            </div>
            <div className="champion-card">
              <div className="season">RCML · Season 4</div>
              <div className="title">Champion</div>
              <h3>Aether Esports</h3>
              <div className="date">June 2026</div>
            </div>
            <div className="champion-card">
              <div className="season">RFCL · Season 1</div>
              <div className="title">Champion</div>
              <h3>To Be Determined</h3>
              <div className="date">Season not yet started</div>
            </div>
            <div className="champion-card">
              <div className="season">RBSL · Season 1</div>
              <div className="title">Champion</div>
              <h3>To Be Determined</h3>
              <div className="date">Season not yet started</div>
            </div>
          </div>
        </div>
      </section>

      {/* MORE FROM R3IGN */}
      <section className="section-tight">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">More From R3IGN</span>
              <h2>Explore the ecosystem</h2>
            </div>
          </div>
          <div className="dossier-grid">
            <div className="dossier">
              <div className="dossier-head">
                <span>Divisions</span>
              </div>
              <div className="dossier-body">
                <h3>Six-division ladder</h3>
                <p>Promotion &amp; relegation across every RCML tier.</p>
              </div>
              <div className="dossier-foot">
                <span>&nbsp;</span>
                <Link href="/divisions">View Ladder →</Link>
              </div>
            </div>
            <div className="dossier">
              <div className="dossier-head">
                <span>Player Market</span>
              </div>
              <div className="dossier-body">
                <h3>Find a roster spot</h3>
                <p>Browse free agents or list yourself as available.</p>
              </div>
              <div className="dossier-foot">
                <span>&nbsp;</span>
                <Link href="/player-market">Browse Market →</Link>
              </div>
            </div>
            <div className="dossier">
              <div className="dossier-head">
                <span>Awards</span>
              </div>
              <div className="dossier-body">
                <h3>Hall of Champions</h3>
                <p>Season MVPs and annual recognition.</p>
              </div>
              <div className="dossier-foot">
                <span>&nbsp;</span>
                <Link href="/awards">View Awards →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="section-tight">
        <div className="wrap" style={{ maxWidth: 560, textAlign: "center" }}>
          <span className="eyebrow" style={{ justifyContent: "center" }}>
            Stay in the loop
          </span>
          <h2 style={{ marginTop: "0.75rem" }}>
            League updates &amp; registration windows
          </h2>
          <p className="lede">
            Get notified when RFCL / RBSL registration opens and when major
            RCML announcements drop.
          </p>

          <div
            id="newsletter-success"
            className="form-success"
            role="status"
            style={{ marginTop: "1.25rem" }}
          >
            You&rsquo;re on the list. Watch your inbox for league news.
          </div>
          <div
            id="newsletter-error"
            className="auth-error"
            style={{ marginTop: "1rem" }}
          ></div>

          <form
            id="newsletter-form"
            style={{
              marginTop: "1.5rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.65rem",
              justifyContent: "center",
              alignItems: "stretch",
              maxWidth: 420,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {/* Honeypot */}
            <div
              style={{
                position: "absolute",
                left: "-9999px",
                opacity: 0,
                height: 0,
                overflow: "hidden",
              }}
              aria-hidden="true"
            >
              <label htmlFor="newsletter-website">Website</label>
              <input
                type="text"
                id="newsletter-website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <label htmlFor="newsletter-email" className="visually-hidden">
              Email
            </label>
            <input
              type="email"
              id="newsletter-email"
              name="email"
              required
              placeholder="you@email.com"
              autoComplete="email"
              style={{
                flex: "1 1 200px",
                minWidth: 0,
                margin: 0,
                boxSizing: "border-box",
                background: "var(--panel)",
                border: "1px solid var(--line)",
                color: "var(--paper)",
                padding: "0.9em 1em",
                fontFamily: "var(--f-body)",
                fontSize: "0.95rem",
                lineHeight: 1.25,
                height: "auto",
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              id="newsletter-submit"
              style={{
                alignSelf: "stretch",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                padding: "0.9em 1.5em",
              }}
            >
              Subscribe
            </button>
          </form>
          <p className="field-hint" style={{ marginTop: "0.75rem" }}>
            No spam. Unsubscribe any time. See our{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </section>

      {/* CTA BAND */}
      <div className="cta-band">
        <div className="wrap">
          <span className="eyebrow" style={{ justifyContent: "center" }}>
            Enlist Your Roster
          </span>
          <h2 className="mt-lg" style={{ marginTop: "1rem" }}>
            Ready to compete?
          </h2>
          <p>
            Register your team, get placed into a league, and start climbing
            the R3IGN HQ rankings.
          </p>
          <div className="cta-actions">
            <Link href="/register" className="btn btn-primary">
              Register Your Team
            </Link>
            <Link href="/support" className="btn btn-ghost">
              Talk To Support
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}