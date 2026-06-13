"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, Badge } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useResource } from "@/components/dashboard/useResource";
import { avatarFor } from "@/lib/assets";

const TILE_COLORS = ["#fb7185", "#6366f1", "#f59e0b", "#22c55e", "#7c47ff", "#06b6d4"];
function tileColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}
function progressOf(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return 10 + (Math.abs(h) % 91);
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { items, loading, update, remove } = useResource("projects");
  const project = items.find((p) => p._id === id);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  if (loading) return <Card>Loading…</Card>;
  if (!project)
    return (
      <Card>
        <p className="text-muted">Project not found.</p>
        <Link href="/dashboard/profile/projects" className="mt-2 inline-block text-sm font-medium text-brand-600">← Back to projects</Link>
      </Card>
    );

  const name = String(project.name);
  const progress = Math.min(100, progressOf(project._id));
  const count = Number(project.participants ?? 0);

  function startEdit() {
    setForm({
      name: String(project!.name ?? ""),
      title: String(project!.title ?? ""),
      tag: String(project!.tag ?? ""),
      desc: String(project!.desc ?? ""),
      participants: String(project!.participants ?? ""),
      start: String(project!.start ?? ""),
      due: String(project!.due ?? ""),
    });
    setEditing(true);
  }
  async function save() {
    setSaving(true);
    await update(project!._id, { ...form, participants: Number(form.participants) || 0 });
    setSaving(false);
    setEditing(false);
  }
  async function del() {
    await remove(project!._id);
    router.push("/dashboard/profile/projects");
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/dashboard/profile/projects" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600">
        <Icon name="chevron" size={14} className="rotate-180" /> Back to projects
      </Link>

      <Card>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white" style={{ background: tileColor(name) }}>
              {name.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">{name}</h2>
              <Badge>{String(project.tag ?? "Project")}</Badge>
            </div>
          </div>
          {!editing && (
            <div className="flex gap-2">
              <button onClick={startEdit} className="rounded-lg border border-slate-200 px-4 py-1.5 text-sm hover:bg-slate-50">Edit</button>
              <button onClick={del} className="rounded-lg border border-red-200 px-4 py-1.5 text-sm text-red-500 hover:bg-red-50">Delete</button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Project Name" value={form.name} onChange={set("name")} />
            <Field label="Project Title" value={form.title} onChange={set("title")} />
            <Field label="Tag" value={form.tag} onChange={set("tag")} />
            <Field label="Participants" value={form.participants} onChange={set("participants")} />
            <Field label="Start Date" type="date" value={form.start} onChange={set("start")} />
            <Field label="Due Date" type="date" value={form.due} onChange={set("due")} />
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-ink">Description</span>
              <textarea value={form.desc} onChange={set("desc")} rows={3} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:bg-white" />
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <button onClick={save} disabled={saving} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">{saving ? "Saving…" : "Save"}</button>
              <button onClick={() => setEditing(false)} className="rounded-lg border border-slate-200 px-5 py-2 text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm text-muted">{String(project.desc ?? "No description.")}</p>

            <div className="mt-5">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-ink">Progress</span>
                <span className="text-muted">{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-brand-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Participants" value={String(count)} />
              <Stat label="Start date" value={String(project.start || "—")} />
              <Stat label="Due date" value={String(project.due || "—")} />
              <Stat label="Title" value={String(project.title || "—")} />
            </div>

            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-ink">Team</p>
              <div className="flex -space-x-2">
                {Array.from({ length: Math.min(6, Math.max(1, count)) }).map((_, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={avatarFor(name + i)} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-white" />
                ))}
              </div>
            </div>

            {project.image ? (
              <div className="mt-6">
                <p className="mb-2 text-sm font-medium text-ink">Starting file</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={String(project.image)} alt="" className="max-h-48 rounded-lg object-cover" />
              </div>
            ) : null}
          </>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <p className="text-sm font-semibold text-ink">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input {...props} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100" />
    </label>
  );
}
