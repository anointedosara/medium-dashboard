"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Icon } from "@/components/Icon";
import { useNotifications, decorateNotification, timeAgo } from "./useNotifications";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/analytics": "Analytics",
  "/dashboard/profile": "Profile/Profile overview",
  "/dashboard/profile/teams": "Profile/Teams",
  "/dashboard/profile/projects": "Profile/All projects",
  "/dashboard/users/reports": "Users/Reports",
  "/dashboard/users/new": "Users/New User",
  "/dashboard/account/settings": "Account/Setting",
  "/dashboard/account/billing": "Account/Billing",
  "/dashboard/account/invoice": "Account/Invoice",
  "/dashboard/account/security": "Account/Security",
  "/dashboard/projects/general": "Project/General",
  "/dashboard/projects/timeline": "Project/Timeline",
  "/dashboard/projects/new": "Project/New project",
  "/dashboard/pricing": "Pricing page",
  "/dashboard/charts": "Chart",
  "/dashboard/notification": "Notification",
  "/dashboard/chat": "Chat",
  "/dashboard/apps/kanban": "Kanban",
  "/dashboard/apps/wizard": "Wizard",
  "/dashboard/apps/data-tables": "Data tables",
  "/dashboard/apps/calendar": "Calendar",
  "/dashboard/ecommerce/overview": "Overview",
  "/dashboard/ecommerce/products/new": "New Product",
  "/dashboard/ecommerce/products/edit": "Edit Product",
  "/dashboard/ecommerce/products/list": "Product List",
  "/dashboard/ecommerce/orders/list": "Order List",
  "/dashboard/ecommerce/orders/detail": "Order Detail",
};

function titleFromPath(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  const parts = pathname.split("/").filter((p) => p && p !== "dashboard");
  if (parts.length === 0) return "Dashboard";
  return parts
    .map((p) => p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" / ");
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      {/* Desktop sidebar */}
      <div className="hidden border-r border-slate-100 lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full animate-fade-in shadow-xl">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={titleFromPath(pathname)} onMenu={() => setMobileOpen(true)} />
        <main className="scroll-thin flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}

function Topbar({ title, onMenu }: { title: string; onMenu: () => void }) {
  return (
    <header className="flex items-center gap-3 px-4 py-4 sm:px-6">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-slate-600 hover:bg-white lg:hidden"
        aria-label="Open menu"
      >
        <Icon name="menu" />
      </button>
      <h1 className="text-lg font-bold text-brand-600 sm:text-xl">{title}</h1>
      <div className="ml-auto hidden flex-1 justify-center px-6 md:flex">
        <div className="relative w-full max-w-md">
          <Icon
            name="search"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            placeholder="Search anything here..."
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>
      <div className="ml-auto md:ml-0">
        <NotificationBell />
      </div>
    </header>
  );
}

function NotificationBell() {
  const { items, unread, markAllRead, markRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => {
          const next = !open;
          setOpen(next);
          // Opening the notifications clears the unread signal.
          if (next && unread > 0) markAllRead();
        }}
        className="relative rounded-full p-2 text-slate-600 transition hover:bg-white"
        aria-label="Notifications"
      >
        <Icon name="bell" size={20} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-ink">Notifications</p>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs font-medium text-brand-600">Mark all read</button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted">No notifications yet.</p>}
              {items.slice(0, 8).map((n) => {
                const d = decorateNotification(n.title);
                return (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${n.read ? "" : "bg-brand-50/40"}`}
                  >
                    <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${d.tint} ${d.color}`}>
                      <Icon name={d.icon} size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{n.title}</span>
                      {n.body && <span className="block truncate text-xs text-muted">{n.body}</span>}
                      <span className="mt-0.5 block text-[11px] text-slate-400">{timeAgo(n.createdAt)}</span>
                    </span>
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                  </button>
                );
              })}
            </div>
            <Link
              href="/dashboard/notification"
              onClick={() => setOpen(false)}
              className="block border-t border-slate-100 px-4 py-3 text-center text-sm font-medium text-brand-600 hover:bg-slate-50"
            >
              View all notifications
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
