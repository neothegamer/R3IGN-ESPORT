import Link from "next/link";

export const metadata = {
  title: "Media · R3IGN HQ",
  description:
    "Brand assets, match highlights, and press resources for R3IGN HQ.",
  openGraph: {
    title: "Media · R3IGN HQ",
    description:
      "Brand assets, match highlights, and press resources for R3IGN HQ.",
    type: "website",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Media · R3IGN HQ",
    description:
      "Brand assets, match highlights, and press resources for R3IGN HQ.",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
};

export default function MediaPage() {
  return (
    <main id="main-content">
      <div className="page-header">
        <div className="wrap">
          <span className="breadcrumb">
            <Link href="/">Home</Link> / Media
          </span>
          <span
            className="eyebrow"
            style={{ marginTop: "1rem", display: "inline-flex" }}
          >
            Press &amp; Brand
          </span>
          <h1>Media</h1>
          <p>
            Brand assets, match highlights, and press resources for creators
            and outlets covering R3IGN.
          </p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="pillars">
            <div className="pillar">
              <div className="num">01</div>
              <h3>Brand Assets</h3>
              <p>
                Logos and color guidelines for creators and partners
                referencing R3IGN in their own content.
              </p>
            </div>
            <div className="pillar">
              <div className="num">02</div>
              <h3>Match Highlights</h3>
              <p>
                Clips and recaps from league matches, published after each
                event.
              </p>
            </div>
            <div className="pillar">
              <div className="num">03</div>
              <h3>Press Contact</h3>
              <p>
                Reach out for interviews, credentials, or coverage requests.
              </p>
            </div>
          </div>
          <div className="center mt-lg">
            <Link href="/support" className="btn btn-primary">
              Contact Media Team
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}