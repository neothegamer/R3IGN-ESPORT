"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AuthFormProps = {
  mode: "signin" | "signup";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!termsAccepted) {
      setError("You must accept the Terms & Conditions before continuing.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || "" },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;
        setMessage("Check your email for the confirmation link.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscord = async () => {
    if (!termsAccepted) {
      setError("Accept the Terms & Conditions before continuing with social sign-in.");
      return;
    }
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleTikTok = () => {
    if (!termsAccepted) {
      setError("Accept the Terms & Conditions before continuing with social sign-in.");
      return;
    }
    // Matches the original Edge Function flow
    window.location.href =
      "https://nyditfrfzarntmekcyli.supabase.co/functions/v1/tiktok-login-start";
  };

  return (
    <>
      {error && <div className="auth-error is-visible">{error}</div>}
      {message && <div className="auth-success is-visible">{message}</div>}

      <form onSubmit={handleSubmit} noValidate>
        {mode === "signup" && (
          <div className="field">
            <label htmlFor="display-name">
              Display Name <span className="req">*</span>
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
        )}

        <div className="field">
          <label htmlFor="email">
            Email <span className="req">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label htmlFor="password">
            Password <span className="req">*</span>
          </label>
          <div className="password-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder={mode === "signin" ? "Enter your password" : undefined}
            />
            <button
              type="button"
              className="password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {mode === "signin" && (
          <p style={{ margin: "-0.35rem 0 1rem", textAlign: "right", fontSize: "0.82rem" }}>
            <Link href="/signin?reset=1" className="link-btn">
              Forgot password?
            </Link>
          </p>
        )}

        <div className="field checkbox-field">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
          />
          <label htmlFor="terms">
            I agree to the{" "}
            <Link href="/terms" target="_blank" rel="noopener">
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" target="_blank" rel="noopener">
              Privacy Policy
            </Link>{" "}
            before continuing.
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : mode === "signin"
            ? "Sign In"
            : "Create Account"}
        </button>
      </form>

      <div className="auth-divider">or continue with</div>

      <div className="oauth-group oauth-icons">
        <button
          type="button"
          className="btn-oauth-icon"
          onClick={handleDiscord}
          disabled={loading}
          aria-label="Continue with Discord"
          title="Continue with Discord"
        >
          Discord
        </button>
        <button
          type="button"
          className="btn-oauth-icon"
          onClick={handleTikTok}
          disabled={loading}
          aria-label="Continue with TikTok"
          title="Continue with TikTok"
        >
          TikTok
        </button>
      </div>
    </>
  );
}