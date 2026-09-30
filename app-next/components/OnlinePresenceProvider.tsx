"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

type OnlineCtx = {
  onlineIds: Set<string>;
  isOnline: (userId: string | null | undefined) => boolean;
};

const OnlinePresenceContext = createContext<OnlineCtx>({
  onlineIds: new Set(),
  isOnline: () => false,
});

export function useOnlinePresence() {
  return useContext(OnlinePresenceContext);
}

/**
 * Tracks signed-in users on channel `r3ign-online` for the whole app
 * (any page, not only /messages).
 */
export default function OnlinePresenceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createClient();
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const [selfId, setSelfId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let beat: ReturnType<typeof setInterval> | null = null;

    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      if (cancelled) return;
      setSelfId(uid);
      if (!uid) {
        setOnlineIds(new Set());
        return;
      }

      channel = supabase.channel("r3ign-online", {
        config: { presence: { key: uid } },
      });

      const syncOnline = () => {
        if (!channel) return;
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
        ids.add(uid);
        setOnlineIds(ids);
      };

      channel
        .on("presence", { event: "sync" }, syncOnline)
        .on("presence", { event: "join" }, syncOnline)
        .on("presence", { event: "leave" }, syncOnline);

      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED" && channel) {
          await channel.track({
            user_id: uid,
            online_at: new Date().toISOString(),
          });
          syncOnline();
        }
      });

      beat = setInterval(() => {
        channel?.track({
          user_id: uid,
          online_at: new Date().toISOString(),
        });
      }, 30000);

      // Re-bind when auth changes
      const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
        const next = session?.user?.id ?? null;
        setSelfId(next);
        if (!next) {
          setOnlineIds(new Set());
          if (channel) {
            await supabase.removeChannel(channel);
            channel = null;
          }
          return;
        }
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          // channel already up for same user; re-track
          await channel?.track({
            user_id: next,
            online_at: new Date().toISOString(),
          });
        }
      });

      // store unsubscribe on cleanup via cancelled flag
      (channel as unknown as { __unsub?: () => void }).__unsub = () => {
        sub.subscription.unsubscribe();
      };
    })();

    return () => {
      cancelled = true;
      if (beat) clearInterval(beat);
      if (channel) {
        const unsub = (channel as unknown as { __unsub?: () => void }).__unsub;
        unsub?.();
        supabase.removeChannel(channel);
      }
    };
  }, [supabase]);

  const value = useMemo<OnlineCtx>(
    () => ({
      onlineIds,
      isOnline: (userId) => !!userId && onlineIds.has(userId),
    }),
    [onlineIds]
  );

  // silence unused selfId warning in some builds
  void selfId;

  return (
    <OnlinePresenceContext.Provider value={value}>
      {children}
    </OnlinePresenceContext.Provider>
  );
}
