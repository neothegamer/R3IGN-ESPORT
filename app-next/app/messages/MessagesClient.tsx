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
import { useOnlinePresence } from "@/components/OnlinePresenceProvider";

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
  attachment_path?: string | null;
  attachment_type?: string | null;
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

const BUCKET = "message-attachments";
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

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

function publicUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}

const LONG_PRESS_MS = 450;

export default function MessagesClient() {
  const supabase = createClient();
  const { isOnline, onlineIds } = useOnlinePresence();
  const searchParams = useSearchParams();
  const sendingLock = useRef(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingIdle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingChannelRef = useRef<ReturnType<
    ReturnType<typeof createClient>["channel"]
  > | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [conversations, setConversations] = useState<Record<string, Conv>>(
    {}
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [threadOpen, setThreadOpen] = useState(false);
  const [compose, setCompose] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [peerTyping, setPeerTyping] = useState(false);
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

  const clearFile = () => {
    setFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onPickFile = (f: File | null) => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    if (!f) {
      setFile(null);
      setFilePreview(null);
      return;
    }
    if (!f.type.startsWith("image/")) {
      setSendError("Only image attachments are supported.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setSendError("Image must be 5MB or smaller.");
      return;
    }
    setSendError(null);
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
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

    const channel = supabase
      .channel(`messages-realtime-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as MsgRow;
          if (!row) return;
          if (row.sender_id !== userId && row.recipient_id !== userId) return;
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
      .subscribe();

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

  useEffect(() => {
    if (!userId || !activeId) {
      setPeerTyping(false);
      typingChannelRef.current = null;
      return;
    }

    const channel = supabase.channel(
      `typing:${[userId, activeId].sort().join(":")}`,
      { config: { broadcast: { self: false } } }
    );
    typingChannelRef.current = channel;

    channel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (!payload || payload.userId === userId) return;
        if (payload.userId !== activeId) return;
        setPeerTyping(true);
        window.setTimeout(() => setPeerTyping(false), 2500);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (typingChannelRef.current === channel) {
        typingChannelRef.current = null;
      }
      setPeerTyping(false);
    };
  }, [supabase, userId, activeId]);

  useEffect(() => {
    if (!menuMsgId) return;
    const close = () => setMenuMsgId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuMsgId]);

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

  function signalTyping() {
    if (!userId || !activeId || !typingChannelRef.current) return;
    typingChannelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { userId, at: Date.now() },
    });
    if (typingIdle.current) clearTimeout(typingIdle.current);
    typingIdle.current = setTimeout(() => {}, 2000);
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!userId || !activeId) return;
    const body = compose.trim();
    if (!body && !file) return;
    if (sendingLock.current || sending) return;
    sendingLock.current = true;
    setSending(true);
    setSendError(null);

    const recipientOnline = onlineIds.has(activeId);
    const now = new Date().toISOString();

    try {
      let attachment_path: string | null = null;
      let attachment_type: string | null = null;

      if (file) {
        const safe = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `${userId}/${Date.now()}-${safe}`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, {
            upsert: false,
            contentType: file.type,
          });
        if (upErr) throw upErr;
        attachment_path = path;
        attachment_type = file.type;
      }

      const { error } = await supabase.from("messages").insert({
        sender_id: userId,
        recipient_id: activeId,
        body: body || (file ? "" : ""),
        listing_id: active?.listingId || null,
        delivered_at: recipientOnline ? now : null,
        read_at: null,
        attachment_path,
        attachment_type,
      });

      if (error) {
        setSendError(error.message);
        return;
      }
      setCompose("");
      clearFile();
      setPeerTyping(false);
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
    if (msg.attachment_path) {
      await supabase.storage
        .from(BUCKET)
        .remove([msg.attachment_path])
        .catch(() => {});
    }
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
                const preview = last?.body?.trim()
                  ? last.body
                  : last?.attachment_path
                    ? "📷 Image"
                    : "New conversation";
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
                    <div className="msg-conv-preview">{preview}</div>
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
            <div id="msg-thread-active">
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
                    {isOnline(active.id) ? "Online" : "Offline"}
                  </div>
                </div>
              </div>
              {peerTyping && (
                <div className="msg-typing" aria-live="polite">
                  {active.name} is typing…
                </div>
              )}
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
                            <div className="msg-bubble-row">
                              <div className="msg-bubble-main">
                                {m.attachment_path &&
                                  (m.attachment_type || "").startsWith(
                                    "image/"
                                  ) && (
                                    <a
                                      href={publicUrl(m.attachment_path)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="msg-attach-link"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={publicUrl(m.attachment_path)}
                                        alt="Attachment"
                                        className="msg-attach-img"
                                      />
                                    </a>
                                  )}
                                {m.body?.trim() ? (
                                  <span className="msg-bubble-text">
                                    {m.body}
                                  </span>
                                ) : null}
                              </div>
                              {mine && (
                                <button
                                  type="button"
                                  className="msg-more-btn"
                                  aria-label="Message options"
                                  aria-expanded={menuOpen}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuMsgId(menuOpen ? null : m.id);
                                  }}
                                  onPointerDown={(e) => e.stopPropagation()}
                                >
                                  ⋮
                                </button>
                              )}
                            </div>
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
                                onPointerDown={(e) => e.stopPropagation()}
                              >
                                {m.body?.trim() ? (
                                  <button
                                    type="button"
                                    className="msg-action-btn"
                                    onClick={() => startEdit(m)}
                                  >
                                    Edit
                                  </button>
                                ) : null}
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
              {filePreview && (
                <div className="msg-compose-preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={filePreview} alt="Preview" />
                  <button
                    type="button"
                    className="msg-compose-preview-remove"
                    onClick={clearFile}
                    aria-label="Remove attachment"
                  >
                    ×
                  </button>
                </div>
              )}
              <form className="msg-compose" onSubmit={handleSend}>
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPT}
                  className="msg-file-input"
                  onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  className="msg-attach-btn"
                  aria-label="Attach image"
                  title="Attach image"
                  disabled={sending}
                  onClick={() => fileRef.current?.click()}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>
                <textarea
                  rows={1}
                  placeholder="Write a message…"
                  maxLength={2000}
                  value={compose}
                  onChange={(e) => {
                    setCompose(e.target.value);
                    if (e.target.value.trim()) signalTyping();
                  }}
                  disabled={sending}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sending || (!compose.trim() && !file)}
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
