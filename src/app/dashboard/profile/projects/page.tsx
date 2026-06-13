"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useResource, type Item } from "@/components/dashboard/useResource";
import { useUser } from "@/components/dashboard/UserProvider";
import { avatarFor } from "@/lib/assets";

const TILE_COLORS = ["#fb7185", "#6366f1", "#f59e0b", "#22c55e", "#7c47ff", "#06b6d4"];
function tileColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

const TABS = ["App", "Messages", "Settings"];

export default function AllProjectsPage() {
  const { items, loading, remove } = useResource("projects");
  const { user } = useUser();
  const [tab, setTab] = useState("App");

  return (
    <Card className="!p-0">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={user?.avatar || avatarFor(user?.email || "u")} alt="" className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="text-sm font-semibold text-ink">{user?.fullName}</p>
            <p className="text-xs text-muted">{user?.role || "Public Relations"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                tab === t ? "bg-brand-600 text-white" : "border border-brand-200 text-brand-600 hover:bg-brand-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Banner */}
      <div className="bg-slate-50 px-5 py-3">
        <p className="font-medium text-slate-600">Some of Our Awesome projects</p>
      </div>

      {/* Grid */}
      <div className="grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading && <p className="text-sm text-muted">Loading…</p>}
        {items.map((p) => (
          <ProjectCard key={p._id} project={p} onRemove={() => remove(p._id)} />
        ))}

        <Link
          href="/dashboard/projects/new"
          className="flex min-h-[200px] items-center justify-center rounded-xl border border-slate-200 text-muted transition hover:border-brand-300 hover:text-brand-600"
        >
          New project
        </Link>
      </div>
    </Card>
  );
}

function ProjectCard({ project, onRemove }: { project: Item; onRemove: () => void }) {
  const [menu, setMenu] = useState(false);
  const name = String(project.name);
  const color = tileColor(name);

  return (
    <div className="relative rounded-xl border border-slate-100 p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md">
      <div className="absolute right-3 top-3 z-20">
        <button onClick={() => setMenu(!menu)} className="px-1 text-slate-400 hover:text-ink">⋮</button>
        {menu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
            <div className="absolute right-0 z-20 mt-1 w-28 rounded-lg bg-white p-1 shadow-lg ring-1 ring-slate-100">
              <Link href={`/dashboard/projects/${project._id}`} className="block w-full rounded px-3 py-1.5 text-left text-sm text-slate-600 hover:bg-slate-50">View</Link>
              <button onClick={onRemove} className="block w-full rounded px-3 py-1.5 text-left text-sm text-red-500 hover:bg-red-50">Remove</button>
            </div>
          </>
        )}
      </div>

      <Link href={`/dashboard/projects/${project._id}`} className="block">
        <div className="flex items-center gap-3 pr-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ background: color }}>
            {name.slice(0, 1).toUpperCase()}
          </span>
          <p className="font-semibold text-ink">{name}</p>
        </div>

        <div className="mt-3 flex -space-x-2">
          {[0, 1, 2, 3].map((i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={avatarFor(name + i)} alt="" className="h-6 w-6 rounded-full object-cover ring-2 ring-white" />
          ))}
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-muted">{String(project.desc ?? "")}</p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <div>
            <p className="text-sm font-semibold text-ink">{String(project.participants ?? 0)}</p>
            <p className="text-xs text-muted">Participants</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-ink">{formatDue(project.due)}</p>
            <p className="text-xs text-muted">Due date</p>
          </div>
        </div>
      </Link>
    </div>
  );
}

function formatDue(due: unknown): string {
  if (!due) return "—";
  const s = String(due);
  // Render YYYY-MM-DD as DD.MM.YY to match the design.
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}.${m[2]}.${m[1].slice(2)}` : s;
}
