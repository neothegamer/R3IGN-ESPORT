import Link from "next/link";
import OrgsGrid from "./OrgsGrid";

export const metadata = {
  title: "Organizations · R3IGN HQ",
  description:
    "Browse the organizations and rosters competing across R3IGN HQ.",
  openGraph: {
    title: "Organizations · R3IGN HQ",
    description:
      "Browse the organizations and rosters competing across R3IGN HQ.",
    type: "website",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Organizations · R3IGN HQ",
    description:
      "Browse the organizations and rosters competing across R3IGN HQ.",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
};

export default function OrganizationsPage() {
  return (
    <main id="main-content">
      <div className="page-header">
        <div className="wrap">
          <span className="breadcrumb">
            <Link href="/">Home</Link> / Organizations
          </span>
          <span
            className="eyebrow"
            style={{ marginTop: "1rem", display: "inline-flex" }}
          >
            50+ Registered Orgs
          </span>
          <h1>Organizations</h1>
          <p>
            Every organization currently competing across R3IGN HQ leagues.
            Filter by league to see who&rsquo;s fielding a roster, and tap a
            card for the full team profile.
          </p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <OrgsGrid />

          <div
            className="cta-band"
            style={{
              marginTop: "3rem",
              borderLeft: "1px solid var(--line)",
              borderRight: "1px solid var(--line)",
            }}
          >
            <h2>Not on this list yet?</h2>
            <p>
              RFCL and RBSL rosters open once registration begins. Get your org
              in early.
            </p>
            <div className="cta-actions">
              <Link href="/register" className="btn btn-primary">
                Register Your Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}