import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://r3ignesports.gg";

  const routes = [
    "",
    "/about",
    "/awards",
    "/brackets",
    "/community",
    "/copyright",
    "/divisions",
    "/events",
    "/guide",
    "/leagues",
    "/match-highlights",
    "/media",
    "/merch",
    "/news",
    "/organizations",
    "/partnerships",
    "/player-market",
    "/privacy",
    "/rankings",
    "/register",
    "/signin",
    "/support",
    "/terms",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));
}