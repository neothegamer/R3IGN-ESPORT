export const metadata = {
  title: "Partnerships · R3IGN HQ",
  description: "Sponsorship and partnership opportunities with R3IGN HQ.",
};

export default function PartnershipsPage() {
  return (
    <main id="main-content">
      <div className="page-header">
        <div className="wrap">
          <span className="breadcrumb">
            <a href="/">Home</a> / Partnerships
          </span>
          <span
            className="eyebrow"
            style={{ marginTop: "1rem", display: "inline-flex" }}
          >
            Work With R3IGN
          </span>
          <h1>Partnerships</h1>
          <p>
            Connect your brand with a growing mobile esports audience across
            players, organizations, and community leaders.
          </p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="dossier-grid">
            <div className="dossier">
              <div className="dossier-head">
                <span>Tier 01</span>
                <span className="stamp stamp-active">Event Partner</span>
              </div>
              <div className="dossier-body">
                <h3>League Sponsorship</h3>
                <p>
                  Branding across league seasons and marquee event broadcasts.
                </p>
              </div>
            </div>
            <div className="dossier">
              <div className="dossier-head">
                <span>Tier 02</span>
                <span className="stamp stamp-active">Media Partner</span>
              </div>
              <div className="dossier-body">
                <h3>Content &amp; Broadcast</h3>
                <p>
                  Co-branded highlights, recaps, and creator collaborations.
                </p>
              </div>
            </div>
            <div className="dossier">
              <div className="dossier-head">
                <span>Tier 03</span>
                <span className="stamp stamp-active">Community Partner</span>
              </div>
              <div className="dossier-body">
                <h3>Community Programs</h3>
                <p>
                  Giveaways, Discord activations, and player-facing campaigns.
                </p>
              </div>
            </div>
          </div>
          <div className="center mt-lg">
            <a href="/support" className="btn btn-primary">
              Discuss a Partnership
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}