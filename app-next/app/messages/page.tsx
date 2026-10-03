import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import MessagesClient from "./MessagesClient";

export const metadata: Metadata = {
  title: "Messages · R3IGN HQ",
  description: "Message players and organizations directly on R3IGN.",
  robots: { index: false },
  openGraph: {
    title: "Messages · R3IGN HQ",
    description: "Message players and organizations directly on R3IGN.",
    type: "website",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Messages · R3IGN HQ",
    description: "Message players and organizations directly on R3IGN.",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
};

export default function MessagesPage() {
  return (
    <main id="main-content">
      <div className="page-header">
        <div className="wrap">
          <span className="breadcrumb">
            <Link href="/">Home</Link> / Messages
          </span>
          <span
            className="eyebrow"
            style={{ marginTop: "1rem", display: "inline-flex" }}
          >
            Direct Messages
          </span>
          <h1>Messages</h1>
          <p>
            Chat directly with players and organizations you&apos;ve connected
            with through the Player Market.
          </p>
        </div>
      </div>

      <section className="section-tight">
        <div className="wrap">
          <Suspense
            fallback={<p className="field-hint">Loading messages…</p>}
          >
            <MessagesClient />
          </Suspense>
        </div>
      </section>
    </main>
  );
}