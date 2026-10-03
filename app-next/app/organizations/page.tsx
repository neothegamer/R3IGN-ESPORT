import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import OrgsGrid, { type OrgRow, type RankingRow } from "./OrgsGrid";

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

export default async function OrganizationsPage() {
  const supabase = await createClient();

  const [orgsRes, rankingsRes] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name, tag, league, division, region")
      .order("name", { ascending: true }),
    supabase
      .from("rankings")
      .select("organization_id, team_name, league, wins, losses, points"),
  ]);

  const orgs: OrgRow[] =
    !orgsRes.error && orgsRes.data ? (orgsRes.data as OrgRow[]) : [];
  const rankings: RankingRow[] =
    !rankingsRes.error && rankingsRes.data
      ? (rankingsRes.data as RankingRow[])
      : [];

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
          <OrgsGrid orgs={orgs} rankings={rankings} live={orgs.length > 0} />

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