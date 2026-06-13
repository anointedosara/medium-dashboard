"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Notification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

/**
 * Polls the notifications API so the UI reflects real account activity in
 * near real time. Used by both the topbar bell and the notifications page.
 */
export function useNotifications(pollMs = 15000) {
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const lastTopId = useRef<string | null>(null);
  const [incoming, setIncoming] = useState<Notification | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications").catch(() => null);
      if (!res || !res.ok) return;
      const data = await res.json();
      const next: Notification[] = data.items ?? [];
      // Surface a freshly-arrived notification (for a live toast) — skip first load.
      if (lastTopId.current !== null && next[0] && next[0].id !== lastTopId.current) {
        setIncoming(next[0]);
      }
      if (next[0]) lastTopId.current = next[0].id;
      else lastTopId.current = "";
      setItems(next);
      setUnread(data.unread ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, pollMs);
    return () => clearInterval(t);
  }, [load, pollMs]);

  const markAllRead = useCallback(async () => {
    setItems((xs) => xs.map((n) => ({ ...n, read: true })));
    setUnread(0);
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
  }, []);

  const markRead = useCallback(async (id: string) => {
    setItems((xs) => xs.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }, []);

  const dismiss = useCallback(async (id: string) => {
    setItems((xs) => {
      const target = xs.find((n) => n.id === id);
      if (target && !target.read) setUnread((u) => Math.max(0, u - 1));
      return xs.filter((n) => n.id !== id);
    });
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }, []);

  const clearAll = useCallback(async () => {
    setItems([]);
    setUnread(0);
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
  }, []);

  return { items, unread, loading, incoming, clearIncoming: () => setIncoming(null), reload: load, markAllRead, markRead, dismiss, clearAll };
}

/** Maps a notification title to an icon + colour for display. */
export function decorateNotification(title: string): { icon: string; tint: string; color: string } {
  const a = title.toLowerCase();
  if (a.includes("signed in") || a.includes("account created")) return { icon: "shield", tint: "bg-brand-100", color: "text-brand-600" };
  if (a.includes("signed out") || a.includes("device")) return { icon: "logout", tint: "bg-slate-100", color: "text-slate-500" };
  if (a.includes("project")) return { icon: "layers", tint: "bg-blue-100", color: "text-blue-600" };
  if (a.includes("product") || a.includes("order")) return { icon: "cart", tint: "bg-amber-100", color: "text-amber-600" };
  if (a.includes("billing") || a.includes("payment") || a.includes("plan") || a.includes("card") || a.includes("invoice")) return { icon: "dollar", tint: "bg-green-100", color: "text-green-600" };
  if (a.includes("profile") || a.includes("security") || a.includes("password") || a.includes("team") || a.includes("user")) return { icon: "user", tint: "bg-brand-100", color: "text-brand-600" };
  if (a.includes("message") || a.includes("notification")) return { icon: "bell", tint: "bg-brand-100", color: "text-brand-600" };
  return { icon: "clock", tint: "bg-slate-100", color: "text-slate-500" };
}

export function timeAgo(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
