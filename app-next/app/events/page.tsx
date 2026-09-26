import Link from "next/link";
import EventsClient from "./EventsClient";

export const metadata = {
  title: "Events · R3IGN HQ",
  description:
    "Upcoming R3IGN matches and events — add any date straight to your calendar.",
  openGraph: {
    title: "Events · R3IGN HQ",
    description:
      "Upcoming R3IGN matches and events — add any date straight to your calendar.",
    type: "website",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Events · R3IGN HQ",
    description:
      "Upcoming R3IGN matches and events — add any date straight to your calendar.",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
};

export default function EventsPage() {
  return (
    <main id="main-content">
      <div className="page-header">
        <div className="wrap">
          <span className="breadcrumb">
            <Link href="/">Home</Link> / Events
          </span>
          <span
            className="eyebrow"
            style={{ marginTop: "1rem", display: "inline-flex" }}
          >
            Mark Your Calendar
          </span>
          <h1>Events</h1>
          <p>
            League matches and community events. Tap Add to Calendar to save any
            date straight to your phone or computer.
          </p>
          <div className="cta-actions" style={{ marginTop: "1.25rem" }}>
            <Link href="/brackets" className="btn btn-primary">
              View Tournament Bracket →
            </Link>
          </div>
        </div>
      </div>

      <section className="section-tight">
        <div className="wrap">
          <EventsClient />
        </div>
      </section>
    </main>
  );
}