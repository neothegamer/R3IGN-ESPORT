import Link from "next/link";

export const metadata = {
  title: "Awards · R3IGN HQ",
  description:
    "R3IGN HQ's annual awards and Hall of Champions, recognizing top players and organizations each season.",
  openGraph: {
    title: "Awards · R3IGN HQ",
    description:
      "R3IGN HQ's annual awards and Hall of Champions, recognizing top players and organizations each season.",
    type: "website",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Awards · R3IGN HQ",
    description:
      "R3IGN HQ's annual awards and Hall of Champions, recognizing top players and organizations each season.",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
};

const SAMPLE_WINNERS = [
  { award_label: "MVP", player_name: "Kestrel", context: "RCML S4 · D1 · Aether Esports" },
  { award_label: "MVP", player_name: "Vale", context: "RCML S4 · D2 · Siroxx" },
  { award_label: "MVP", player_name: "Onyx", context: "RCML S3 · D1 · 7SIN Esports" },
  { award_label: "MVP", player_name: "Draft", context: "RCML S3 · D3 · Infinite" },
  { award_label: "MVP", player_name: "Wren", context: "RCML S4 · D4 · Eleventh Order" },
  { award_label: "MVP", player_name: "Halcyon", context: "RCML S4 · D5 · Seven Esports" },
  { award_label: "MVP", player_name: "Nyx", context: "RCML S3 · D2 · Last Watch" },
  { award_label: "MVP", player_name: "Riven", context: "RCML S4 · D3 · Phantom" },
  { award_label: "MVP", player_name: "Solace", context: "RCML S3 · D4 · Apex Unit" },
  { award_label: "MVP", player_name: "Cipher", context: "RCML S4 · D6 · Void Protocol" },
];

export default function AwardsPage() {
  return (
    <main id="main-content">
      <div className="page-header">
        <div className="wrap">
          <span className="breadcrumb">
            <Link href="/">Home</Link> / Awards
          </span>
          <span
            className="eyebrow"
            style={{ marginTop: "1rem", display: "inline-flex" }}
          >
            Annual Recognition
          </span>
          <h1>R3IGN HQ Awards</h1>
          <p>
            Recognizing the players, organizations, and community members
            shaping R3IGN HQ each season.
          </p>
        </div>
      </div>

      <section className="section-tight">
        <div className="wrap">
          <div className="award-grid">
            <div className="award-card">
              <div className="medal">PO</div>
              <h3>Player of the Year</h3>
              <p>Annual Recognition</p>
            </div>
            <div className="award-card">
              <div className="medal">OO</div>
              <h3>Organization of the Year</h3>
              <p>Annual Recognition</p>
            </div>
            <div className="award-card">
              <div className="medal">RO</div>
              <h3>Rookie of the Year</h3>
              <p>Annual Recognition</p>
            </div>
            <div className="award-card">
              <div className="medal">MO</div>
              <h3>MVP of the Year</h3>
              <p>Annual Recognition</p>
            </div>
            <div className="award-card">
              <div className="medal">CL</div>
              <h3>Community Leader</h3>
              <p>Annual Recognition</p>
            </div>
            <div className="award-card">
              <div className="medal">CC</div>
              <h3>Content Creator of the Year</h3>
              <p>Annual Recognition</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Hall of Champions</span>
              <h2>Recent MVPs</h2>
            </div>
          </div>
          <div className="champ-grid" id="champ-grid">
            {SAMPLE_WINNERS.map((w, i) => (
              <div key={i} className="champ-card">
                <div className="tag">{w.award_label}</div>
                <h3>{w.player_name}</h3>
                <p>{w.context}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}