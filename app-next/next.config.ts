import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Old .html pages → clean URLs (308 permanent)
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/leagues.html", destination: "/leagues", permanent: true },
      { source: "/rankings.html", destination: "/rankings", permanent: true },
      { source: "/events.html", destination: "/events", permanent: true },
      { source: "/organizations.html", destination: "/organizations", permanent: true },
      { source: "/player-market.html", destination: "/player-market", permanent: true },
      { source: "/match-highlights.html", destination: "/match-highlights", permanent: true },
      { source: "/news.html", destination: "/news", permanent: true },
      { source: "/about.html", destination: "/about", permanent: true },
      { source: "/support.html", destination: "/support", permanent: true },
      { source: "/signin.html", destination: "/signin", permanent: true },
      { source: "/register.html", destination: "/register", permanent: true },
      { source: "/divisions.html", destination: "/divisions", permanent: true },
      { source: "/brackets.html", destination: "/brackets", permanent: true },
      { source: "/messages.html", destination: "/messages", permanent: true },
      { source: "/awards.html", destination: "/awards", permanent: true },
      { source: "/media.html", destination: "/media", permanent: true },
      { source: "/partnerships.html", destination: "/partnerships", permanent: true },
      { source: "/guide.html", destination: "/guide", permanent: true },
      { source: "/community.html", destination: "/community", permanent: true },
      { source: "/terms.html", destination: "/terms", permanent: true },
      { source: "/privacy.html", destination: "/privacy", permanent: true },
      { source: "/copyright.html", destination: "/copyright", permanent: true },
    ];
  },
};

export default nextConfig;