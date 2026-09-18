"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  initial: string;
  avatarUrl: string | null;
  unreadCount: number;
};

export default function NavAccountClient({
  initial,
  avatarUrl,
  unreadCount,
}: Props) {
  const pathname = usePathname();
  const onMessages = pathname.startsWith("/messages");

  return (
    <span id="nav-account" className="nav-account">
      <Link href="/account" className="nav-profile-link" aria-label="Open my account">
        <span
          className="nav-profile-avatar"
          style={avatarUrl ? { backgroundImage: `url('${avatarUrl}')` } : undefined}
        >
          {!avatarUrl ? initial : null}
        </span>
      </Link>
      <Link
        href="/messages"
        className="nav-icon-link nav-message-link"
        aria-label="Open messages"
        aria-current={onMessages ? "page" : undefined}
      >
        <span className="nav-message-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"></path>
          </svg>
        </span>
        {unreadCount > 0 && (
          <span className="nav-badge-dot" aria-label={`${unreadCount} unread messages`} />
        )}
      </Link>
      <Link
        href="/profile-settings"
        className="nav-icon-link nav-settings-link"
        aria-label="Open profile settings"
      >
        <span aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M12 3.5l1 1.9 2.1.5 1.8-1 1.4 1.4-1 1.8.5 2.1 1.9 1v2l-1.9 1-.5 2.1 1 1.8-1.4 1.4-1.8-1-2.1.5-1 1.9h-2l-1-1.9-2.1-.5-1.8 1-1.4-1.4 1-1.8-.5-2.1-1.9-1v-2l1.9-1 .5-2.1-1-1.8 1.4-1.4 1.8 1 2.1-.5 1-1.9h2zM14.8 12a2.8 2.8 0 1 1-5.6 0 2.8 2.8 0 0 1 5.6 0z"></path>
          </svg>
        </span>
      </Link>
    </span>
  );
}
