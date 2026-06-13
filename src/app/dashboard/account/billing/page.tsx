"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { avatarFor } from "@/lib/assets";
import { useUser } from "@/components/dashboard/UserProvider";
import { useResource } from "@/components/dashboard/useResource";

type Row = { _id?: string; id: string; date: string; amount: string; plan: string; users: string; status: string };

const DEMO: Row[] = [
  { id: "Billing #780-Dec 2022", date: "Dec 23, 2022", amount: "USD $12.00", plan: "Basic plan", users: "15 Users", status: "Paid" },
  { id: "Billing #345-Nov 2022", date: "Nov 12, 2022", amount: "USD $22.00", plan: "Basic plan", users: "56 Users", status: "Paid" },
  { id: "Billing #213-Oct 2022", date: "Oct 09, 2022", amount: "USD $80.00", plan: "Basic plan", users: "90 Users", status: "Paid" },
  { id: "Billing #324-Agu 2022", date: "Agu 03, 2022", amount: "USD $12.00", plan: "Basic plan", users: "22 Users", status: "Paid" },
  { id: "Billing #123-July 2022", date: "July 13, 2022", amount: "USD $67.00", plan: "Basic plan", users: "23 Users", status: "Paid" },
];

const PLANS = [
  { name: "Basic plan", price: 20, note: "Our most popular plan for small teams." },
  { name: "Pro plan", price: 49, note: "For growing teams." },
  { name: "Enterprise", price: 99, note: "Advanced security & SSO." },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
function receiptText(r: Row): string {
  return ["MEDIUM — RECEIPT", "----------------------------------------", `Invoice:  ${r.id}`, `Date:     ${r.date}`, `Plan:     ${r.plan}`, `Amount:   ${r.amount}`, `Status:   ${r.status}`].join("\n");
}

export default function BillingPage() {
  const { user, refresh } = useUser();
  const { items: entries, create, update, remove } = useResource("billing");

  const [showPlans, setShowPlans] = useState(false);
  const [editingCard, setEditingCard] = useState(false);
  const [card, setCard] = useState({ last4: "6789", expiry: "01/2023" });
  const [cardForm, setCardForm] = useState({ number: "", expiry: "", cvv: "" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [menu, setMenu] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const current = PLANS.find((p) => p.name === user?.plan) ?? { name: user?.plan || "Basic plan", price: 0, note: "Our most popular plan for small teams." };

  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  function todayLabel() {
    const d = new Date();
    return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
  }

  async function choosePlan(p: { name: string; price: number }) {
    setShowPlans(false);
    await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: p.name }) });
    if (p.price > 0) {
      await create({ plan: p.name, amount: p.price, users: "1 Users", date: todayLabel(), status: "Unpaid" });
    }
    await refresh();
    flash(`Switched to ${p.name} — invoice created as Unpaid`);
  }

  // User billing entries (Unpaid/Paid) prepended to the demo history.
  const userRows: Row[] = entries.map((e) => ({
    _id: e._id,
    id: `Billing #${String(e._id).slice(-3)}-${String(e.date)}`,
    date: String(e.date),
    amount: `USD $${Number(e.amount).toFixed(2)}`,
    plan: String(e.plan),
    users: String(e.users ?? "1 Users"),
    status: String(e.status ?? "Unpaid"),
  }));
  const rows = [...userRows, ...DEMO].filter((r) => !dismissed.has(r.id));

  function toggle(id: string) { setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function downloadOne(r: Row) { downloadFile(`${r.id.replace(/[#\s]/g, "_")}.txt`, receiptText(r)); flash(`Downloaded ${r.id}`); }
  function downloadAll() { const list = rows.filter((r) => selected.has(r.id)); downloadFile("billing_history.txt", list.map(receiptText).join("\n\n")); flash(`Downloaded ${list.length} receipt(s)`); }
  async function removeRow(r: Row) {
    setMenu(null);
    if (r._id) await remove(r._id);
    else setDismissed((s) => new Set(s).add(r.id));
    flash("Billing entry removed");
  }

  function saveCard() {
    const digits = cardForm.number.replace(/\D/g, "");
    setCard({ last4: digits.slice(-4), expiry: cardForm.expiry });
    setEditingCard(false);
    flash("Payment method updated");
  }
  const cardValid = cardForm.number.replace(/\D/g, "").length >= 13 && /^\d{2}\/\d{4}$/.test(cardForm.expiry) && /^\d{3,4}$/.test(cardForm.cvv);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Plans and billing</h2>
        <p className="text-sm text-muted">Manage your plan and billing details</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Plan */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-ink">{current.name}</h3>
              <p className="mt-1 text-sm text-muted">{current.note}</p>
            </div>
            <p className="text-xl font-bold text-ink">${current.price} <span className="text-sm font-normal text-muted">per month</span></p>
          </div>
          <div className="mt-4 flex -space-x-2">
            {["a", "b", "c", "d", "e"].map((s) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={s} src={avatarFor("plan-" + s)} alt="" className="h-7 w-7 rounded-full object-cover ring-2 ring-white" />
            ))}
          </div>
          {showPlans && (
            <div className="mt-4 space-y-2">
              {PLANS.map((p) => (
                <button key={p.name} onClick={() => choosePlan(p)} className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition ${current.name === p.name ? "border-brand-400 bg-brand-50" : "border-slate-200 hover:bg-slate-50"}`}>
                  <span><b className="text-ink">{p.name}</b> <span className="text-muted">— {p.note}</span></span>
                  <span className="font-semibold text-ink">${p.price}/mo</span>
                </button>
              ))}
            </div>
          )}
          <div className="mt-4 text-right">
            <button onClick={() => setShowPlans(!showPlans)} className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              Upgrade plan <Icon name="chevron" size={14} className={showPlans ? "-rotate-90" : "rotate-90"} />
            </button>
          </div>
        </Card>

        {/* Payment method */}
        <Card>
          <h3 className="text-lg font-bold text-ink">Payment method</h3>
          <p className="mt-1 text-sm text-muted">Change how you pay for your plan.</p>
          {!editingCard ? (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-10 items-center justify-center rounded bg-blue-50 text-xs font-extrabold italic tracking-tight text-blue-700">VISA</span>
                <div>
                  <p className="text-sm font-medium text-ink">Visa ending in {card.last4}</p>
                  <p className="text-xs text-muted">Expiry {card.expiry}</p>
                </div>
              </div>
              <button onClick={() => { setCardForm({ number: "", expiry: "", cvv: "" }); setEditingCard(true); }} className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700">Edit</button>
            </div>
          ) : (
            <div className="mt-4 space-y-3 rounded-xl border border-slate-200 p-4">
              <Field label="Card number" placeholder="1234 5678 9012 6789" value={cardForm.number} onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })} inputMode="numeric" maxLength={23} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Expiry (MM/YYYY)" placeholder="01/2026" value={cardForm.expiry} onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })} />
                <Field label="CVV" placeholder="123" value={cardForm.cvv} onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, "") })} inputMode="numeric" maxLength={4} />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditingCard(false)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm">Cancel</button>
                <button onClick={saveCard} disabled={!cardValid} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50">Save</button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Billing history */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-ink">Billing history</h3>
            <p className="text-sm text-muted">Download your previous plan receipts and usage details.</p>
          </div>
          {selected.size > 0 && (
            <button onClick={downloadAll} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Download all</button>
          )}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-muted">
                <th className="py-3 font-medium">Billing</th>
                <th className="py-3 font-medium">Billing Date</th>
                <th className="py-3 font-medium">Amount</th>
                <th className="py-3 font-medium">Plan</th>
                <th className="py-3 font-medium">Users</th>
                <th className="py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id + i} className="border-b border-slate-50">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggle(row.id)} className="accent-brand-600" />
                      <span className="flex h-8 w-7 items-center justify-center rounded border border-slate-200"><Icon name="doc" size={14} className="text-red-400" /></span>
                      <span className="font-medium text-ink">{row.id}</span>
                      <span className={row.status === "Paid" ? "text-green-600" : "text-amber-600"}>{row.status}</span>
                    </div>
                  </td>
                  <td className="py-4 text-muted">{row.date}</td>
                  <td className="py-4 text-muted">{row.amount}</td>
                  <td className="py-4 text-muted">{row.plan}</td>
                  <td className="py-4 text-muted">{row.users}</td>
                  <td className="py-4">
                    <div className="relative flex items-center justify-end gap-2">
                      {row.status === "Unpaid" && row._id ? (
                        <button onClick={async () => { await update(row._id!, { status: "Paid" }); flash("Marked as paid"); }} className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700">Pay now</button>
                      ) : (
                        <button onClick={() => downloadOne(row)} className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-900">Download</button>
                      )}
                      <button onClick={() => setMenu(menu === row.id ? null : row.id)} className="px-1 text-slate-400 hover:text-ink">⋮</button>
                      {menu === row.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />
                          <div className="absolute right-0 top-8 z-20 w-32 rounded-lg bg-white p-1 shadow-lg ring-1 ring-slate-100">
                            <button onClick={() => removeRow(row)} className="block w-full rounded px-3 py-1.5 text-left text-sm text-red-500 hover:bg-red-50">Remove</button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {toast && <div className="fixed bottom-6 right-6 z-50 animate-fade-in rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white shadow-lg">{toast}</div>}
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink">{label}</span>
      <input {...props} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:bg-white" />
    </label>
  );
}
