import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NavAccount from "@/components/NavAccount";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Header accountSlot={<NavAccount />} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
