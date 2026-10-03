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
import { useR3ignDialog } from "@/components/R3ignDialog";

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
  deleted_at?: string | null;
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

const EDIT_WINDOW_MS = 10 * 60 * 1000;
/** Min gap between sends */
const SEND_MIN_INTERVAL_MS = 1200;
/** Max messages in the sliding window */
const SEND_MAX_PER_WINDOW = 8;
const SEND_WINDOW_MS = 60_000;

function canEditMessage(msg: { created_at: string; deleted_at?: string | null }) {
  if (msg.deleted_at) return false;
  return Date.now() - new Date(msg.created_at).getTime() <= EDIT_WINDOW_MS;
}

const URL_RE =
  /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;

function extractUrls(text: string): string[] {
  if (!text) return [];
  const found = text.match(URL_RE) || [];
  return [...new Set(found)].slice(0, 3);
}

function linkDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function LinkPreviews({ body }: { body: string }) {
  const urls = extractUrls(body);
  if (!urls.length) return null;
  return (
    <div className="msg-link-previews">
      {urls.map((url) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="msg-link-card"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="msg-link-domain">{linkDomain(url)}</span>
          <span className="msg-link-url">{url}</span>
        </a>
      ))}
    </div>
  );
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
  const { confirm, alert } = useR3ignDialog();
  const searchParams = useSearchParams();
  const sendingLock = useRef(false);
  const lastSendAt = useRef(0);
  const sendTimestamps = useRef<number[]>([]);
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
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [blockBusy, setBlockBusy] = useState(false);
  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());
  const [muteBusy, setMuteBusy] = useState(false);
  const [convQuery, setConvQuery] = useState("");

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

  const loadBlocks = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from("user_blocks")
      .select("blocked_id")
      .eq("blocker_id", uid);
    if (error) {
      console.warn("loadBlocks", error.message);
      return;
    }
    setBlockedIds(new Set((data || []).map((r) => r.blocked_id as string)));
  }, [supabase]);

  const loadMutes = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from("user_mutes")
      .select("muted_id")
      .eq("muter_id", uid);
    if (error) {
      console.warn("loadMutes", error.message);
      return;
    }
    setMutedIds(new Set((data || []).map((r) => r.muted_id as string)));
  }, [supabase]);

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
      if (id) {
        loadMessages(id);
        loadBlocks(id);
        loadMutes(id);
      }
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

  const sortConvs = (list: Conv[]) =>
    list.sort((a, b) => {
      const aMuted = mutedIds.has(a.id) ? 1 : 0;
      const bMuted = mutedIds.has(b.id) ? 1 : 0;
      if (aMuted !== bMuted) return aMuted - bMuted;
      const aUnread = mutedIds.has(a.id) ? 0 : a.unread;
      const bUnread = mutedIds.has(b.id) ? 0 : b.unread;
      if (aUnread > 0 && bUnread === 0) return -1;
      if (bUnread > 0 && aUnread === 0) return 1;
      const aT = a.messages[a.messages.length - 1]?.created_at || "";
      const bT = b.messages[b.messages.length - 1]?.created_at || "";
      return bT.localeCompare(aT);
    });

  const convList = useMemo(() => {
    return sortConvs(
      Object.values(conversations).filter((c) => !blockedIds.has(c.id))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, blockedIds, mutedIds]);

  const blockedConvList = useMemo(() => {
    return sortConvs(
      Object.values(conversations).filter((c) => blockedIds.has(c.id))
    );
  }, [conversations, blockedIds]);

  const filterConv = (list: Conv[]) => {
    const q = convQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => {
      if (c.name.toLowerCase().includes(q)) return true;
      const last = c.messages[c.messages.length - 1];
      if (last?.body?.toLowerCase().includes(q)) return true;
      return false;
    });
  };

  const filteredConvList = useMemo(
    () => filterConv(convList),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [convList, convQuery]
  );

  const filteredBlockedList = useMemo(
    () => filterConv(blockedConvList),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [blockedConvList, convQuery]
  );

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

  async function blockUser() {
    if (!userId || !activeId || blockBusy) return;
    const ok = await confirm({
      title: "Block user",
      message: `Block ${active?.name || "this user"}? They will not be able to message you, and you will not be able to message them until you unblock.`,
      confirmLabel: "Block",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    setBlockBusy(true);
    setSendError(null);
    const { error } = await supabase.from("user_blocks").insert({
      blocker_id: userId,
      blocked_id: activeId,
    });
    setBlockBusy(false);
    if (error) {
      setSendError(error.message);
      return;
    }
    setBlockedIds((prev) => new Set(prev).add(activeId));
    setReportOpen(false);
  }

  async function unblockUser(peerId?: string) {
    const target = peerId || activeId;
    if (!userId || !target || blockBusy) return;
    setBlockBusy(true);
    setSendError(null);
    const { error } = await supabase
      .from("user_blocks")
      .delete()
      .eq("blocker_id", userId)
      .eq("blocked_id", target);
    setBlockBusy(false);
    if (error) {
      setSendError(error.message);
      return;
    }
    setBlockedIds((prev) => {
      const next = new Set(prev);
      next.delete(target);
      return next;
    });
    await loadMessages(userId);
  }


  async function muteUser() {
    if (!userId || !activeId || muteBusy) return;
    const ok = await confirm({
      title: "Mute conversation",
      message: `Mute ${active?.name || "this user"}? You can still open the chat, but new messages will not mark the conversation as unread.`,
      confirmLabel: "Mute",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    setMuteBusy(true);
    setSendError(null);
    const { error } = await supabase.from("user_mutes").insert({
      muter_id: userId,
      muted_id: activeId,
    });
    setMuteBusy(false);
    if (error) {
      setSendError(error.message);
      return;
    }
    setMutedIds((prev) => new Set(prev).add(activeId));
  }

  async function unmuteUser(peerId?: string) {
    const target = peerId || activeId;
    if (!userId || !target || muteBusy) return;
    setMuteBusy(true);
    setSendError(null);
    const { error } = await supabase
      .from("user_mutes")
      .delete()
      .eq("muter_id", userId)
      .eq("muted_id", target);
    setMuteBusy(false);
    if (error) {
      setSendError(error.message);
      return;
    }
    setMutedIds((prev) => {
      const next = new Set(prev);
      next.delete(target);
      return next;
    });
  }

  async function submitReport(e: FormEvent) {
    e.preventDefault();
    if (!userId || !activeId || reportBusy) return;
    setReportBusy(true);
    setSendError(null);
    const { error } = await supabase.from("user_reports").insert({
      reporter_id: userId,
      reported_id: activeId,
      reason: reportReason,
      details: reportDetails.trim() || null,
      conversation_peer_id: activeId,
    });
    setReportBusy(false);
    if (error) {
      setSendError(error.message);
      return;
    }
    setReportOpen(false);
    setReportDetails("");
    setReportReason("spam");
    await alert({
      title: "Report submitted",
      message: "Thanks. Our team will review this report.",
      okLabel: "OK",
    });
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!userId || !activeId) return;
    if (blockedIds.has(activeId)) {
      setSendError("You have blocked this user.");
      return;
    }
    const body = compose.trim();
    if (!body && !file) return;
    if (sendingLock.current || sending) return;

    const sendNow = Date.now();
    if (sendNow - lastSendAt.current < SEND_MIN_INTERVAL_MS) {
      setSendError("You're sending too quickly. Wait a moment.");
      return;
    }
    sendTimestamps.current = sendTimestamps.current.filter(
      (t) => sendNow - t < SEND_WINDOW_MS
    );
    if (sendTimestamps.current.length >= SEND_MAX_PER_WINDOW) {
      setSendError(
        "Rate limit: you can send at most 8 messages per minute. Try again shortly."
      );
      return;
    }

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
        const msg = error.message || "";
        if (
          /row-level security|policy|permission denied|violates/i.test(msg)
        ) {
          setSendError(
            "Message could not be delivered. This user may have blocked you or is unavailable."
          );
        } else {
          setSendError(msg);
        }
        return;
      }
      lastSendAt.current = Date.now();
      sendTimestamps.current.push(lastSendAt.current);
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
    if (!canEditMessage(msg)) return;
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
    const original = active?.messages.find((x) => x.id === editingId);
    if (original && !canEditMessage(original)) {
      setSendError("Messages can only be edited within 10 minutes of sending.");
      cancelEdit();
      return;
    }
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
    if (msg.deleted_at) return;
    setMenuMsgId(null);
    const ok = await confirm({
      title: "Delete message",
      message:
        "Delete this message? Both of you will see that it was deleted.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    setSendError(null);
    const { error } = await supabase
      .from("messages")
      .update({
        deleted_at: new Date().toISOString(),
        body: " ",
        attachment_path: null,
        attachment_type: null,
      })
      .eq("id", msg.id)
      .eq("sender_id", userId);
    if (error) {
      setSendError(error.message);
      return;
    }
    // Optional: remove attachment file but keep placeholder in thread
    if (msg.attachment_path) {
      await supabase.storage
        .from(BUCKET)
        .remove([msg.attachment_path])
        .catch(() => {});
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
      <div className="msg-empty-panel msg-empty-panel--auth">
        <div className="msg-empty-icon" aria-hidden="true">🔒</div>
        <p className="msg-empty-title">Sign in to use messages</p>
        <p className="msg-empty-copy">
          Your conversations with players and organizations live here after you sign in.
        </p>
        <Link href="/signin?redirect=/messages" className="btn btn-primary">
          Sign in
        </Link>
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
          <div className="msg-conv-search">
            <input
              type="search"
              value={convQuery}
              onChange={(e) => setConvQuery(e.target.value)}
              placeholder="Search conversations…"
              aria-label="Search conversations"
            />
          </div>
          <div id="msg-conv-list">
            {filteredConvList.length === 0 && filteredBlockedList.length === 0 ? (
              <div className="msg-empty-panel">
                {convQuery.trim() ? (
                  <>
                    <div className="msg-empty-icon" aria-hidden="true">⌕</div>
                    <p className="msg-empty-title">No matches</p>
                    <p className="msg-empty-copy">
                      Nothing matches &ldquo;{convQuery.trim()}&rdquo;. Try another name or clear the search.
                    </p>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setConvQuery("")}
                    >
                      Clear search
                    </button>
                  </>
                ) : (
                  <>
                    <div className="msg-empty-icon" aria-hidden="true">💬</div>
                    <p className="msg-empty-title">No conversations yet</p>
                    <p className="msg-empty-copy">
                      Start a chat from a Player Market listing — captains and free agents can reach out there.
                    </p>
                    <Link href="/player-market" className="btn btn-primary">
                      Browse Player Market
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <>
                {filteredConvList.map((c) => {
                  const last = c.messages[c.messages.length - 1];
                  const preview = last?.deleted_at
                    ? "Message deleted"
                    : last?.body?.trim()
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
                        {mutedIds.has(c.id) && (
                          <span className="msg-muted-tag">Muted</span>
                        )}
                        {!mutedIds.has(c.id) && c.unread > 0 && (
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
                })}
                {filteredBlockedList.length > 0 && (
                  <>
                    <div className="msg-list-head msg-list-head-blocked">
                      Blocked
                    </div>
                    {filteredBlockedList.map((c) => {
                      const last = c.messages[c.messages.length - 1];
                      return (
                        <button
                          key={c.id}
                          type="button"
                          className={`msg-conv-item is-blocked${activeId === c.id ? " is-active" : ""}`}
                          onClick={() => {
                            setActiveId(c.id);
                            setThreadOpen(true);
                          }}
                        >
                          <div className="msg-conv-name">
                            <span>{c.name}</span>
                            <span className="msg-blocked-tag">Blocked</span>
                          </div>
                          <div className="msg-conv-preview">
                            {last?.body?.trim() || "Blocked conversation"}
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="msg-thread-pane">
          {!active ? (
            <div id="msg-thread-empty" className="msg-empty">
              <div className="msg-empty-panel msg-empty-panel--thread">
                <div className="msg-empty-icon" aria-hidden="true">↗</div>
                <p className="msg-empty-title">Select a conversation</p>
                <p className="msg-empty-copy">
                  Choose someone from the list, or find players and orgs on the market.
                </p>
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
                <div className="msg-thread-head-main">
                  <div className="msg-thread-title">{active.name}</div>
                  <div className="msg-thread-sub">
                    {isOnline(active.id) ? "Online" : "Offline"}
                  </div>
                </div>
                <div className="msg-thread-actions">
                  <button
                    type="button"
                    className="msg-thread-action-btn"
                    onClick={() => setReportOpen((v) => !v)}
                  >
                    Report
                  </button>
                  {!blockedIds.has(active.id) &&
                    (mutedIds.has(active.id) ? (
                      <button
                        type="button"
                        className="msg-thread-action-btn"
                        onClick={() => unmuteUser(active.id)}
                        disabled={muteBusy}
                      >
                        {muteBusy ? "…" : "Unmute"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="msg-thread-action-btn"
                        onClick={muteUser}
                        disabled={muteBusy}
                      >
                        {muteBusy ? "…" : "Mute"}
                      </button>
                    ))}
                  {blockedIds.has(active.id) ? (
                    <button
                      type="button"
                      className="msg-thread-action-btn"
                      onClick={() => unblockUser(active.id)}
                      disabled={blockBusy}
                    >
                      {blockBusy ? "…" : "Unblock"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="msg-thread-action-btn msg-action-danger"
                      onClick={blockUser}
                      disabled={blockBusy}
                    >
                      {blockBusy ? "…" : "Block"}
                    </button>
                  )}
                </div>
              </div>
              {reportOpen && (
                <div
                  className="r3ign-confirm-overlay is-open"
                  role="presentation"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) setReportOpen(false);
                  }}
                >
                  <form
                    className="r3ign-confirm msg-report-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="msg-report-title"
                    onSubmit={submitReport}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="r3ign-confirm__title" id="msg-report-title">
                      Report {active.name}
                    </h3>
                    <p className="r3ign-confirm__message">
                      Tell us why you&apos;re reporting this user. Our team will review it.
                    </p>
                    <label className="msg-report-label" htmlFor="report-reason">
                      Reason
                    </label>
                    <select
                      id="report-reason"
                      className="msg-report-field"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      required
                    >
                      <option value="spam">Spam</option>
                      <option value="harassment">Harassment</option>
                      <option value="scam">Scam / fraud</option>
                      <option value="inappropriate">Inappropriate content</option>
                      <option value="other">Other</option>
                    </select>
                    <label className="msg-report-label" htmlFor="report-details">
                      Details (optional)
                    </label>
                    <textarea
                      id="report-details"
                      className="msg-report-field"
                      rows={3}
                      maxLength={500}
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      placeholder="Anything we should know…"
                    />
                    <div className="r3ign-confirm__actions">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setReportOpen(false)}
                        disabled={reportBusy}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={reportBusy}
                      >
                        {reportBusy ? "Sending…" : "Submit report"}
                      </button>
                    </div>
                  </form>
                </div>
              )}


              {peerTyping && !blockedIds.has(active.id) && (
                <div className="msg-typing" aria-live="polite">
                  {active.name} is typing…
                </div>
              )}
              <div className="msg-thread-body" id="msg-thread-body">
                {active.messages.length === 0 ? (
                  <div className="msg-empty-panel msg-empty-panel--inline">
                    <p className="msg-empty-title">No messages yet</p>
                    <p className="msg-empty-copy">
                      Say hello to {active.name}. Keep it professional — this is a competitive network.
                    </p>
                  </div>
                ) : (
                  active.messages.map((m) => {
                    const mine = m.sender_id === userId;
                    const isEditing = editingId === m.id;
                    const menuOpen = menuMsgId === m.id;
                    return (
                      <div
                        key={m.id}
                        className={`msg-bubble ${mine ? "mine" : "theirs"}${menuOpen ? " is-menu-open" : ""}${m.deleted_at ? " is-deleted" : ""}`}
                        onPointerDown={() => {
                          if (m.deleted_at) return;
                          onBubblePressStart(m, mine);
                        }}
                        onPointerUp={onBubblePressEnd}
                        onPointerLeave={onBubblePressEnd}
                        onPointerCancel={onBubblePressEnd}
                        onContextMenu={(e) => {
                          if (!mine || m.deleted_at) return;
                          e.preventDefault();
                          setMenuMsgId(m.id);
                        }}
                      >
                        {m.deleted_at ? (
                          <>
                            <span className="msg-bubble-text msg-deleted-text">
                              This message was deleted
                            </span>
                            <span className="msg-bubble-meta">
                              <span className="msg-bubble-time">
                                {fmtTime(m.created_at)}
                              </span>
                            </span>
                          </>
                        ) : isEditing ? (
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
                                {m.body?.trim() && !m.deleted_at ? (
                                  <LinkPreviews body={m.body} />
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
                                {canEditMessage(m) && m.body?.trim() ? (
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
                  disabled={blockedIds.has(active.id)}
                  onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  className="msg-attach-btn"
                  aria-label="Attach image"
                  title="Attach image"
                  disabled={sending || blockedIds.has(active.id)}
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
                  placeholder={
                    blockedIds.has(active.id)
                      ? "Unblock to send messages…"
                      : "Write a message…"
                  }
                  maxLength={2000}
                  value={compose}
                  onChange={(e) => {
                    setCompose(e.target.value);
                    if (e.target.value.trim()) signalTyping();
                  }}
                  disabled={sending || blockedIds.has(active.id)}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    sending ||
                    blockedIds.has(active.id) ||
                    (!compose.trim() && !file)
                  }
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
