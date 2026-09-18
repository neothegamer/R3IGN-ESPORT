import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Sign In · R3IGN HQ",
  description: "Sign in to your R3IGN HQ account with email or Discord.",
  openGraph: {
    title: "Sign In · R3IGN HQ",
    description: "Sign in to your R3IGN HQ account with email or Discord.",
    type: "website",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Sign In · R3IGN HQ",
    description: "Sign in to your R3IGN HQ account with email or Discord.",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
};

export default function SignInPage() {
  return (
    <main id="main-content">
      <section className="section-tight">
        <div className="wrap auth-wrap">
          <div className="auth-panel">
            <span className="eyebrow">Welcome Back</span>
            <h1 style={{ marginTop: "0.75rem" }}>Sign In</h1>
            <p className="lede">
              Sign in to manage your organization, roster, and player market
              listings.
            </p>
            <AuthForm mode="signin" />
            <p className="auth-switch">
              Don&apos;t have an account?{" "}
              <Link href="/signup">Create one</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
