import Link from "next/link";

export const metadata = {
  title: "Tournament Bracket · R3IGN HQ",
  description: "Live playoff bracket for R3IGN HQ tournaments.",
  openGraph: {
    title: "Tournament Bracket · R3IGN HQ",
    description: "Live playoff bracket for R3IGN HQ tournaments.",
    type: "website",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Tournament Bracket · R3IGN HQ",
    description: "Live playoff bracket for R3IGN HQ tournaments.",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
};

type Match = {
  round_number: number;
  round_name: string;
  match_order: number;
  team_a: string | null;
  team_b: string | null;
  score_a: number | null;
  score_b: number | null;
  winner: "a" | "b" | null;
};

const SAMPLE_BRACKET: Match[] = [
  {
    round_number: 1,
    round_name: "Quarterfinal",
    match_order: 0,
    team_a: "Aether Esports",
    team_b: "Last Watch",
    score_a: 3,
    score_b: 0,
    winner: "a",
  },
  {
    round_number: 1,
    round_name: "Quarterfinal",
    match_order: 1,
    team_a: "Siroxx",
    team_b: "Vortex Squad",
    score_a: 3,
    score_b: 1,
    winner: "a",
  },
  {
    round_number: 1,
    round_name: "Quarterfinal",
    match_order: 2,
    team_a: "Infinite",
    team_b: "Ironclad",
    score_a: 3,
    score_b: 2,
    winner: "a",
  },
  {
    round_number: 1,
    round_name: "Quarterfinal",
    match_order: 3,
    team_a: "Eleventh Order",
    team_b: "Nightshade",
    score_a: 2,
    score_b: 3,
    winner: "b",
  },
  {
    round_number: 2,
    round_name: "Semifinal",
    match_order: 0,
    team_a: "Aether Esports",
    team_b: "Siroxx",
    score_a: null,
    score_b: null,
    winner: null,
  },
  {
    round_number: 2,
    round_name: "Semifinal",
    match_order: 1,
    team_a: "Infinite",
    team_b: "Nightshade",
    score_a: null,
    score_b: null,
    winner: null,
  },
  {
    round_number: 3,
    round_name: "Final",
    match_order: 0,
    team_a: null,
    team_b: null,
    score_a: null,
    score_b: null,
    winner: null,
  },
];

function TeamRow({
  name,
  score,
  isWinner,
  hasResult,
}: {
  name: string | null;
  score: number | null;
  isWinner: boolean;
  hasResult: boolean;
}) {
  return (
    <div className={`bracket-team${isWinner ? " is-winner" : ""}`}>
      <span>{name ? name : <span className="bracket-tbd">TBD</span>}</span>
      {hasResult && (
        <span className="bracket-score">
          {score === null || score === undefined ? "—" : score}
        </span>
      )}
    </div>
  );
}

function MatchCard({ m }: { m: Match }) {
  const hasResult = m.score_a !== null && m.score_a !== undefined;
  return (
    <div className="bracket-match">
      <TeamRow
        name={m.team_a}
        score={m.score_a}
        isWinner={m.winner === "a"}
        hasResult={hasResult}
      />
      <TeamRow
        name={m.team_b}
        score={m.score_b}
        isWinner={m.winner === "b"}
        hasResult={hasResult}
      />
    </div>
  );
}

function Bracket({ matches }: { matches: Match[] }) {
  const rounds: Record<number, { name: string; matches: Match[] }> = {};

  matches.forEach((m) => {
    if (!rounds[m.round_number]) {
      rounds[m.round_number] = { name: m.round_name, matches: [] };
    }
    rounds[m.round_number].matches.push(m);
  });

  const roundNumbers = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);
  const maxRound = roundNumbers[roundNumbers.length - 1];

  return (
    <div className="bracket" id="bracket-root">
      {roundNumbers.map((rn) => {
        const r = rounds[rn];
        r.matches.sort((a, b) => a.match_order - b.match_order);
        const isFinal = rn === maxRound;

        // Group into pairs for clean tree connectors
        const pairs: Match[][] = [];
        for (let i = 0; i < r.matches.length; i += 2) {
          pairs.push(r.matches.slice(i, i + 2));
        }

        return (
          <div
            key={rn}
            className={`bracket-round${isFinal ? " bracket-final" : ""}`}
          >
            <div className="bracket-round-label">
              {r.name || `Round ${rn}`}
            </div>
            <div className="bracket-round-body">
              {pairs.map((pair, pi) => (
                <div
                  key={pi}
                  className={`bracket-pair${pair.length === 1 ? " is-single" : ""}`}
                >
                  {pair.map((m, mi) => (
                    <MatchCard key={mi} m={m} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function BracketsPage() {
  return (
    <main id="main-content">
      <div className="page-header">
        <div className="wrap">
          <span className="breadcrumb">
            <Link href="/">Home</Link> /{" "}
            <Link href="/events">Events</Link> / Bracket
          </span>
          <span
            className="eyebrow"
            style={{ marginTop: "1rem", display: "inline-flex" }}
          >
            Live Tournament
          </span>
          <h1 id="bracket-title">RCML Season 4 Playoffs</h1>
          <p>
            Single-elimination playoff bracket. Winners advance right; the
            final sits on the far right.
          </p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <p
            style={{
              fontFamily: "var(--f-mono)",
              fontSize: "0.78rem",
              color: "var(--steel)",
              marginBottom: "1.25rem",
            }}
            id="bracket-status"
          >
            Showing sample bracket &mdash; connect Supabase and add a
            tournament to go live.
          </p>
          <div className="bracket-scroll">
            <Bracket matches={SAMPLE_BRACKET} />
          </div>
        </div>
      </section>
    </main>
  );
}