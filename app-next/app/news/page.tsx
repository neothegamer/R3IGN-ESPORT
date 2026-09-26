import Link from "next/link";
import NewsGrid from "./NewsGrid";

export const metadata = {
  title: "News · R3IGN HQ",
  description:
    "League updates, match recaps, and announcements from R3IGN HQ Esports.",
  openGraph: {
    title: "News · R3IGN HQ",
    description:
      "League updates, match recaps, and announcements from R3IGN HQ Esports.",
    type: "website",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
  twitter: {
    card: "summary",
    title: "News · R3IGN HQ",
    description:
      "League updates, match recaps, and announcements from R3IGN HQ Esports.",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
};

export default function NewsPage() {
  return (
    <main id="main-content">
      <div className="page-header">
        <div className="wrap">
          <span className="breadcrumb">
            <Link href="/">Home</Link> / News
          </span>
          <span
            className="eyebrow"
            style={{ marginTop: "1rem", display: "inline-flex" }}
          >
            Newsroom
          </span>
          <h1>News</h1>
          <p>
            League updates, match recaps, and announcements from across the
            R3IGN HQ ecosystem.
          </p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <NewsGrid />
        </div>
      </section>
    </main>
  );
}