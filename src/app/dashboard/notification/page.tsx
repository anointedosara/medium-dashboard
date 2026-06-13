"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useNotifications, decorateNotification, timeAgo } from "@/components/dashboard/useNotifications";

export default function NotificationPage() {
  const { items, unread, loading, incoming, clearIncoming, markAllRead, markRead, dismiss, clearAll } = useNotifications();

  // Auto-hide the live "new notification" toast.
  useEffect(() => {
    if (!incoming) return;
    const t = setTimeout(clearIncoming, 4000);
    return () => clearTimeout(t);
  }, [incoming, clearIncoming]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card className="!p-0">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
              Notifications
              {unread > 0 && (
                <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">{unread} new</span>
              )}
            </h3>
            <p className="text-sm text-muted">Live updates from your account activity.</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <button onClick={markAllRead} disabled={unread === 0} className="font-medium text-brand-600 disabled:text-slate-300">Mark all read</button>
            <button onClick={clearAll} disabled={items.length === 0} className="font-medium text-slate-400 hover:text-red-500 disabled:text-slate-200">Clear all</button>
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {loading && <p className="p-6 text-sm text-muted">Loading…</p>}
          {!loading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 p-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Icon name="bell" size={22} />
              </span>
              <p className="text-sm font-medium text-ink">You&apos;re all caught up</p>
              <p className="max-w-xs text-sm text-muted">Notifications appear here as you use the app — signing in, creating projects, changing your plan, and more.</p>
            </div>
          )}

          {items.map((n) => {
            const d = decorateNotification(n.title);
            return (
              <div
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={`group flex cursor-pointer items-start gap-3 p-4 transition hover:bg-slate-50/70 ${n.read ? "" : "bg-brand-50/40"}`}
              >
                <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${d.tint} ${d.color}`}>
                  <Icon name={d.icon} size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-ink">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                  </div>
                  {n.body && <p className="truncate text-sm text-muted">{n.body}</p>}
                  <p className="mt-0.5 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                  className="shrink-0 text-slate-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {incoming && (
        <div className="fixed bottom-6 right-6 z-50 flex max-w-xs animate-fade-in items-start gap-3 rounded-xl bg-white p-4 shadow-xl ring-1 ring-slate-100">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
            <Icon name="bell" size={16} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{incoming.title}</p>
            {incoming.body && <p className="truncate text-xs text-muted">{incoming.body}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
