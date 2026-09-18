import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NavAccountClient from "./NavAccountClient";

/** Server component — session read on the server, no client redirect flash. */
export default async function NavAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <span id="nav-account" className="nav-account">
        <Link href="/signin" className="btn">
          Sign In
        </Link>
      </span>
    );
  }

  const displayName =
    (user.user_metadata?.display_name as string | undefined) ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email ||
    "Account";
  const initial = displayName.charAt(0).toUpperCase();

  let avatarUrl: string | null =
    (user.user_metadata?.avatar_url as string | undefined) || null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.avatar_url) avatarUrl = profile.avatar_url;

  let unreadCount = 0;
  try {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .is("read_at", null);
    unreadCount = count ?? 0;
  } catch {
    // best-effort
  }

  return (
    <NavAccountClient
      initial={initial}
      avatarUrl={avatarUrl}
      unreadCount={unreadCount}
    />
  );
}
