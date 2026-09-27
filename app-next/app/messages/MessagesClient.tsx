"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type MsgRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  listing_id?: string | null;
  sender?: { display_name?: string | null } | null;
  recipient?: { display_name?: string | null } | null;
};

type Conv = {
  id: string;
  name: string;
  messages: MsgRow[];
  listingId: string | null;
};

function fmtTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function MessagesClient() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [conversations, setConversations] = useState<Record<string, Conv>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [threadOpen, setThreadOpen] = useState(false);
  const [compose, setCompose] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const draftTo = searchParams.get("to");
  const draftName = searchParams.get("name");
  const draftListing = searchParams.get("listing");

  const ensureConv = useCallback(
    (map: Record<string, Conv>, otherId: string, name?: string) => {
      if (!map[otherId]) {
        map[otherId] = {
          id: otherId,
          name: name || "Player",
          messages: [],
          listingId: null,
        };
      } else if (name) {
        map[otherId].name = name;
      }
      return map[otherId];
    },
    []
  );

  const loadMessages = useCallback(
    async (uid: string) => {
      setLoadError(null);
      const { data, error } = await supabase
        .from("messages")
        .select(
          "*, sender:profiles!messages_sender_id_fkey(display_name), recipient:profiles!messages_recipient_id_fkey(display_name)"
        )
        .or(`sender_id.eq.${uid},recipient_id.eq.${uid}`)
        .order("created_at", { ascending: true });

      if (error) {
        setLoadError(error.message);
        return;
      }

      const map: Record<string, Conv> = {};
      (data || []).forEach((m: MsgRow) => {
        const isMine = m.sender_id === uid;
        const otherId = isMine ? m.recipient_id : m.sender_id;
        const otherName = isMine
          ? m.recipient?.display_name || "Player"
          : m.sender?.display_name || "Player";
        const conv = ensureConv(map, otherId, otherName);
        if (m.listing_id) conv.listingId = m.listing_id;
        conv.messages.push(m);
      });

      if (draftTo && draftTo !== uid) {
        ensureConv(
          map,
          draftTo,
          draftName ? decodeURIComponent(draftName) : "Player"
        );
        if (draftListing) map[draftTo].listingId = draftListing;
      }

      setConversations(map);
      if (draftTo && map[draftTo]) {
        setActiveId(draftTo);
        setThreadOpen(true);
      }
    },
    [supabase, draftTo, draftName, draftListing, ensureConv]
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id ?? null;
      setUserId(id);
      setChecking(false);
      if (id) loadMessages(id);
    });
  }, [supabase.auth, loadMessages]);

  const convList = useMemo(() => {
    return Object.values(conversations).sort((a, b) => {
      const aT = a.messages[a.messages.length - 1]?.created_at || "";
      const bT = b.messages[b.messages.length - 1]?.created_at || "";
      return bT.localeCompare(aT);
    });
  }, [conversations]);

  const active = activeId ? conversations[activeId] : null;

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!userId || !activeId || !compose.trim()) return;
    setSending(true);
    setSendError(null);

    const body = compose.trim();
    const { error } = await supabase.from("messages").insert({
      sender_id: userId,
      recipient_id: activeId,
      body,
      listing_id: active?.listingId || null,
    });

    setSending(false);
    if (error) {
      setSendError(error.message);
      return;
    }
    setCompose("");
    await loadMessages(userId);
    setActiveId(activeId);
    setThreadOpen(true);
  }

  if (checking) {
    return <p className="field-hint">Checking authentication…</p>;
  }

  if (!userId) {
    return (
      <div className="auth-notice is-visible" id="msg-signin-notice">
        <Link href="/signin?redirect=/messages" style={{ color: "var(--paper)" }}>
          Sign in
        </Link>{" "}
        to view and send messages.
      </div>
    );
  }

  return (
    <>
      {loadError && (
        <div className="auth-error is-visible" style={{ marginBottom: "1rem" }}>
          {loadError}
        </div>
      )}

      <div
        className={`msg-layout${threadOpen ? " is-thread-open" : ""}`}
        id="msg-layout"
      >
        <div className="msg-list-pane">
          <div className="msg-list-head">Conversations</div>
          <div id="msg-conv-list">
            {convList.length === 0 ? (
              <p className="field-hint" style={{ padding: "1rem" }}>
                No conversations yet. Message someone from the{" "}
                <Link href="/player-market">Player Market</Link>.
              </p>
            ) : (
              convList.map((c) => {
                const last = c.messages[c.messages.length - 1];
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`msg-conv-item${activeId === c.id ? " is-active" : ""}`}
                    onClick={() => {
                      setActiveId(c.id);
                      setThreadOpen(true);
                    }}
                  >
                    <div className="msg-conv-name">
                      <span>{c.name}</span>
                    </div>
                    <div className="msg-conv-preview">
                      {last?.body || "New conversation"}
                    </div>
                    {last && (
                      <div className="msg-conv-time">
                        {fmtTime(last.created_at)}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="msg-thread-pane">
          {!active ? (
            <div id="msg-thread-empty" className="msg-empty">
              <div className="msg-empty-state">
                <span>Select a conversation to start chatting.</span>
                <Link href="/player-market" className="btn btn-ghost">
                  Browse Player Market
                </Link>
              </div>
            </div>
          ) : (
            <div
              id="msg-thread-active"
              style={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <div className="msg-thread-head">
                <button
                  type="button"
                  className="msg-thread-back"
                  id="msg-thread-back"
                  aria-label="Back to conversations"
                  onClick={() => setThreadOpen(false)}
                >
                  ←
                </button>
                <div>
                  <div className="msg-thread-title" id="msg-thread-title">
                    {active.name}
                  </div>
                  <div className="msg-thread-sub" id="msg-thread-sub">
                    Direct message
                  </div>
                </div>
              </div>
              <div className="msg-thread-body" id="msg-thread-body">
                {active.messages.length === 0 ? (
                  <p className="field-hint" style={{ padding: "1rem" }}>
                    No messages yet — say hello.
                  </p>
                ) : (
                  active.messages.map((m) => {
                    const mine = m.sender_id === userId;
                    return (
                      <div
                        key={m.id}
                        className={`msg-bubble ${mine ? "mine" : "theirs"}`}
                      >
                        {m.body}
                        <span className="msg-bubble-time">
                          {fmtTime(m.created_at)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              {sendError && (
                <div
                  className="auth-error is-visible"
                  id="msg-send-error"
                  style={{ margin: "0 1rem" }}
                >
                  {sendError}
                </div>
              )}
              <form
                className="msg-compose"
                id="msg-compose-form"
                onSubmit={handleSend}
              >
                <textarea
                  id="msg-compose-input"
                  rows={1}
                  placeholder="Write a message…"
                  maxLength={2000}
                  required
                  value={compose}
                  onChange={(e) => setCompose(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  id="msg-send-btn"
                  disabled={sending}
                >
                  {sending ? "…" : "Send"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}