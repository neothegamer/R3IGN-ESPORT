import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RankingsTable, { type LiveRanking } from "./RankingsTable";

export const metadata = {
  title: "Rankings · R3IGN HQ",
  description:
    "Live R3IGN HQ league standings, win-loss records, and win percentage across RCML, RFCL, and RBSL.",
  openGraph: {
    title: "Rankings · R3IGN HQ",
    description:
      "Live R3IGN HQ league standings, win-loss records, and win percentage across RCML, RFCL, and RBSL.",
    type: "website",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Rankings · R3IGN HQ",
    description:
      "Live R3IGN HQ league standings, win-loss records, and win percentage across RCML, RFCL, and RBSL.",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
};

export default async function RankingsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rankings")
    .select("team_name, tag, league, wins, losses, points");

  const rows: LiveRanking[] = !error && data ? (data as LiveRanking[]) : [];

  return (
    <main id="main-content">
      <div className="page-header">
        <div className="wrap">
          <span className="breadcrumb">
            <Link href="/">Home</Link> / Rankings
          </span>
          <span
            className="eyebrow"
            style={{ marginTop: "1rem", display: "inline-flex" }}
          >
            Live Standings
          </span>
          <h1>Rankings</h1>
          <p>
            Standings update after every reported match. Win percentage is used
            to break ties within a league.
          </p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <RankingsTable rows={rows} live={rows.length > 0} />
        </div>
      </section>
    </main>
  );
}