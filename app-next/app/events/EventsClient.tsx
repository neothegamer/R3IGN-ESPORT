"use client";

import { useState, useEffect } from "react";

type EventItem = {
  id: string;
  title: string;
  description: string;
  league: string;
  location: string;
  start_time: string;
  end_time?: string;
};

const LEAGUE_LABEL: Record<string, string> = {
  rcml: "RCML · COD Mobile",
  rfcl: "RFCL · Free Fire",
  rbsl: "RBSL · Blood Strike",
};

function pad(n: number) {
  return n < 10 ? "0" + n : "" + n;
}

function toICSDate(d: Date) {
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeICS(text: string) {
  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function downloadICS(ev: EventItem) {
  const start = new Date(ev.start_time);
  const end = ev.end_time
    ? new Date(ev.end_time)
    : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//R3IGN//Events//EN",
    "BEGIN:VEVENT",
    "UID:" + (ev.id || Math.random().toString(36).slice(2)) + "@r3ignesports.gg",
    "DTSTAMP:" + toICSDate(new Date()),
    "DTSTART:" + toICSDate(start),
    "DTEND:" + toICSDate(end),
    "SUMMARY:" + escapeICS(ev.title),
    "DESCRIPTION:" + escapeICS(ev.description || ""),
    "LOCATION:" + escapeICS(ev.location || ""),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    (ev.title || "event").replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function googleCalendarUrl(ev: EventItem) {
  const start = new Date(ev.start_time);
  const end = ev.end_time
    ? new Date(ev.end_time)
    : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title || "",
    dates: toICSDate(start) + "/" + toICSDate(end),
    details: ev.description || "",
    location: ev.location || "",
  });
  return "https://calendar.google.com/calendar/render?" + params.toString();
}

function sampleUpcoming(): EventItem[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  return [
    {
      id: "sample-1",
      title: "RCML Season 4 — Division 1 Match Night",
      description:
        "Live Division 1 matches with kill tracking and standings updates.",
      league: "rcml",
      location: "Online",
      start_time: new Date(now + 3 * day).toISOString(),
      end_time: new Date(now + 3 * day + 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "sample-2",
      title: "RFCL — Open Registration",
      description:
        "Registration window is open for the inaugural Free Fire Clash Squad season.",
      league: "rfcl",
      location: "Online",
      start_time: new Date(now + 1 * day).toISOString(),
      end_time: new Date(now + 1 * day + 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "sample-3",
      title: "RBSL Season 1 — Registration Deadline",
      description:
        "Last day for organizations to register a Blood Strike roster for Season 1.",
      league: "rbsl",
      location: "Online",
      start_time: new Date(now + 8 * day).toISOString(),
    },
  ];
}

function sampleOngoing(): EventItem[] {
  const now = Date.now();
  const hr = 60 * 60 * 1000;
  return [
    {
      id: "ongoing-sample-1",
      title: "RCML Season 4 — Division 1, Week 6",
      description:
        "Live matches in progress — standings updating in real time.",
      league: "rcml",
      location: "Online",
      start_time: new Date(now - 1 * hr).toISOString(),
      end_time: new Date(now + 1 * hr).toISOString(),
    },
  ];
}

function EventCard({
  ev,
  showLiveBadge,
}: {
  ev: EventItem;
  showLiveBadge?: boolean;
}) {
  const start = new Date(ev.start_time);
  const dateLabel =
    start.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " · " +
    start.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="event-card">
      <div className="event-date">{dateLabel}</div>
      <h3>
        {ev.title}
        {showLiveBadge && (
          <span
            className="stamp stamp-live"
            style={{ marginLeft: "0.6rem" }}
          >
            Live Now
          </span>
        )}
      </h3>
      <p>{ev.description}</p>
      <div className="event-meta">
        {ev.league && LEAGUE_LABEL[ev.league] && (
          <span>{LEAGUE_LABEL[ev.league]}</span>
        )}
        {ev.location && <span>{ev.location}</span>}
      </div>
      <div className="event-actions">
        <button
          className="btn btn-ghost btn-add-cal"
          onClick={() => downloadICS(ev)}
        >
          Add to Calendar
        </button>
        <a
          className="btn btn-ghost"
          href={googleCalendarUrl(ev)}
          target="_blank"
          rel="noopener"
        >
          Google Calendar
        </a>
      </div>
    </div>
  );
}

export default function EventsClient() {
  const [tab, setTab] = useState<"upcoming" | "ongoing">("upcoming");
  const [upcoming, setUpcoming] = useState<EventItem[]>([]);
  const [ongoing, setOngoing] = useState<EventItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUpcoming(sampleUpcoming());
    setOngoing(sampleOngoing());
    setReady(true);
  }, []);

  return (
    <>
      <div className="filter-bar" role="tablist" aria-label="Events view">
        <button
          className="filter-chip"
          aria-pressed={tab === "upcoming"}
          role="tab"
          onClick={() => setTab("upcoming")}
        >
          Upcoming Events
        </button>
        <button
          className="filter-chip"
          aria-pressed={tab === "ongoing"}
          role="tab"
          onClick={() => setTab("ongoing")}
        >
          Ongoing Events
        </button>
      </div>

      {!ready && (
        <p className="field-hint" style={{ marginTop: "1.5rem" }}>
          Loading events…
        </p>
      )}

      {ready && tab === "upcoming" && (
        <div>
          <div className="events-grid">
            {upcoming.map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
            <p className="field-hint" style={{ gridColumn: "1 / -1" }}>
              Sample schedule shown — connect Supabase and post real events
              from the Admin page for live dates.
            </p>
          </div>
        </div>
      )}

      {ready && tab === "ongoing" && (
        <div>
          <div className="events-grid">
            {ongoing.length === 0 ? (
              <p
                className="field-hint center"
                style={{ marginTop: "1.5rem" }}
              >
                Nothing is live right now — check Upcoming Events above.
              </p>
            ) : (
              ongoing.map((ev) => (
                <EventCard key={ev.id} ev={ev} showLiveBadge />
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}