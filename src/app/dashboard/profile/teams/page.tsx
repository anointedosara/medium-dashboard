"use client";

import { useState } from "react";
import { Card, Avatar } from "@/components/ui";
import { useResource, type Item } from "@/components/dashboard/useResource";

const ROLES = ["Read-only", "Admin", "Editor"];

export default function TeamsPage() {
  const { items, create, update, remove, loading } = useResource("team");
  const [invites, setInvites] = useState([{ email: "", role: "Read-only" }]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", email: "", role: "Read-only" });

  async function sendInvites() {
    for (const inv of invites) {
      if (inv.email.trim()) await create({ name: inv.email.split("@")[0], email: inv.email, role: inv.role });
    }
    setInvites([{ email: "", role: "Read-only" }]);
  }

  function toggle(id: string) {
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleAll() {
    setSelected((s) => (s.size === items.length ? new Set() : new Set(items.map((i) => i._id))));
  }

  function startEdit(m: Item) {
    setEditing(m._id);
    setDraft({ name: String(m.name), email: String(m.email), role: String(m.role) });
  }
  async function saveEdit(id: string) {
    await update(id, { name: draft.name, email: draft.email, role: draft.role });
    setEditing(null);
  }

  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-bold text-ink">Team management</h2>
      <p className="text-sm text-muted">Manage your team members and their account permissions here.</p>

      <Card className="!mt-5">
        {/* Invite section */}
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <div>
            <h3 className="font-semibold text-ink">Invite team members</h3>
            <p className="mt-1 text-sm text-muted">Get your projects up and running faster by inviting your team to collaborate.</p>
          </div>
          <div>
            <div className="space-y-3">
              {invites.map((inv, i) => (
                <div key={i} className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">✉</span>
                    <input
                      type="email"
                      placeholder="team@team.com"
                      value={inv.email}
                      onChange={(e) => setInvites(invites.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <select
                    value={inv.role}
                    onChange={(e) => setInvites(invites.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)))}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-muted"
                  >
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button onClick={() => setInvites([...invites, { email: "", role: "Read-only" }])} className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-ink">
                <span className="text-base">+</span> Add another
              </button>
              <button onClick={sendInvites} className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">✉ Send invites</button>
            </div>
          </div>
        </div>

        <hr className="my-6 border-slate-100" />

        {/* Members section */}
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <div>
            <h3 className="font-semibold text-ink">Team members</h3>
            <p className="mt-1 text-sm text-muted">Get your projects up and running faster by inviting your team to collaborate.</p>
          </div>
          <div>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <input type="checkbox" checked={items.length > 0 && selected.size === items.length} onChange={toggleAll} className="accent-brand-600" />
              <span className="text-sm font-medium text-ink">Name</span>
            </div>

            {loading && <p className="py-4 text-sm text-muted">Loading…</p>}
            {!loading && items.length === 0 && <p className="py-4 text-sm text-muted">No members yet. Invite someone above.</p>}

            <div className="divide-y divide-slate-100">
              {items.map((m) => (
                <div key={m._id} className="py-4">
                  {editing === m._id ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Name" className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400" />
                      <input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="Email" className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400" />
                      <select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                        {ROLES.map((r) => <option key={r}>{r}</option>)}
                      </select>
                      <button onClick={() => saveEdit(m._id)} className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700">Save</button>
                      <button onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={selected.has(m._id)} onChange={() => toggle(m._id)} className="accent-brand-600" />
                      <Avatar seed={String(m.email)} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink">{String(m.name)}</p>
                        <p className="text-xs text-muted">{String(m.email)}</p>
                      </div>
                      <span className="hidden w-20 text-sm text-muted sm:block">{String(m.role)}</span>
                      <button onClick={() => remove(m._id)} className="text-sm text-slate-400 hover:text-red-500">Delete</button>
                      <button onClick={() => startEdit(m)} className="text-sm font-medium text-brand-600 hover:text-brand-700">Edit</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
