import Link from "next/link";
import MarketClient from "./MarketClient";

export const metadata = {
  title: "Player Market · R3IGN HQ",
  description:
    "Browse free agents or list yourself as available to join an organization in R3IGN HQ.",
  openGraph: {
    title: "Player Market · R3IGN HQ",
    description:
      "Browse free agents or list yourself as available to join an organization in R3IGN HQ.",
    type: "website",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Player Market · R3IGN HQ",
    description:
      "Browse free agents or list yourself as available to join an organization in R3IGN HQ.",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
};

export default function PlayerMarketPage() {
  return (
    <main id="main-content">
      <div className="page-header">
        <div className="wrap">
          <span className="breadcrumb">
            <Link href="/">Home</Link> / Player Market
          </span>
          <span
            className="eyebrow"
            style={{ marginTop: "1rem", display: "inline-flex" }}
          >
            Free Agents
          </span>
          <h1>Player Market</h1>
          <p>
            Browse free agents looking for a roster, or list yourself as
            available to join an organization.
          </p>
        </div>
      </div>

      <MarketClient />
    </main>
  );
}