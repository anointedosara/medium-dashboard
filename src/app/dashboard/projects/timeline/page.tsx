"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";

type ApiEvent = { id: string; action: string; detail: string; createdAt: string };

type Tag = { label: string; tone: string };
type Event = {
  id: string;
  icon: string;
  tint: string;
  color: string;
  title: string;
  time: string;
  desc: string;
  tags: Tag[];
};

/** Maps a raw activity action to an icon + colour + tag. */
function decorate(action: string): { icon: string; tint: string; color: string; tone: string } {
  const a = action.toLowerCase();
  if (a.includes("signed in") || a.includes("account created"))
    return { icon: "shield", tint: "bg-brand-100", color: "text-brand-600", tone: "brand" };
  if (a.includes("signed out"))
    return { icon: "logout", tint: "bg-slate-100", color: "text-slate-500", tone: "slate" };
  if (a.includes("project"))
    return { icon: "layers", tint: "bg-blue-100", color: "text-blue-600", tone: "blue" };
  if (a.includes("product") || a.includes("order"))
    return { icon: "cart", tint: "bg-amber-100", color: "text-amber-600", tone: "amber" };
  if (a.includes("billing") || a.includes("payment") || a.includes("plan") || a.includes("card"))
    return { icon: "dollar", tint: "bg-green-100", color: "text-green-600", tone: "green" };
  if (a.includes("profile") || a.includes("security") || a.includes("password") || a.includes("team") || a.includes("user"))
    return { icon: "user", tint: "bg-brand-100", color: "text-brand-600", tone: "brand" };
  if (a.includes("device"))
    return { icon: "shield", tint: "bg-red-100", color: "text-red-500", tone: "red" };
  if (a.includes("notification") || a.includes("message"))
    return { icon: "bell", tint: "bg-brand-100", color: "text-brand-600", tone: "brand" };
  return { icon: "clock", tint: "bg-slate-100", color: "text-slate-500", tone: "slate" };
}

function timeLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  let rel = "";
  if (diff < 60) rel = "just now";
  else if (diff < 3600) rel = `${Math.floor(diff / 60)}m ago`;
  else if (diff < 86400) rel = `${Math.floor(diff / 3600)}h ago`;
  else if (diff < 604800) rel = `${Math.floor(diff / 86400)}d ago`;
  const abs = d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  return rel ? `${abs} · ${rel}` : abs;
}

const TONES: Record<string, { light: string; dark: string }> = {
  brand: { light: "bg-brand-100 text-brand-700", dark: "bg-brand-500/30 text-brand-200" },
  blue: { light: "bg-blue-100 text-blue-700", dark: "bg-blue-500/30 text-blue-200" },
  green: { light: "bg-green-100 text-green-700", dark: "bg-green-500/30 text-green-200" },
  amber: { light: "bg-amber-100 text-amber-700", dark: "bg-amber-500/30 text-amber-200" },
  slate: { light: "bg-slate-100 text-slate-500", dark: "bg-slate-600 text-slate-300" },
  red: { light: "bg-red-500 text-white", dark: "bg-red-500 text-white" },
};

export default function TimelinePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/timeline");
        const data = await res.json();
        if (res.ok) {
          setEvents(
            (data.events as ApiEvent[]).map((e) => {
              const d = decorate(e.action);
              return {
                id: e.id,
                icon: d.icon,
                tint: d.tint,
                color: d.color,
                title: e.action,
                time: timeLabel(e.createdAt),
                desc: e.detail || "Activity on your account.",
                tags: [{ label: e.action.split(" ")[0], tone: d.tone }],
              };
            })
          );
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesQuery = [e.title, e.desc, ...e.tags.map((t) => t.label)]
        .join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesTag = !tagFilter || e.tags.some((t) => t.label === tagFilter);
      return matchesQuery && matchesTag;
    });
  }, [events, query, tagFilter]);

  async function remove(id: string) {
    setEvents((es) => es.filter((e) => e.id !== id));
    await fetch("/api/timeline", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">Your activity</h2>
          <p className="text-sm text-muted">Everything that happens on your account — sign-ins, devices, projects and more.</p>
        </div>
        <div className="flex items-center gap-3">
          {tagFilter && (
            <button onClick={() => setTagFilter(null)} className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-600">
              Filtered by {tagFilter} ✕
            </button>
          )}
          <div className="relative">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search timeline…"
              className="w-56 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Timeline events={filtered} dark={false} loading={loading} onRemove={remove} onTag={setTagFilter} />
        <Timeline events={filtered} dark loading={loading} onRemove={remove} onTag={setTagFilter} />
      </div>
    </div>
  );
}

function Timeline({
  events,
  dark,
  loading,
  onRemove,
  onTag,
}: {
  events: Event[];
  dark: boolean;
  loading: boolean;
  onRemove: (id: string) => void;
  onTag: (tag: string) => void;
}) {
  return (
    <div className={`rounded-2xl p-6 ${dark ? "bg-slate-800" : "card"}`}>
      <h3 className={`mb-6 font-semibold ${dark ? "text-white" : "text-ink"}`}>Activity timeline</h3>

      {loading && <p className={`text-sm ${dark ? "text-slate-400" : "text-muted"}`}>Loading…</p>}
      {!loading && events.length === 0 && (
        <p className={`text-sm ${dark ? "text-slate-400" : "text-muted"}`}>No activity yet — it appears here as you use your account.</p>
      )}

      <div className="relative">
        <div className={`absolute bottom-2 left-4 top-2 border-l border-dashed ${dark ? "border-slate-600" : "border-slate-200"}`} />
        <div className="space-y-6">
          {events.map((e) => (
            <div key={e.id} className="group relative flex gap-4">
              <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${e.tint} ${e.color} ${dark ? "ring-4 ring-slate-800" : "ring-4 ring-white"}`}>
                <Icon name={e.icon} size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${dark ? "text-white" : "text-ink"}`}>{e.title}</p>
                  <button
                    onClick={() => onRemove(e.id)}
                    className={`opacity-0 transition group-hover:opacity-100 ${dark ? "text-slate-400 hover:text-white" : "text-slate-300 hover:text-red-500"}`}
                    aria-label="Remove event"
                  >
                    ✕
                  </button>
                </div>
                <p className={`text-xs ${dark ? "text-slate-400" : "text-muted"}`}>{e.time}</p>
                <p className={`mt-1 text-xs ${dark ? "text-slate-300" : "text-slate-500"}`}>{e.desc}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {e.tags.map((t) => (
                    <button
                      key={t.label}
                      onClick={() => onTag(t.label)}
                      className={`rounded-md px-2 py-0.5 text-xs font-medium transition hover:opacity-80 ${(TONES[t.tone] ?? TONES.brand)[dark ? "dark" : "light"]}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
