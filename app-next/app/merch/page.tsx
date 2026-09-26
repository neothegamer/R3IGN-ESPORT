import Link from "next/link";

export const metadata = {
  title: "Merch · R3IGN HQ",
  description: "Official R3IGN merchandise — coming soon.",
  openGraph: {
    title: "Merch · R3IGN HQ",
    description: "Official R3IGN merchandise — coming soon.",
    type: "website",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Merch · R3IGN HQ",
    description: "Official R3IGN merchandise — coming soon.",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
};

export default function MerchPage() {
  return (
    <main id="main-content">
      <div className="page-header">
        <div className="wrap">
          <span className="breadcrumb">
            <Link href="/">Home</Link> / Merch
          </span>
          <span
            className="eyebrow"
            style={{ marginTop: "1rem", display: "inline-flex" }}
          >
            Coming Soon
          </span>
          <h1>Merch</h1>
          <p>
            Official R3IGN gear is on the way. This page is a placeholder
            &mdash; connect it to a storefront (Shopify, Fourthwall, Printful,
            etc.) when you&rsquo;re ready to sell.
          </p>
        </div>
      </div>

      <section>
        <div className="wrap center">
          <Link href="/community" className="btn btn-primary">
            Get Notified
          </Link>
        </div>
      </section>
    </main>
  );
}