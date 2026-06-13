"use client";

import { useMemo, useState } from "react";
import { Card, Avatar } from "@/components/ui";
import { useResource } from "@/components/dashboard/useResource";

type Row = { name: string; position: string; age: number | string; office: string; salary: number; start: string; avatar?: string };

const DEMO: Row[] = [
  { name: "Tiger Nixon", position: "System Architect", age: 61, office: "Tokyo", salary: 170750, start: "22/5/2009" },
  { name: "Garrett Winters", position: "Accountant", age: 63, office: "San Francisco", salary: 433060, start: "22/5/2011" },
  { name: "Ashton Cox", position: "Technical Author", age: 66, office: "Edinburgh", salary: 320800, start: "25/5/2011" },
  { name: "Tiger Nixon", position: "Javascript Developer", age: 22, office: "Tokyo", salary: 170750, start: "22/5/2012" },
  { name: "Cedric Kelly", position: "Integration Specialist", age: 31, office: "New York", salary: 86000, start: "22/5/2012" },
  { name: "Airi Satou", position: "Sales Assistant", age: 45, office: "Edinburgh", salary: 433060, start: "30/5/2009" },
  { name: "Brielle Williamson", position: "Integration Specialist", age: 19, office: "Berlin", salary: 162700, start: "22/5/2015" },
  { name: "Herrod Chandler", position: "Javascript Developer", age: 61, office: "Islamabad", salary: 372000, start: "28/5/2016" },
  { name: "Rhona Davidson", position: "Software Engineer", age: 59, office: "Delhi", salary: 137500, start: "22/5/2006" },
  { name: "Colleen Hurst", position: "Accountant", age: 55, office: "London", salary: 327900, start: "21/5/2008" },
  { name: "Sonya Frost", position: "Sales Assistant", age: 41, office: "Karachi", salary: 205500, start: "22/5/2010" },
  { name: "Ashton Cox", position: "Technical Author", age: 36, office: "New York", salary: 103600, start: "21/5/2013" },
];

type Key = "name" | "position" | "age" | "office" | "salary" | "start";

export default function DataTablesPage() {
  const { items } = useResource("people");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: "name", dir: 1 });

  // Wizard-created people (newest first) prepended to the demo rows.
  const all: Row[] = useMemo(() => {
    const added = items.map((p) => ({
      name: String(p.name || "—"),
      position: String(p.position || "Member"),
      age: (p.age as number) ?? "—",
      office: String(p.office || "—"),
      salary: Number(p.salary ?? 0),
      start: String(p.start || "—"),
      avatar: String(p.avatar || ""),
    }));
    return [...added, ...DEMO];
  }, [items]);

  const rows = useMemo(() => {
    const filtered = all.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(q.toLowerCase()))
    );
    return filtered.sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      return (av < bv ? -1 : av > bv ? 1 : 0) * sort.dir;
    });
  }, [all, q, sort]);

  const head: [Key, string][] = [["name", "Name"], ["position", "Position"], ["age", "Age"], ["office", "Office"], ["salary", "Salary"], ["start", "Start date"]];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-ink">Data tables</h2>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100" />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-muted">
              {head.map(([key, label]) => (
                <th key={key} className="cursor-pointer select-none py-3 font-medium hover:text-ink" onClick={() => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1 }))}>
                  {label} {sort.key === key ? (sort.dir === 1 ? "▲" : "▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-slate-50">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <Avatar seed={r.name} src={r.avatar || undefined} size={32} />
                    <span className="font-medium text-ink">{r.name}</span>
                  </div>
                </td>
                <td className="py-3 text-muted">{r.position}</td>
                <td className="py-3 text-muted">{r.age}</td>
                <td className="py-3 text-muted">{r.office}</td>
                <td className="py-3 text-muted">${Number(r.salary).toLocaleString()}</td>
                <td className="py-3 text-muted">{r.start}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted">No matching records.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
