"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { NAV, type NavGroup } from "@/lib/nav";
import { Icon } from "@/components/Icon";
import { BrandLogo } from "@/components/BrandLogo";
import { useUser } from "./UserProvider";
import { avatarFor } from "@/lib/assets";

function isActive(href: string, pathname: string) {
  // Exact match so only the current page is highlighted (a parent route like
  // /dashboard/profile must not light up when on /dashboard/profile/teams).
  return pathname === href;
}

function groupContainsActive(group: NavGroup, pathname: string): boolean {
  return (group.children ?? []).some((c) =>
    "href" in c
      ? isActive(c.href, pathname)
      : c.children.some((l) => isActive(l.href, pathname))
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV.forEach((g) => {
      if (groupContainsActive(g, pathname)) initial[g.label] = true;
    });
    return initial;
  });

  const toggle = (label: string) =>
    setOpen((o) => ({ ...o, [label]: !o[label] }));

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-64 flex-col bg-white">
      <div className="flex items-center justify-center py-6">
        <BrandLogo size={48} />
      </div>

      <nav className="scroll-thin flex-1 overflow-y-auto px-3 pb-6">
        {NAV.map((group) => {
          const expanded = open[group.label];
          const active = groupContainsActive(group, pathname);
          return (
            <div key={group.label} className="mb-1">
              <button
                onClick={() => toggle(group.label)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon name={group.icon} size={18} />
                <span className="flex-1 text-left">{group.label}</span>
                <Icon
                  name="chevron"
                  size={16}
                  className={`transition-transform ${expanded ? "rotate-90" : ""}`}
                />
              </button>

              {expanded && (
                <div className="mt-1 space-y-0.5 pl-4">
                  {(group.children ?? []).map((child) =>
                    "href" in child ? (
                      child.href === "/logout" ? (
                        <button
                          key={child.href}
                          onClick={logout}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-500 transition hover:bg-red-50"
                        >
                          <Icon name="logout" size={16} /> {child.label}
                        </button>
                      ) : (
                        <SidebarLink
                          key={child.href}
                          href={child.href}
                          label={child.label}
                          active={isActive(child.href, pathname)}
                          onNavigate={onNavigate}
                        />
                      )
                    ) : (
                      <SubGroup
                        key={child.label}
                        label={child.label}
                        links={child.children}
                        pathname={pathname}
                        onNavigate={onNavigate}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <SidebarUser />
    </aside>
  );
}

function SidebarUser() {
  const { user } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  const avatar = user.avatar || avatarFor(user.email);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative p-3">
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-16 left-3 right-3 z-20 animate-fade-in rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-100">
            <Link href="/dashboard/profile" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
              My profile
            </Link>
            <Link href="/dashboard/account/settings" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
              Settings
            </Link>
            <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50">
              <Icon name="logout" size={16} /> Sign out
            </button>
          </div>
        </>
      )}
      <div className="flex items-center gap-2.5 rounded-2xl bg-brand-600 p-2 pr-3 text-white">
        <span className="rounded-full p-0.5 ring-2 ring-pink-400">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{user.fullName}</p>
          <p className="truncate text-[11px] leading-tight text-white/70">{user.email}</p>
        </div>
        <button onClick={() => setOpen(!open)} className="shrink-0 text-white/80 hover:text-white" aria-label="User menu">
          ⋮
        </button>
      </div>
    </div>
  );
}

function SubGroup({
  label,
  links,
  pathname,
  onNavigate,
}: {
  label: string;
  links: { label: string; href: string }[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const hasActive = links.some((l) => isActive(l.href, pathname));
  const [open, setOpen] = useState(hasActive);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
          hasActive ? "text-brand-700" : "text-slate-500 hover:text-ink"
        }`}
      >
        <span className="flex-1 text-left">{label}</span>
        <Icon name="chevron" size={14} className={`transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="space-y-0.5 border-l border-slate-100 pl-3">
          {links.map((l) => (
            <SidebarLink
              key={l.href}
              href={l.href}
              label={l.label}
              active={isActive(l.href, pathname)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarLink({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`block rounded-lg px-3 py-2 text-sm transition ${
        active ? "font-medium text-brand-600" : "text-slate-500 hover:bg-slate-50 hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}
