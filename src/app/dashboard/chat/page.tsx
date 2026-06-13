"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useUser } from "@/components/dashboard/UserProvider";
import { useResource, type Item } from "@/components/dashboard/useResource";
import { avatarFor } from "@/lib/assets";

type Msg = { id: number; me: boolean; text: string; time: string };

function nowTime() {
  return new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
function timeAgo(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function ChatPage() {
  const { user } = useUser();
  const { items: chats, loading, reload, update, remove } = useResource("chats");
  const { items: team } = useResource("team");
  const { items: people } = useResource("people");

  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [picking, setPicking] = useState(false);
  const [newName, setNewName] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");

  const active = chats.find((c) => c._id === activeId) ?? null;
  const messages: Msg[] = useMemo(() => (active?.messages as Msg[]) ?? [], [active]);

  const filteredChats = chats.filter((c) =>
    String(c.contactName ?? "").toLowerCase().includes(query.toLowerCase())
  );

  // People you can start a conversation with: your team + wizard-added people,
  // excluding anyone you already have a conversation with.
  const existingNames = new Set(chats.map((c) => String(c.contactName ?? "")));
  const contacts = useMemo(() => {
    const seen = new Set<string>();
    const list: { name: string; role: string }[] = [];
    for (const m of [...team, ...people]) {
      const name = String(m.name ?? "").trim();
      if (!name || existingNames.has(name) || seen.has(name)) continue;
      seen.add(name);
      list.push({ name, role: String(m.role ?? m.company ?? "Contact") });
    }
    return list;
  }, [team, people, existingNames]);

  async function startConversation(name: string, role: string) {
    const clean = name.trim();
    if (!clean) return;
    // Persist a new conversation document to the database for this user.
    const res = await fetch("/api/resource/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactName: clean, contactRole: role || "Contact", messages: [], lastText: "", updatedAt: new Date().toISOString() }),
    });
    const data = await res.json();
    await reload();
    setPicking(false);
    setNewName("");
    if (data?.item?._id) {
      setActiveId(data.item._id);
      setMobileView("thread");
    }
  }

  function openChat(id: string) {
    setActiveId(id);
    setMobileView("thread");
  }

  async function send() {
    if (!draft.trim() || !active) return;
    const msg: Msg = { id: Date.now(), me: true, text: draft.trim(), time: nowTime() };
    const nextMessages = [...messages, msg];
    setDraft("");
    // Save the full thread back to the user's record in the database.
    await update(active._id, { messages: nextMessages, lastText: msg.text, updatedAt: new Date().toISOString() });
  }

  async function deleteChat(id: string) {
    await remove(id);
    if (activeId === id) { setActiveId(null); setMobileView("list"); }
  }

  return (
    <Card className="!p-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={user?.avatar || avatarFor(user?.email || "u")} alt="" className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="text-sm font-semibold text-ink">{user?.fullName || "You"}</p>
            <p className="text-xs text-muted">{user?.email}</p>
          </div>
        </div>
        <button onClick={() => setPicking(true)} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          <Icon name="plus" size={16} /> New chat
        </button>
      </div>

      <div className="grid h-[64vh] grid-cols-1 md:grid-cols-[280px_1fr]">
        {/* Conversations list */}
        <div className={`scroll-thin overflow-y-auto border-r border-slate-100 p-3 ${mobileView === "thread" ? "hidden md:block" : ""}`}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search conversations" className="mb-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:bg-white" />

          {loading && <p className="px-2 py-4 text-sm text-muted">Loading…</p>}
          {!loading && chats.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Icon name="chat" size={20} /></span>
              <p className="text-sm font-medium text-ink">No conversations yet</p>
              <p className="text-xs text-muted">Start a chat to begin messaging.</p>
              <button onClick={() => setPicking(true)} className="mt-1 text-sm font-medium text-brand-600">Start a conversation</button>
            </div>
          )}

          {filteredChats.map((c) => (
            <button
              key={c._id}
              onClick={() => openChat(c._id)}
              className={`group flex w-full items-start gap-3 rounded-xl p-2.5 text-left ${c._id === activeId ? "bg-brand-50" : "hover:bg-slate-50"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarFor(String(c.contactName))} alt="" className="h-10 w-10 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-ink">{String(c.contactName)}</p>
                  <span className="shrink-0 text-[10px] text-muted">{timeAgo(String(c.updatedAt ?? ""))}</span>
                </div>
                <p className="truncate text-xs text-muted">{String(c.contactRole ?? "")}</p>
                <p className="truncate text-xs text-slate-400">{String(c.lastText ?? "") || "No messages yet"}</p>
              </div>
              <span onClick={(e) => { e.stopPropagation(); deleteChat(c._id); }} className="shrink-0 text-slate-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100" aria-label="Delete conversation">✕</span>
            </button>
          ))}
          {!loading && chats.length > 0 && filteredChats.length === 0 && <p className="px-2 py-4 text-sm text-muted">No conversations match.</p>}
        </div>

        {/* Thread */}
        <div className={`flex flex-col ${mobileView === "list" ? "hidden md:flex" : ""}`}>
          {!active ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-muted">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Icon name="chat" size={22} /></span>
              <p className="text-sm">Select a conversation or start a new one.</p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-3 border-b border-slate-100 p-3">
                <button onClick={() => setMobileView("list")} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden" aria-label="Back">
                  <Icon name="chevron" size={18} className="rotate-180" />
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarFor(String(active.contactName))} alt="" className="h-9 w-9 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{String(active.contactName)}</p>
                  <p className="truncate text-xs text-muted">{String(active.contactRole ?? "")}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="scroll-thin flex-1 space-y-4 overflow-y-auto p-5">
                {messages.length === 0 && (
                  <div className="flex h-full items-center justify-center text-center text-sm text-muted">
                    Say hello to start the conversation 👋
                  </div>
                )}
                {messages.map((m) => (
                  <Bubble key={m.id} m={m} contactName={String(active.contactName)} meAvatar={user?.avatar || avatarFor(user?.email || "me")} />
                ))}
              </div>

              {/* Composer */}
              <div className="flex gap-2 border-t border-slate-100 p-3">
                <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Write a message..." className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400" />
                <button onClick={send} disabled={!draft.trim()} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">Send</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New-chat picker */}
      {picking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setPicking(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-ink">Start a conversation</h3>
              <button onClick={() => setPicking(false)} className="text-slate-400 hover:text-ink"><Icon name="close" size={18} /></button>
            </div>

            <div className="max-h-60 space-y-1 overflow-y-auto">
              {contacts.length === 0 && (
                <p className="px-1 py-2 text-sm text-muted">No contacts yet. Type a name below to start a new conversation.</p>
              )}
              {contacts.map((c) => (
                <button key={c.name} onClick={() => startConversation(c.name, c.role)} className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avatarFor(c.name)} alt="" className="h-9 w-9 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{c.name}</p>
                    <p className="truncate text-xs text-muted">{c.role}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-3 border-t border-slate-100 pt-3">
              <div className="flex gap-2">
                <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && startConversation(newName, "Contact")} placeholder="Or type a name…" className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:bg-white" />
                <button onClick={() => startConversation(newName, "Contact")} disabled={!newName.trim()} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">Start</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function Bubble({ m, contactName, meAvatar }: { m: Msg; contactName: string; meAvatar: string }) {
  const avatar = m.me ? meAvatar : avatarFor(contactName);
  return (
    <div className={`flex items-end gap-2 ${m.me ? "flex-row-reverse" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
      <div className={`max-w-[75%] ${m.me ? "text-right" : ""}`}>
        <div className={`rounded-2xl px-4 py-2.5 text-sm ${m.me ? "bg-brand-600 text-white" : "border border-slate-200 text-ink"}`}>
          {m.text}
        </div>
        <p className="mt-1 text-[10px] text-slate-400">{m.time}</p>
      </div>
    </div>
  );
}
