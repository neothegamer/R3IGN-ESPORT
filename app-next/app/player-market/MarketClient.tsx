"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Listing = {
  id: string;
  profile_id: string | null;
  ign: string;
  role: string;
  notes: string | null;
  league: string | null;
  region: string | null;
  profile_screenshot_path?: string | null;
  profile?: { display_name?: string | null } | null;
};

export default function MarketClient() {
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [ign, setIgn] = useState("");
  const [role, setRole] = useState("");
  const [league, setLeague] = useState("");
  const [region, setRegion] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    const { data, error } = await supabase
      .from("player_listings")
      .select("*, profile:profiles(display_name)")
      .order("created_at", { ascending: false })
      .limit(24);

    if (error) {
      setListError(error.message);
      setListings([]);
    } else {
      setListings((data as Listing[]) || []);
    }
    setLoadingList(false);
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setCheckingAuth(false);
    });
    loadListings();
  }, [supabase.auth, loadListings]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!userId) {
      setFormError("You must be signed in to list yourself.");
      return;
    }
    if (!ign.trim() || !role.trim() || !league) {
      setFormError("Fill in in-game name, role, and game.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: inserted, error } = await supabase
        .from("player_listings")
        .insert({
          profile_id: userId,
          ign: ign.trim(),
          role: role.trim(),
          league,
          region: region || null,
          notes: notes.trim() || null,
        })
        .select("id")
        .single();

      if (error) throw error;

      if (file && inserted?.id) {
        const path = `${userId}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
        const { error: upErr } = await supabase.storage
          .from("player-market-uploads")
          .upload(path, file, { upsert: true });
        if (!upErr) {
          await supabase
            .from("player_listings")
            .update({ profile_screenshot_path: path })
            .eq("id", inserted.id);
        }
      }

      setSuccess(true);
      setIgn("");
      setRole("");
      setLeague("");
      setRegion("");
      setNotes("");
      setFile(null);
      await loadListings();
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Could not submit listing."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(listing: Listing) {
    if (!userId || listing.profile_id !== userId) return;
    if (!window.confirm("Delete this player listing permanently?")) return;

    setDeletingId(listing.id);
    try {
      if (listing.profile_screenshot_path) {
        await supabase.storage
          .from("player-market-uploads")
          .remove([listing.profile_screenshot_path])
          .catch(() => {});
      }
      const { error } = await supabase
        .from("player_listings")
        .delete()
        .eq("id", listing.id)
        .eq("profile_id", userId);
      if (error) throw error;
      setListings((prev) => prev.filter((l) => l.id !== listing.id));
    } catch (err: unknown) {
      window.alert(
        err instanceof Error ? err.message : "Could not delete the listing."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <section className="section-tight">
        <div className="wrap">
          {listError && (
            <div className="auth-error is-visible" style={{ marginBottom: "1rem" }}>
              {listError}
            </div>
          )}
          <div className="market-grid" id="market-grid">
            {loadingList ? (
              <p className="field-hint" style={{ padding: "1.25rem" }}>
                Loading…
              </p>
            ) : listings.length === 0 ? (
              <p className="field-hint" style={{ padding: "1.25rem" }}>
                No listings yet — be the first to list yourself below.
              </p>
            ) : (
              listings.map((listing) => {
                const isOwn = userId && listing.profile_id === userId;
                const canMessage =
                  listing.profile_id && !isOwn && userId;
                const messageHref = listing.profile_id
                  ? `/messages?to=${encodeURIComponent(listing.profile_id)}&name=${encodeURIComponent(listing.ign || "Player")}&listing=${encodeURIComponent(listing.id)}`
                  : "/signin";

                return (
                  <div key={listing.id} className="market-card">
                    <div className="role">{listing.role || "Player"}</div>
                    <h3>{listing.ign || "Player"}</h3>
                    <p>
                      {listing.notes || "Available to join an organization."}
                    </p>
                    <div className="market-tags">
                      <span className="market-tag">
                        {(listing.league || "rcml").toUpperCase()}
                      </span>
                      <span className="market-tag">
                        {listing.region || "Region TBD"}
                      </span>
                    </div>
                    <div className="market-card-foot">
                      {isOwn ? (
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{
                            padding: "0.35rem 0.65rem",
                            fontSize: "0.68rem",
                          }}
                          disabled={deletingId === listing.id}
                          onClick={() => handleDelete(listing)}
                        >
                          {deletingId === listing.id
                            ? "Deleting…"
                            : "Delete Listing"}
                        </button>
                      ) : canMessage ? (
                        <Link href={messageHref} className="btn btn-ghost">
                          Message
                        </Link>
                      ) : listing.profile_id ? (
                        <Link
                          href="/signin?redirect=/player-market"
                          className="btn btn-ghost"
                        >
                          Sign in to message
                        </Link>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap" style={{ maxWidth: "640px" }}>
          <div className="form-panel">
            {checkingAuth ? (
              <p className="lede">Checking authentication…</p>
            ) : !userId ? (
              <div className="auth-notice is-visible" id="mp-signin-notice">
                <Link href="/signin?redirect=/player-market" style={{ color: "var(--paper)" }}>
                  Sign in
                </Link>{" "}
                to list yourself on the player market.
              </div>
            ) : success ? (
              <div className="form-success is-visible" id="mp-success" role="status">
                Listing submitted. Organizations will be able to find your
                profile once it&apos;s reviewed.
              </div>
            ) : (
              <>
                {formError && (
                  <div className="auth-error is-visible">{formError}</div>
                )}
                <form id="market-form" onSubmit={handleSubmit} noValidate>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="mp-name">
                        In-game name <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        id="mp-name"
                        value={ign}
                        onChange={(e) => setIgn(e.target.value)}
                        required
                      />
                      <div className="field-error">Enter your in-game name.</div>
                    </div>
                    <div className="field">
                      <label htmlFor="mp-role">
                        Primary role <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        id="mp-role"
                        placeholder="e.g. IGL, Support, Sniper"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                      />
                      <div className="field-error">Enter your primary role.</div>
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="mp-league">
                      Game <span className="req">*</span>
                    </label>
                    <select
                      id="mp-league"
                      value={league}
                      onChange={(e) => setLeague(e.target.value)}
                      required
                    >
                      <option value="">Select a game</option>
                      <option value="rcml">Call of Duty: Mobile (RCML)</option>
                      <option value="rfcl">Free Fire (RFCL)</option>
                      <option value="rbsl">Blood Strike (RBSL)</option>
                    </select>
                    <div className="field-error">Select which game you play.</div>
                  </div>
                  <div className="field">
                    <label htmlFor="mp-region">Region</label>
                    <select
                      id="mp-region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                    >
                      <option value="">Select a region</option>
                      <option>North America</option>
                      <option>South America</option>
                      <option>Europe</option>
                      <option>Middle East &amp; Africa</option>
                      <option>Asia Pacific</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="mp-notes">Availability &amp; experience</label>
                    <textarea
                      id="mp-notes"
                      placeholder="Divisions you're open to, availability, past results"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="mp-file">
                      Upload in-game profile screenshot (optional)
                    </label>
                    <input
                      type="file"
                      id="mp-file"
                      accept="image/*"
                      onChange={(e) =>
                        setFile(e.target.files?.[0] ?? null)
                      }
                    />
                    {file && (
                      <p className="field-hint">Selected: {file.name}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    id="mp-submit"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting…" : "List Yourself"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}