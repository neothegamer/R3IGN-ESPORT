import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Create Account · R3IGN HQ",
  description: "Create your R3IGN HQ account with email or Discord.",
  openGraph: {
    title: "Create Account · R3IGN HQ",
    description: "Create your R3IGN HQ account with email or Discord.",
    type: "website",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Create Account · R3IGN HQ",
    description: "Create your R3IGN HQ account with email or Discord.",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
};

export default function SignUpPage() {
  return (
    <main id="main-content">
      <section className="section-tight">
        <div className="wrap auth-wrap">
          <div className="auth-panel">
            <span className="eyebrow">Join R3IGN HQ</span>
            <h1 style={{ marginTop: "0.75rem" }}>Create Account</h1>
            <p className="lede">
              Create an account to register organizations, list yourself on the
              player market, and track your teams.
            </p>
            <AuthForm mode="signup" />
            <p className="auth-switch">
              Already have an account?{" "}
              <Link href="/signin">Sign in</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
