"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";

const SUBTITLE = "The Last Pass password generator creates random passwords based on parameters set by you.";

type Device = {
  id: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  createdAt: string;
  lastSeenAt: string;
  current: boolean;
};

function whenLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${date} at ${time}`;
}

export default function SecurityPage() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [devices, setDevices] = useState<Device[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [menu, setMenu] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadDevices() {
    setLoadingDevices(true);
    try {
      const res = await fetch("/api/account/devices");
      const data = await res.json();
      if (res.ok) setDevices(data.devices ?? []);
    } finally {
      setLoadingDevices(false);
    }
  }

  useEffect(() => { loadDevices(); }, []);

  async function signOutDevice(id: string) {
    setMenu(null);
    const res = await fetch("/api/account/devices", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (res.ok) {
      if (data.current) { window.location.href = "/login"; return; }
      setDevices((ds) => ds.filter((d) => d.id !== id));
      setMsg({ type: "ok", text: "Device signed out." });
    } else {
      setMsg({ type: "err", text: data.error || "Could not sign out device." });
    }
  }

  async function signOutAll() {
    const res = await fetch("/api/account/devices", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    const data = await res.json();
    if (res.ok) {
      setDevices((ds) => ds.filter((d) => d.current));
      setMsg({ type: "ok", text: `Signed out from ${data.removed} other device${data.removed === 1 ? "" : "s"}.` });
    } else {
      setMsg({ type: "err", text: data.error || "Could not sign out devices." });
    }
  }

  const rules = [
    { label: "Minimum 8 character", ok: form.newPassword.length >= 8 },
    { label: "At least one special character", ok: /[^A-Za-z0-9]/.test(form.newPassword) },
    { label: "At least one number", ok: /[0-9]/.test(form.newPassword) },
    { label: "Can't be the same as a previous", ok: !!form.newPassword && form.newPassword !== form.currentPassword },
  ];
  const allRulesMet = rules.every((r) => r.ok);
  const canSubmit = !!form.currentPassword && allRulesMet && form.newPassword === form.confirmPassword;

  async function submit() {
    if (!canSubmit) return;
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/account/security", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setMsg({ type: "ok", text: data.message });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      setMsg({ type: "err", text: data.error });
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-ink">Security Setting</h2>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* Password */}
        <Card>
          <h3 className="text-lg font-bold text-ink">Password</h3>
          <p className="mt-1 max-w-md text-sm text-muted">{SUBTITLE}</p>

          <div className="mt-5 space-y-4">
            <Pw label="Current password" value={form.currentPassword} onChange={(v) => setForm({ ...form, currentPassword: v })} />
            <Pw label="New password" value={form.newPassword} onChange={(v) => setForm({ ...form, newPassword: v })} />
            <Pw label="Confirm password" value={form.confirmPassword} onChange={(v) => setForm({ ...form, confirmPassword: v })} />

            {form.confirmPassword && form.newPassword !== form.confirmPassword && (
              <p className="text-sm text-red-500">Passwords do not match.</p>
            )}

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-ink">Rules for password</p>
              <p className="mt-1 text-xs text-muted">To create a new password, you have to meet all of the following requirements.</p>
              <ul className="mt-3 space-y-2">
                {rules.map((r) => (
                  <li key={r.label} className="flex items-center gap-2 text-xs">
                    <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${r.ok ? "bg-green-500 text-white" : "bg-slate-200 text-transparent"}`}>✓</span>
                    <span className={r.ok ? "text-ink" : "text-muted"}>{r.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {msg && <p className={`text-sm ${msg.type === "ok" ? "text-green-600" : "text-red-500"}`}>{msg.text}</p>}

            <button
              onClick={submit}
              disabled={!canSubmit || saving}
              className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? "Updating…" : "Update password"}
            </button>
          </div>
        </Card>

        {/* Devices */}
        <Card className="flex flex-col">
          <h3 className="text-lg font-bold text-ink">Devices</h3>
          <p className="mt-1 text-sm text-muted">These are the devices currently signed in to your account.</p>
          <button
            onClick={signOutAll}
            disabled={devices.filter((d) => !d.current).length === 0}
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Sign out from all devices
          </button>

          <div className="mt-5 flex-1 space-y-3">
            {loadingDevices && <p className="text-sm text-muted">Loading devices…</p>}
            {!loadingDevices && devices.length === 0 && <p className="text-sm text-muted">No active devices.</p>}
            {devices.map((d) => (
              <div key={d.id} className="relative flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-ink">
                    {d.device}
                    {d.current && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">This device</span>}
                  </p>
                  <p className="text-xs text-muted">{d.location} · {whenLabel(d.lastSeenAt)}</p>
                </div>
                <button onClick={() => setMenu(menu === d.id ? null : d.id)} className="px-1 text-slate-400 hover:text-ink">⋮</button>
                {menu === d.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />
                    <div className="absolute right-0 top-6 z-20 w-36 rounded-lg bg-white p-1 shadow-lg ring-1 ring-slate-100">
                      <button
                        onClick={() => signOutDevice(d.id)}
                        className="block w-full rounded px-3 py-1.5 text-left text-sm text-red-500 hover:bg-red-50"
                      >
                        {d.current ? "Sign out (this device)" : "Sign out"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="relative mt-4 self-end">
            <button
              onClick={() => setHelpOpen((o) => !o)}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-600 hover:bg-slate-200"
            >
              Need help?
            </button>
            {helpOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setHelpOpen(false)} />
                <div className="absolute bottom-12 right-0 z-20 w-64 rounded-xl bg-white p-4 shadow-xl ring-1 ring-slate-100">
                  <p className="text-sm font-semibold text-ink">Need a hand?</p>
                  <p className="mt-1 text-xs text-muted">If you don&apos;t recognise a device, sign it out and change your password.</p>
                  <div className="mt-3 space-y-1.5">
                    <a
                      href="mailto:support@medium.app?subject=Account%20security%20help&body=Hi%20Medium%20support%2C%0A%0AI%20need%20help%20with%20my%20account%20security."
                      className="block rounded-lg px-3 py-2 text-sm text-brand-600 hover:bg-brand-50"
                      onClick={() => setHelpOpen(false)}
                    >
                      Contact support
                    </a>
                    <a
                      href="/dashboard/notification"
                      className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                      onClick={() => setHelpOpen(false)}
                    >
                      View security alerts
                    </a>
                    <button
                      onClick={() => { setHelpOpen(false); loadDevices(); setMsg({ type: "ok", text: "Device list refreshed." }); }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                    >
                      Refresh device list
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Pw({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}
