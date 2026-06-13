"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Badge } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useResource, type Item } from "@/components/dashboard/useResource";
import { avatarFor } from "@/lib/assets";

type SortKey = "name" | "participants" | "due";

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}
function progressOf(p: Item) {
  return 10 + (hash(p._id) % 91); // stable 10–100
}
function statusOf(progress: number) {
  if (progress >= 100) return { label: "Completed", tone: "green" };
  if (progress >= 45) return { label: "In progress", tone: "brand" };
  return { label: "Planning", tone: "amber" };
}

export default function GeneralProjectsPage() {
  const { items, loading, remove } = useResource("projects");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "due", dir: 1 });

  const rows = useMemo(() => {
    const filtered = items.filter((p) =>
      [p.name, p.tag, p.desc].some((v) => String(v ?? "").toLowerCase().includes(query.toLowerCase()))
    );
    return filtered.sort((a, b) => {
      const av = a[sort.key] as never, bv = b[sort.key] as never;
      return (av < bv ? -1 : av > bv ? 1 : 0) * sort.dir;
    });
  }, [items, query, sort]);

  const totalParticipants = items.reduce((s, p) => s + Number(p.participants ?? 0), 0);
  const tags = new Set(items.map((p) => String(p.tag ?? ""))).size;
  const avgProgress = items.length ? Math.round(items.reduce((s, p) => s + progressOf(p), 0) / items.length) : 0;

  function setSortKey(key: SortKey) {
    setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1 }));
  }

  const head: [SortKey | null, string][] = [
    ["name", "Project"], [null, "Tag"], ["participants", "Participants"],
    [null, "Progress"], [null, "Status"], ["due", "Due date"], [null, ""],
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-ink">Projects overview</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              className="w-48 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 sm:w-60"
            />
          </div>
          <Link href="/dashboard/projects/new" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            + New
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard icon="layers" label="Total projects" value={String(items.length)} accent="brand" />
        <SummaryCard icon="users" label="Participants" value={String(totalParticipants)} accent="blue" />
        <SummaryCard icon="tag" label="Active tags" value={String(tags)} accent="amber" />
        <SummaryCard icon="chart" label="Avg progress" value={`${avgProgress}%`} accent="green" />
      </div>

      <Card className="overflow-x-auto">
        {loading && <p className="text-sm text-muted">Loading…</p>}
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-muted">
              {head.map(([key, label], i) => (
                <th
                  key={i}
                  onClick={() => key && setSortKey(key)}
                  className={`py-3 font-medium ${key ? "cursor-pointer select-none hover:text-ink" : ""}`}
                >
                  {label} {key && sort.key === key ? (sort.dir === 1 ? "▲" : "▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const progress = Math.min(100, progressOf(p));
              const status = statusOf(progress);
              const count = Number(p.participants ?? 0);
              return (
                <tr
                  key={p._id}
                  onClick={() => router.push(`/dashboard/projects/${p._id}`)}
                  className="cursor-pointer border-b border-slate-50 transition hover:bg-slate-50/60"
                >
                  <td className="py-3">
                    <p className="font-medium text-ink">{String(p.name)}</p>
                    <p className="line-clamp-1 max-w-[220px] text-xs text-muted">{String(p.desc ?? "")}</p>
                  </td>
                  <td className="py-3"><Badge>{String(p.tag ?? "Project")}</Badge></td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {Array.from({ length: Math.min(3, count) }).map((_, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={i} src={avatarFor(String(p.name) + i)} alt="" className="h-6 w-6 rounded-full object-cover ring-2 ring-white" />
                        ))}
                      </div>
                      <span className="text-muted">{count}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-slate-100">
                        <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-muted">{progress}%</span>
                    </div>
                  </td>
                  <td className="py-3"><Badge tone={status.tone}>{status.label}</Badge></td>
                  <td className="py-3 text-muted">{String(p.due ?? "—")}</td>
                  <td className="py-3 text-right">
                    <button onClick={(e) => { e.stopPropagation(); remove(p._id); }} className="text-xs text-slate-400 hover:text-red-500">Delete</button>
                  </td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-muted">{query ? "No projects match your search." : "No projects yet."}</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function SummaryCard({ icon, label, value, accent }: { icon: string; label: string; value: string; accent: string }) {
  const accents: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600",
  };
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accents[accent]}`}>
        <Icon name={icon} size={18} />
      </span>
      <div>
        <p className="text-lg font-bold text-ink">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}
