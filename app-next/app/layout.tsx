import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NavAccount from "@/components/NavAccount";
import CookieConsent from "@/components/CookieConsent";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Home · R3IGN HQ",
  description:
    "R3IGN HQ is a competitive mobile esports ecosystem running structured leagues, rankings, and tournaments for players, teams, and communities.",
  openGraph: {
    title: "Home · R3IGN HQ",
    description:
      "R3IGN HQ is a competitive mobile esports ecosystem running structured leagues, rankings, and tournaments for players, teams, and communities.",
    type: "website",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Home · R3IGN HQ",
    description:
      "R3IGN HQ is a competitive mobile esports ecosystem running structured leagues, rankings, and tournaments for players, teams, and communities.",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
  icons: {
    icon: "/assets/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const path = h.get("x-pathname") || h.get("x-url") || "";
  // Fallback: middleware can set x-pathname; also check via next-url if present
  const isAuthPage =
    path.includes("/signin") ||
    path.includes("/signup") ||
    path.includes("/auth/");

  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Header accountSlot={<NavAccount />} />
        {children}
        {!isAuthPage && <Footer />}
        <CookieConsent />
      </body>
    </html>
  );
}
