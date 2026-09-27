import Link from "next/link";
import HighlightsGrid from "./HighlightsGrid";

export const metadata = {
  title: "Match Highlights · R3IGN HQ",
  description:
    "Watch screen-recorded highlights from R3IGN HQ league matches.",
  openGraph: {
    title: "Match Highlights · R3IGN HQ",
    description:
      "Watch screen-recorded highlights from R3IGN HQ league matches.",
    type: "website",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Match Highlights · R3IGN HQ",
    description:
      "Watch screen-recorded highlights from R3IGN HQ league matches.",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
};

export default function MatchHighlightsPage() {
  return (
    <main id="main-content">
      <div className="page-header">
        <div className="wrap">
          <span className="breadcrumb">
            <Link href="/">Home</Link> / Match Highlights
          </span>
          <span
            className="eyebrow"
            style={{ marginTop: "1rem", display: "inline-flex" }}
          >
            Watch The Plays
          </span>
          <h1>Match Highlights</h1>
          <p>
            Screen-recorded clips from league matches, uploaded by R3IGN HQ
            admins after each session.
          </p>
        </div>
      </div>

      <section className="section-tight">
        <div className="wrap">
          <HighlightsGrid />
        </div>
      </section>
    </main>
  );
}