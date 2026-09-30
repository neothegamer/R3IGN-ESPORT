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
  const onSettings = pathname.startsWith("/profile-settings");

  return (
    <span id="nav-account" className="nav-account">
      <Link
        href="/account"
        className="nav-profile-link"
        aria-label="Open my account"
      >
        <span
          className="nav-profile-avatar"
          style={
            avatarUrl ? { backgroundImage: `url('${avatarUrl}')` } : undefined
          }
        >
          {!avatarUrl ? initial : null}
        </span>
      </Link>
      <Link
        href="/messages"
        className="nav-icon-link nav-message-link"
        aria-label={
          unreadCount > 0
            ? `Open messages, ${unreadCount} unread`
            : "Open messages"
        }
        aria-current={onMessages ? "page" : undefined}
      >
        <span className="nav-message-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            focusable="false"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M8 8h8" />
            <path d="M8 12h5" />
          </svg>
        </span>
        {unreadCount > 0 && (
          <span className="nav-badge-dot" aria-hidden="true" />
        )}
      </Link>
      <Link
        href="/profile-settings"
        className="nav-icon-link nav-settings-link"
        aria-label="Open profile settings"
        aria-current={onSettings ? "page" : undefined}
      >
        <span className="nav-settings-icon" aria-hidden="true">
          {/* Simple gear — reads cleanly at 22px */}
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            focusable="false"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2" />
            <path d="M12 21v2" />
            <path d="M4.22 4.22l1.42 1.42" />
            <path d="M18.36 18.36l1.42 1.42" />
            <path d="M1 12h2" />
            <path d="M21 12h2" />
            <path d="M4.22 19.78l1.42-1.42" />
            <path d="M18.36 5.64l1.42-1.42" />
          </svg>
        </span>
      </Link>
    </span>
  );
}
