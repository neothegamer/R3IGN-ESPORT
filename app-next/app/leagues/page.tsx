import Link from "next/link";
import LeagueFilter from "./LeagueFilter";

export const metadata = {
  title: "Leagues · R3IGN HQ",
  description:
    "Explore R3IGN's mobile esports leagues: RCML (Call of Duty: Mobile), RFCL (Free Fire), and RBSL (Blood Strike).",
  openGraph: {
    title: "Leagues · R3IGN HQ",
    description:
      "Explore R3IGN's mobile esports leagues: RCML (Call of Duty: Mobile), RFCL (Free Fire), and RBSL (Blood Strike).",
    type: "website",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Leagues · R3IGN HQ",
    description:
      "Explore R3IGN's mobile esports leagues: RCML (Call of Duty: Mobile), RFCL (Free Fire), and RBSL (Blood Strike).",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
};

export default function LeaguesPage() {
  return (
    <main id="main-content">
      <div className="page-header">
        <div className="wrap">
          <span className="breadcrumb">
            <Link href="/">Home</Link> / Leagues
          </span>
          <span
            className="eyebrow"
            style={{ marginTop: "1rem", display: "inline-flex" }}
          >
            Competitive Operations
          </span>
          <h1>Leagues</h1>
          <p>
            Every R3IGN HQ league runs on the same standard: structured seasons,
            transparent administration, and a clear path from open registration
            to a crowned champion.
          </p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <LeagueFilter />
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">How It Works</span>
              <h2>From sign-up to season champion</h2>
            </div>
          </div>
          <div className="value-list">
            <div className="value-row">
              <div className="idx">01</div>
              <div>
                <h3>Register your team</h3>
                <p>
                  Submit your roster, captain contact, and league preference
                  through the team registration form.
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">02</div>
              <div>
                <h3>Get placed into a season</h3>
                <p>
                  Teams are seeded into the next available season based on
                  registration date and league capacity.
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">03</div>
              <div>
                <h3>Compete in the regular season</h3>
                <p>
                  Play a full slate of scheduled matches; results feed directly
                  into the live rankings.
                </p>
              </div>
            </div>
            <div className="value-row">
              <div className="idx">04</div>
              <div>
                <h3>Advance to playoffs</h3>
                <p>
                  Top-standing teams advance to single-elimination playoffs to
                  determine the season champion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="cta-band">
        <div className="wrap">
          <h2>Don&rsquo;t see your league yet?</h2>
          <p>
            RFCL and RBSL are opening registration soon. Register your team now
            to be placed as soon as a season opens.
          </p>
          <div className="cta-actions">
            <Link href="/register" className="btn btn-primary">
              Register Your Team
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}