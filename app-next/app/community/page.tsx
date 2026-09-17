export const metadata = {
  title: "Community · R3IGN HQ",
  description:
    "Join R3IGN HQ's Discord, Instagram, TikTok, and Facebook channels for match updates and league chat.",
};

export default function CommunityPage() {
  return (
    <main id="main-content">
      <div className="page-header">
        <div className="wrap">
          <span className="breadcrumb">
            <a href="/">Home</a> / Community
          </span>
          <span className="eyebrow" style={{ marginTop: "1rem", display: "inline-flex" }}>
            Stay Connected
          </span>
          <h1>Community</h1>
          <p>
            Join R3IGN HQ&rsquo;s community channels for match updates, league
            chat, and direct access to support.
          </p>
        </div>
      </div>

      <section className="section-tight">
        <div className="wrap">
          <div className="social-grid">
            <div className="social-card">
              <div>
                <h3>Discord</h3>
                <p>Match updates, league chat, and support</p>
              </div>
              <a
                href="https://discord.gg/85qGDxyCdp"
                className="btn btn-ghost"
                target="_blank"
                rel="noopener"
              >
                Join
              </a>
            </div>
            <div className="social-card">
              <div>
                <h3>Instagram</h3>
                <p>Highlights, graphics, and behind the scenes</p>
              </div>
              <a
                href="https://www.instagram.com/r3ignhq"
                className="btn btn-ghost"
                target="_blank"
                rel="noopener"
              >
                Join
              </a>
            </div>
            <div className="social-card">
              <div>
                <h3>TikTok</h3>
                <p>Short-form highlights and clips</p>
              </div>
              <a
                href="https://www.tiktok.com/@r3ignhq"
                className="btn btn-ghost"
                target="_blank"
                rel="noopener"
              >
                Join
              </a>
            </div>
            <div className="social-card">
              <div>
                <h3>Facebook</h3>
                <p>League announcements and community updates</p>
              </div>
              <a
                href="https://www.facebook.com/share/18zfJRxAJK/"
                className="btn btn-ghost"
                target="_blank"
                rel="noopener"
              >
                Join
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}