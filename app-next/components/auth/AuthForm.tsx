"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AuthFormProps = {
  mode: "signin" | "signup";
};

function passwordChecks(pw: string) {
  return {
    length: pw.length >= 8,
    number: /\d/.test(pw),
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [verifyMode, setVerifyMode] = useState(false);
  const [panelMode, setPanelMode] = useState<"auth" | "reset-request">("auth");
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const checks = useMemo(() => passwordChecks(password), [password]);
  const strengthScore = Object.values(checks).filter(Boolean).length;
  const passwordStrong = strengthScore === 5;
  const passwordsMatch = password === passwordConfirm && passwordConfirm.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!termsAccepted) {
      setError("You must accept the Terms & Conditions before continuing.");
      return;
    }
    if (mode === "signup") {
      if (!passwordStrong) {
        setError("Password does not meet the requirements.");
        return;
      }
      if (!passwordsMatch) {
        setError("Passwords do not match.");
        return;
      }
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
        setVerifyMode(true);
        setMessage("We sent a 6-digit code to your email. Enter it below.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode.trim(),
        type: "email",
      });
      if (error) throw error;
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      setMessage("A new code was sent to your email.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not resend code.");
    } finally {
      setLoading(false);
    }
  };


  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/signin`,
      });
      if (error) throw error;
      setResetMessage("If an account exists for that email, a reset link is on its way.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send reset link.");
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
      options: { redirectTo: `${window.location.origin}/auth/callback` },
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
    window.location.href =
      "https://nyditfrfzarntmekcyli.supabase.co/functions/v1/tiktok-login-start";
  };


  if (mode === "signin" && panelMode === "reset-request") {
    return (
      <>
        {error && <div className="auth-error is-visible">{error}</div>}
        {resetMessage && <div className="auth-success is-visible">{resetMessage}</div>}
        <p className="lede">Enter your account email and we&rsquo;ll send a secure password reset link.</p>
        <form onSubmit={handleResetRequest} noValidate>
          <div className="field">
            <label htmlFor="reset-email">
              Email <span className="req">*</span>
            </label>
            <input
              id="reset-email"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <div className="field-error">Enter a valid email address.</div>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
          <p className="auth-switch">
            <button
              type="button"
              className="link-btn"
              onClick={() => { setPanelMode("auth"); setError(null); setResetMessage(null); }}
            >
              Back to sign in
            </button>
          </p>
        </form>
      </>
    );
  }

  if (verifyMode) {
    return (
      <>
        {error && <div className="auth-error is-visible">{error}</div>}
        {message && <div className="auth-success is-visible">{message}</div>}
        <form onSubmit={handleVerifyOtp} noValidate>
          <div className="field">
            <label htmlFor="otp-code">
              Verification code <span className="req">*</span>
            </label>
            <input
              id="otp-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
              maxLength={6}
              placeholder="6-digit code"
            />
            <div className="field-error">Enter the 6-digit code from your email.</div>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Verifying…" : "Verify & continue"}
          </button>
        </form>
        <p className="auth-switch">
          <button type="button" className="link-btn" onClick={handleResendCode} disabled={loading}>
            Resend code
          </button>
        </p>
      </>
    );
  }

  return (
    <>
      {error && <div className="auth-error is-visible">{error}</div>}
      {message && <div className="auth-success is-visible">{message}</div>}

      <form onSubmit={handleSubmit} noValidate>
        {mode === "signup" && (
          <div className="field">
            <label htmlFor="su-name">
              Display name <span className="req">*</span>
            </label>
            <input
              id="su-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              autoComplete="name"
            />
            <div className="field-error">Enter a display name.</div>
          </div>
        )}

        <div className="field">
          <label htmlFor="auth-email">
            Email <span className="req">*</span>
          </label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <div className="field-error">Enter a valid email address.</div>
        </div>

        <div className="field">
          <label htmlFor="auth-password">
            Password <span className="req">*</span>
          </label>
          <div className="password-wrap">
            <input
              id="auth-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "signup" ? 8 : 6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
            >
              <img
                className="eye-closed"
                src="/assets/eye-closed.png"
                alt=""
                width={20}
                height={20}
                style={{ display: showPassword ? "none" : "block" }}
              />
              <svg
                className="eye-open"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width={20}
                height={20}
                style={{ display: showPassword ? "block" : "none" }}
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>

          {mode === "signup" && (
            <div className="password-strength" id="password-strength">
              <div
                className="password-strength-bar"
                id="strength-bar"
                data-score={strengthScore}
              >
                <span style={{ width: `${(strengthScore / 5) * 100}%` }} />
              </div>
              <ul className="password-reqs" id="password-reqs">
                <li data-req="length" className={checks.length ? "is-met" : undefined}>
                  At least 8 characters
                </li>
                <li data-req="number" className={checks.number ? "is-met" : undefined}>
                  At least 1 number
                </li>
                <li data-req="lower" className={checks.lower ? "is-met" : undefined}>
                  At least 1 lowercase letter
                </li>
                <li data-req="upper" className={checks.upper ? "is-met" : undefined}>
                  At least 1 uppercase letter
                </li>
                <li data-req="special" className={checks.special ? "is-met" : undefined}>
                  At least 1 special character
                </li>
              </ul>
            </div>
          )}
          <div className="field-error">
            {mode === "signup" ? "Password does not meet the requirements." : "Enter your password."}
          </div>
        </div>

        {mode === "signup" && (
          <div className="field">
            <label htmlFor="su-password-confirm">
              Confirm password <span className="req">*</span>
            </label>
            <div className="password-wrap">
              <input
                id="su-password-confirm"
                type={showPasswordConfirm ? "text" : "password"}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPasswordConfirm ? "Hide password" : "Show password"}
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              >
                <img
                  className="eye-closed"
                  src="/assets/eye-closed.png"
                  alt=""
                  width={20}
                  height={20}
                  style={{ display: showPasswordConfirm ? "none" : "block" }}
                />
                <svg
                  className="eye-open"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width={20}
                  height={20}
                  style={{ display: showPasswordConfirm ? "block" : "none" }}
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
            <div className="field-error">Passwords do not match.</div>
          </div>
        )}

        {mode === "signin" && (
          <p style={{ margin: "-0.35rem 0 1rem", textAlign: "right", fontSize: "0.82rem" }}>
            <button type="button" className="link-btn" onClick={() => { setPanelMode("reset-request"); setError(null); setMessage(null); }}>
              Forgot password?
            </button>
          </p>
        )}

        <div className="field checkbox-field" id="terms-consent-field">
          <input
            type="checkbox"
            id="auth-terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
          />
          <label htmlFor="auth-terms">
            I agree to the{" "}
            <Link href="/terms" target="_blank" rel="noopener">
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" target="_blank" rel="noopener">
              Privacy Policy
            </Link>
            {mode === "signin" ? " before continuing." : "."}
          </label>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading
            ? "Please wait..."
            : mode === "signin"
            ? "Sign In"
            : "Create Account"}
        </button>
      </form>

      <div className="auth-divider" id="signin-divider">
        or continue with
      </div>

      <div className="oauth-group oauth-icons">
        <button
          type="button"
          className="btn-oauth-icon"
          onClick={handleDiscord}
          disabled={loading}
          aria-label="Continue with Discord"
          title="Continue with Discord"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              fill="currentColor"
              d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
            />
          </svg>
        </button>
        <button
          type="button"
          className="btn-oauth-icon"
          onClick={handleTikTok}
          disabled={loading}
          aria-label="Continue with TikTok"
          title="Continue with TikTok"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              d="M12.8 2.5v10.1a4.7 4.7 0 1 1-3.3-4.5v3.1a1.8 1.8 0 1 0 1.4 1.7V2.5h2.5c.3 1.5 1.2 2.6 2.7 3.2v2.6c-1.3-.2-2.4-.8-3.3-1.6v5.9a4.7 4.7 0 1 1-3.3-4.5v3.1a1.8 1.8 0 1 0 1.4 1.7V2.5h1.9Z"
              fill="#25F4EE"
            />
            <path
              d="M12.8 2.5v10.1a4.7 4.7 0 1 1-3.3-4.5v3.1a1.8 1.8 0 1 0 1.4 1.7V2.5h2.5c.3 1.5 1.2 2.6 2.7 3.2v2.6c-1.3-.2-2.4-.8-3.3-1.6v5.9a4.7 4.7 0 1 1-3.3-4.5v3.1a1.8 1.8 0 1 0 1.4 1.7V2.5h1.9Z"
              fill="#FE2C55"
              opacity=".85"
            />
            <path
              d="M13.5 3v10.1a4.7 4.7 0 1 1-3.3-4.5v3.1a1.8 1.8 0 1 0 1.4 1.7V3h2.5c.3 1.5 1.2 2.6 2.7 3.2v2.6c-1.3-.2-2.4-.8-3.3-1.6v5.9a4.7 4.7 0 1 1-3.3-4.5v3.1a1.8 1.8 0 1 0 1.4 1.7V3h1.9Z"
              fill="#fff"
            />
          </svg>
        </button>
      </div>
    </>
  );
}
