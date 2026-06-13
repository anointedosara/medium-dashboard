"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { avatarFor } from "@/lib/assets";
import { useResource, type Item } from "@/components/dashboard/useResource";

type Task = Item & {
  title: string;
  column: string;
  days: number;
  team: string;
  attach: number;
  comments: number;
  members: number;
};

const COLUMNS = [
  { key: "todo", name: "To Do task" },
  { key: "progress", name: "In Progress" },
  { key: "review", name: "In Review" },
];

export default function KanbanPage() {
  const { items, loading, create, update, remove } = useResource("tasks");
  const tasks = items as Task[];

  const [dragged, setDragged] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filterOn, setFilterOn] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const view = useMemo(() => {
    return COLUMNS.map((c) => {
      let colTasks = tasks.filter(
        (t) => t.column === c.key && (String(t.title) + String(t.team)).toLowerCase().includes(query.toLowerCase())
      );
      if (filterOn) colTasks = [...colTasks].sort((a, b) => Number(a.days) - Number(b.days));
      return { ...c, tasks: colTasks };
    });
  }, [tasks, query, filterOn]);

  async function drop(toKey: string) {
    if (!dragged) return;
    const task = tasks.find((t) => t._id === dragged);
    setDragged(null);
    if (task && task.column !== toKey) await update(task._id, { column: toKey });
  }

  function openComposer(key: string) {
    setAdding((cur) => (cur === key ? null : key));
    setNewTitle("");
  }

  async function addCard(key: string) {
    const title = newTitle.trim();
    if (!title) return;
    setAdding(null);
    setNewTitle("");
    await create({ title, column: key, days: 7, team: "My Team", attach: 0, comments: 0, members: 1 });
  }

  async function removeCard(id: string) {
    await remove(id);
  }

  async function addMember(t: Task) {
    await update(t._id, { members: Math.min(8, Number(t.members) + 1) });
  }

  return (
    <Card>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-ink">Overview</h2>
          <p className="text-sm text-muted">Edit or modify all card as you want</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted sm:inline">Teams Members:</span>
          <div className="flex -space-x-2">
            {["t1", "t2", "t3", "t4"].map((s) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={s} src={avatarFor(s)} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-white" />
            ))}
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white" aria-label="Share">
            <Icon name="share" size={14} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects" className="w-full min-w-0 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 sm:w-52" />
          </div>
          <button className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 sm:flex">
            <Icon name="calendar" size={16} className="text-muted" /> 12 Apr, 2021 <Icon name="chevron" size={14} className="rotate-90 text-muted" />
          </button>
        </div>
        <button onClick={() => setFilterOn(!filterOn)} className={`flex items-center gap-2 text-sm font-medium ${filterOn ? "text-brand-600" : "text-slate-600"}`}>
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${filterOn ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-600"}`}>
            <Icon name="filter" size={14} />
          </span>
          Apply Filter
        </button>
      </div>

      {loading && <p className="text-sm text-muted">Loading…</p>}

      {/* Columns */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {view.map((col, ci) => (
          <div
            key={col.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => drop(col.key)}
            className="rounded-2xl bg-slate-50/70 p-3"
          >
            <div className={`mb-3 flex items-center justify-between rounded-lg border-t-2 bg-white px-3 py-2.5 ${ci === 0 ? "border-slate-300" : "border-brand-500"}`}>
              <h3 className="text-sm font-semibold text-ink">{col.name}</h3>
              <button onClick={() => openComposer(col.key)} className="text-slate-400 hover:text-ink" title="Add card">⋯</button>
            </div>

            {adding === col.key ? (
              <div className="mb-3 rounded-lg border border-brand-200 bg-white p-2 shadow-sm">
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addCard(col.key);
                    if (e.key === "Escape") { setAdding(null); setNewTitle(""); }
                  }}
                  placeholder="Enter a task title…"
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:bg-white"
                />
                <div className="mt-2 flex gap-2">
                  <button onClick={() => addCard(col.key)} disabled={!newTitle.trim()} className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50">Add task</button>
                  <button onClick={() => { setAdding(null); setNewTitle(""); }} className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100">Cancel</button>
                </div>
              </div>
            ) : (
              col.key === "todo" && (
                <button onClick={() => openComposer("todo")} className="mb-3 flex w-full items-center justify-center rounded-lg border border-dashed border-slate-300 py-3 text-slate-400 hover:border-brand-300 hover:text-brand-500">
                  <Icon name="plus" size={18} />
                </button>
              )
            )}

            <div className="space-y-3">
              {col.tasks.map((t) => (
                <div
                  key={t._id}
                  draggable
                  onDragStart={() => setDragged(t._id)}
                  className="group cursor-grab rounded-xl bg-white p-4 shadow-sm active:cursor-grabbing"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-ink">{t.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 whitespace-nowrap text-xs text-muted">
                        <Icon name="clock" size={13} /> {t.days} Days
                      </span>
                      <button
                        onClick={() => removeCard(t._id)}
                        className="text-slate-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100"
                        title="Remove card"
                        aria-label="Remove card"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                    <Icon name="users" size={13} /> {t.team}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1"><Icon name="paperclip" size={13} /> {t.attach}</span>
                      <span className="flex items-center gap-1"><Icon name="chat" size={13} /> {t.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => addMember(t)} className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100" title="Add member">
                        <Icon name="plus" size={12} />
                      </button>
                      <div className="flex -space-x-2">
                        {Array.from({ length: Math.min(3, Number(t.members)) }).map((_, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={i} src={avatarFor(String(t.title) + i)} alt="" className="h-6 w-6 rounded-full object-cover ring-2 ring-white" />
                        ))}
                        {Number(t.members) > 3 && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[9px] font-medium text-slate-500 ring-2 ring-white">+{Number(t.members) - 3}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!loading && col.tasks.length === 0 && <p className="py-4 text-center text-xs text-muted">No cards</p>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
