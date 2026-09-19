import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Register Your Team · R3IGN HQ",
  description: "Submit your roster for placement in an R3IGN mobile esports league.",
  openGraph: {
    title: "Register Your Team · R3IGN HQ",
    description: "Submit your roster for placement in an R3IGN mobile esports league.",
    type: "website",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Register Your Team · R3IGN HQ",
    description: "Submit your roster for placement in an R3IGN mobile esports league.",
    images: ["/assets/r3ign-logo-256.jpg"],
  },
};

export default function RegisterPage() {
  return (
    <main id="main-content">
      <section className="section-tight">
        <div className="wrap auth-wrap">
          <div className="auth-panel">
            <span className="eyebrow">Team Registration</span>
            <h1 style={{ marginTop: "0.75rem" }}>Register Your Team</h1>
            <p className="lede">
              Submit your roster for placement in an R3IGN mobile esports league. A staff member will review and follow up.
            </p>
            <RegisterForm />
          </div>
        </div>
      </section>
    </main>
  );
}