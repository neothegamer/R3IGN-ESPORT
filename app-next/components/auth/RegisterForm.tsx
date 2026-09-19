"use client";

import Link from "next/link";
import { useState, useEffect, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterForm() {
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [teamName, setTeamName] = useState("");
  const [teamTag, setTeamTag] = useState("");
  const [league, setLeague] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [captainEmail, setCaptainEmail] = useState("");
  const [discord, setDiscord] = useState("");
  const [region, setRegion] = useState("");
  const [roster, setRoster] = useState("");
  const [notes, setNotes] = useState("");
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setCheckingAuth(false);
    });
  }, [supabase.auth]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!userId) {
      setError("You must be signed in to submit a team registration.");
      return;
    }
    if (
      !teamName.trim() ||
      !teamTag.trim() ||
      !league ||
      !captainName.trim() ||
      !captainEmail.trim() ||
      !region ||
      !roster.trim() ||
      !agree
    ) {
      setError("Please fill in all required fields and accept the rules.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(captainEmail)) {
      setError("Enter a valid captain email address.");
      return;
    }

    setLoading(true);
    const { error: err } = await supabase.from("registrations").insert({
      submitted_by: userId,
      team_name: teamName.trim(),
      team_tag: teamTag.trim(),
      league,
      captain_name: captainName.trim(),
      captain_email: captainEmail.trim(),
      discord: discord.trim() || null,
      region,
      roster: roster.trim(),
      notes: notes.trim() || null,
    });
    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }
    setSuccess(true);
  }

  if (checkingAuth) {
    return <p className="lede">Checking authentication…</p>;
  }

  if (!userId) {
    return (
      <div className="auth-notice is-visible" id="reg-signin-notice">
        <Link href="/signin" style={{ color: "var(--paper)" }}>
          Sign in
        </Link>{" "}
        or{" "}
        <Link href="/signup" style={{ color: "var(--paper)" }}>
          create an account
        </Link>{" "}
        first &mdash; team registration is only available to signed-in players.
      </div>
    );
  }

  if (success) {
    return (
      <div className="form-success is-visible" id="reg-success" role="status">
        Registration received. A member of the R3IGN HQ team will follow up by
        email with next steps.
      </div>
    );
  }

  return (
    <>
      {error && <div className="auth-error is-visible">{error}</div>}
      <form id="register-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="team-name">
            Team name <span className="req">*</span>
          </label>
          <input
            type="text"
            id="team-name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
          <div className="field-error">Enter your team name.</div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="team-tag">
              Team tag <span className="req">*</span>
            </label>
            <input
              type="text"
              id="team-tag"
              maxLength={5}
              placeholder="e.g. AE"
              value={teamTag}
              onChange={(e) => setTeamTag(e.target.value)}
              required
            />
            <div className="field-error">Enter a short team tag.</div>
          </div>
          <div className="field">
            <label htmlFor="league">
              League <span className="req">*</span>
            </label>
            <select
              id="league"
              value={league}
              onChange={(e) => setLeague(e.target.value)}
              required
            >
              <option value="">Select a league</option>
              <option value="rcml">RCML — COD:Mobile</option>
              <option value="rfcl">RFCL — Free Fire</option>
              <option value="rbsl">RBSL — Blood Strike</option>
            </select>
            <div className="field-error">Select a league.</div>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="captain-name">
              Captain full name <span className="req">*</span>
            </label>
            <input
              type="text"
              id="captain-name"
              value={captainName}
              onChange={(e) => setCaptainName(e.target.value)}
              required
            />
            <div className="field-error">Enter the captain&rsquo;s name.</div>
          </div>
          <div className="field">
            <label htmlFor="captain-email">
              Captain email <span className="req">*</span>
            </label>
            <input
              type="email"
              id="captain-email"
              value={captainEmail}
              onChange={(e) => setCaptainEmail(e.target.value)}
              required
            />
            <div className="field-error">Enter a valid email address.</div>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="discord">Discord handle</label>
            <input
              type="text"
              id="discord"
              placeholder="username"
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="region">
              Region <span className="req">*</span>
            </label>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              required
            >
              <option value="">Select a region</option>
              <option>North America</option>
              <option>South America</option>
              <option>Europe</option>
              <option>Middle East &amp; Africa</option>
              <option>Asia Pacific</option>
            </select>
            <div className="field-error">Select your region.</div>
          </div>
        </div>

        <div className="field">
          <label htmlFor="roster">
            Roster (in-game names, one per line) <span className="req">*</span>
          </label>
          <textarea
            id="roster"
            value={roster}
            onChange={(e) => setRoster(e.target.value)}
            required
            placeholder={"Player 1\nPlayer 2\nPlayer 3\nPlayer 4\nPlayer 5"}
          />
          <div className="field-error">List your roster.</div>
        </div>

        <div className="field">
          <label htmlFor="notes">Anything else we should know?</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Previous results, org affiliation, availability, etc."
          />
        </div>

        <div className="field checkbox-field">
          <input
            type="checkbox"
            id="agree"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            required
          />
          <label htmlFor="agree">
            I confirm my roster agrees to the R3IGN HQ competitive rules and
            code of conduct. <span className="req">*</span>
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          id="reg-submit"
          disabled={loading}
        >
          {loading ? "Submitting…" : "Submit Registration"}
        </button>
      </form>
    </>
  );
}