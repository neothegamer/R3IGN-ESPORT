"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type MsgRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  listing_id?: string | null;
  delivered_at?: string | null;
  read_at?: string | null;
  edited_at?: string | null;
  sender?: { display_name?: string | null } | null;
  recipient?: { display_name?: string | null } | null;
};

type Conv = {
  id: string;
  name: string;
  messages: MsgRow[];
  listingId: string | null;
  unread: number;
};

function fmtTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function MessageTicks({ msg }: { msg: MsgRow }) {
  if (msg.read_at) {
    return (
      <span className="msg-ticks is-read" title="Read" aria-label="Read">
        ✓✓
      </span>
    );
  }
  if (msg.delivered_at) {
    return (
      <span
        className="msg-ticks is-delivered"
        title="Delivered"
        aria-label="Delivered"
      >
        ✓✓
      </span>
    );
  }
  return (
    <span className="msg-ticks is-sent" title="Sent" aria-label="Sent">
      ✓
    </span>
  );
}

const LONG_PRESS_MS = 450;

export default function MessagesClient() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const sendingLock = useRef(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [conversations, setConversations] = useState<Record<string, Conv>>(
    {}
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [threadOpen, setThreadOpen] = useState(false);
  const [compose, setCompose] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  const [menuMsgId, setMenuMsgId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const draftTo = searchParams.get("to");
  const draftName = searchParams.get("name");
  const draftListing = searchParams.get("listing");

  const clearPressTimer = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const ensureConv = useCallback(
    (map: Record<string, Conv>, otherId: string, name?: string) => {
      if (!map[otherId]) {
        map[otherId] = {
          id: otherId,
          name: name || "Player",
          messages: [],
          listingId: null,
          unread: 0,
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
        if (!isMine && !m.read_at) conv.unread += 1;
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
        setActiveId((prev) => prev || draftTo);
        setThreadOpen(true);
      }
    },
    [supabase, draftTo, draftName, draftListing, ensureConv]
  );

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel("r3ign-online", {
      config: { presence: { key: userId } },
    });

    const syncOnline = () => {
      const state = channel.presenceState() as Record<
        string,
        Array<{ user_id?: string }>
      >;
      const ids = new Set<string>();
      for (const [key, metas] of Object.entries(state)) {
        ids.add(key);
        for (const meta of metas || []) {
          if (meta?.user_id) ids.add(meta.user_id);
        }
      }
      // You are online if subscribed; include self
      ids.add(userId);
      setOnlineIds(ids);
    };

    channel
      .on("presence", { event: "sync" }, syncOnline)
      .on("presence", { event: "join" }, syncOnline)
      .on("presence", { event: "leave" }, syncOnline)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
          syncOnline();
        }
      });

    // heartbeat so presence does not go stale
    const beat = window.setInterval(() => {
      channel.track({
        user_id: userId,
        online_at: new Date().toISOString(),
      });
    }, 30000);

    return () => {
      window.clearInterval(beat);
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`messages-realtime-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as MsgRow;
          if (!row) return;
          if (row.sender_id !== userId && row.recipient_id !== userId) return;
          // Full reload keeps names / unread correct; cheap for chat volume
          loadMessages(userId);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as MsgRow;
          if (!row) return;
          if (row.sender_id !== userId && row.recipient_id !== userId) return;
          loadMessages(userId);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.old as MsgRow;
          if (!row) return;
          if (row.sender_id !== userId && row.recipient_id !== userId) return;
          loadMessages(userId);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // ready for live events
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId, loadMessages]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id ?? null;
      setUserId(id);
      setChecking(false);
      if (id) loadMessages(id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!userId || !activeId) return;
    let cancelled = false;
    (async () => {
      const now = new Date().toISOString();
      await supabase
        .from("messages")
        .update({ delivered_at: now })
        .eq("recipient_id", userId)
        .eq("sender_id", activeId)
        .is("delivered_at", null);
      await supabase
        .from("messages")
        .update({ read_at: now, delivered_at: now })
        .eq("recipient_id", userId)
        .eq("sender_id", activeId)
        .is("read_at", null);
      if (!cancelled) await loadMessages(userId);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, activeId]);

  // Close action menu on outside click
  useEffect(() => {
    if (!menuMsgId) return;
    const close = () => setMenuMsgId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuMsgId]);


  // Auto-scroll thread when messages change
  useEffect(() => {
    const el = document.getElementById("msg-thread-body");
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [activeId, conversations]);

  const convList = useMemo(() => {
    return Object.values(conversations).sort((a, b) => {
      if (a.unread > 0 && b.unread === 0) return -1;
      if (b.unread > 0 && a.unread === 0) return 1;
      const aT = a.messages[a.messages.length - 1]?.created_at || "";
      const bT = b.messages[b.messages.length - 1]?.created_at || "";
      return bT.localeCompare(aT);
    });
  }, [conversations]);

  const active = activeId ? conversations[activeId] : null;

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!userId || !activeId || !compose.trim()) return;
    if (sendingLock.current || sending) return;
    sendingLock.current = true;
    setSending(true);
    setSendError(null);

    const body = compose.trim();
    const recipientOnline = onlineIds.has(activeId);
    const now = new Date().toISOString();

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: userId,
        recipient_id: activeId,
        body,
        listing_id: active?.listingId || null,
        delivered_at: recipientOnline ? now : null,
        read_at: null,
      });
      if (error) {
        setSendError(error.message);
        return;
      }
      setCompose("");
      await loadMessages(userId);
    } catch (err: unknown) {
      setSendError(
        err instanceof Error ? err.message : "Could not send message."
      );
    } finally {
      setSending(false);
      sendingLock.current = false;
    }
  }

  function startEdit(msg: MsgRow) {
    setMenuMsgId(null);
    setEditingId(msg.id);
    setEditDraft(msg.body);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft("");
  }

  async function saveEdit() {
    if (!userId || !editingId || !editDraft.trim()) return;
    setEditSaving(true);
    setSendError(null);
    const { error } = await supabase
      .from("messages")
      .update({
        body: editDraft.trim(),
        edited_at: new Date().toISOString(),
      })
      .eq("id", editingId)
      .eq("sender_id", userId);
    setEditSaving(false);
    if (error) {
      setSendError(error.message);
      return;
    }
    setEditingId(null);
    setEditDraft("");
    await loadMessages(userId);
  }

  async function deleteMessage(msg: MsgRow) {
    if (!userId || msg.sender_id !== userId) return;
    setMenuMsgId(null);
    if (
      !window.confirm(
        "Delete this message? The other person will no longer see it."
      )
    ) {
      return;
    }
    setSendError(null);
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", msg.id)
      .eq("sender_id", userId);
    if (error) {
      setSendError(error.message);
      return;
    }
    if (editingId === msg.id) cancelEdit();
    await loadMessages(userId);
  }

  function onBubblePressStart(msg: MsgRow, mine: boolean) {
    if (!mine || editingId) return;
    clearPressTimer();
    pressTimer.current = setTimeout(() => {
      setMenuMsgId(msg.id);
    }, LONG_PRESS_MS);
  }

  function onBubblePressEnd() {
    clearPressTimer();
  }

  if (checking) {
    return <p className="field-hint">Checking authentication…</p>;
  }

  if (!userId) {
    return (
      <div className="auth-notice is-visible" id="msg-signin-notice">
        <Link
          href="/signin?redirect=/messages"
          style={{ color: "var(--paper)" }}
        >
          Sign in
        </Link>{" "}
        to view and send messages.
      </div>
    );
  }

  return (
    <>
      {loadError && (
        <div
          className="auth-error is-visible"
          style={{ marginBottom: "1rem" }}
        >
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
                    className={`msg-conv-item${activeId === c.id ? " is-active" : ""}${c.unread > 0 ? " has-unread" : ""}`}
                    onClick={() => {
                      setActiveId(c.id);
                      setThreadOpen(true);
                    }}
                  >
                    <div className="msg-conv-name">
                      <span>{c.name}</span>
                      {c.unread > 0 && (
                        <span className="msg-conv-unread-badge">
                          {c.unread}
                        </span>
                      )}
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
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div className="msg-thread-head">
                <button
                  type="button"
                  className="msg-thread-back"
                  aria-label="Back to conversations"
                  onClick={() => setThreadOpen(false)}
                >
                  ←
                </button>
                <div>
                  <div className="msg-thread-title">{active.name}</div>
                  <div className="msg-thread-sub">
                    {onlineIds.has(active.id) ? "Online" : "Offline"}
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
                    const isEditing = editingId === m.id;
                    const menuOpen = menuMsgId === m.id;
                    return (
                      <div
                        key={m.id}
                        className={`msg-bubble ${mine ? "mine" : "theirs"}${menuOpen ? " is-menu-open" : ""}`}
                        onPointerDown={() => onBubblePressStart(m, mine)}
                        onPointerUp={onBubblePressEnd}
                        onPointerLeave={onBubblePressEnd}
                        onPointerCancel={onBubblePressEnd}
                        onContextMenu={(e) => {
                          if (!mine) return;
                          e.preventDefault();
                          setMenuMsgId(m.id);
                        }}
                      >
                        {isEditing ? (
                          <div className="msg-edit-box">
                            <textarea
                              className="msg-edit-input"
                              value={editDraft}
                              onChange={(e) => setEditDraft(e.target.value)}
                              rows={2}
                              maxLength={2000}
                              disabled={editSaving}
                            />
                            <div className="msg-edit-actions">
                              <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={cancelEdit}
                                disabled={editSaving}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={saveEdit}
                                disabled={editSaving || !editDraft.trim()}
                              >
                                {editSaving ? "Saving…" : "Save"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className="msg-bubble-text">{m.body}</span>
                            <span className="msg-bubble-meta">
                              <span className="msg-bubble-time">
                                {fmtTime(m.created_at)}
                                {m.edited_at ? " · edited" : ""}
                              </span>
                              {mine && <MessageTicks msg={m} />}
                            </span>
                            {mine && menuOpen && (
                              <div
                                className="msg-bubble-menu"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  className="msg-action-btn"
                                  onClick={() => startEdit(m)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="msg-action-btn msg-action-danger"
                                  onClick={() => deleteMessage(m)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              {sendError && (
                <div
                  className="auth-error is-visible"
                  style={{ margin: "0 1rem" }}
                >
                  {sendError}
                </div>
              )}
              <form className="msg-compose" onSubmit={handleSend}>
                <textarea
                  rows={1}
                  placeholder="Write a message…"
                  maxLength={2000}
                  required
                  value={compose}
                  onChange={(e) => setCompose(e.target.value)}
                  disabled={sending}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
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
