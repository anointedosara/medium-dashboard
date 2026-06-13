"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useUser } from "@/components/dashboard/UserProvider";
import { useResource } from "@/components/dashboard/useResource";

type Method = { id: string; number: string; brand: "Visa" | "Paypal" };

const COUNTRIES = ["Germany", "United States", "United Kingdom", "France", "Spain", "Nigeria"];

export default function InvoicePage() {
  const { user } = useUser();
  const { items: entries, update } = useResource("billing");

  const [contactOpen, setContactOpen] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(true);
  const [methods, setMethods] = useState<Method[]>([
    { id: "visa", number: "347809", brand: "Visa" },
    { id: "paypal", number: "347809", brand: "Paypal" },
  ]);
  const [selected, setSelected] = useState("visa");
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [form, setForm] = useState({ holder: "", address: "Germany", zip: "", city: "", invoiceAddress: false });
  const [paid, setPaid] = useState(false);
  const [toast, setToast] = useState("");

  // Pre-fill Contact + billing details from the signed-in user's profile.
  useEffect(() => {
    if (!user) return;
    setContact({ name: user.fullName || "", email: user.email || "", phone: user.phone || "" });
    setForm((f) => ({
      ...f,
      holder: f.holder || user.fullName || "",
      city: f.city || user.city || "",
      zip: f.zip || user.zip || "",
      address: COUNTRIES.includes(user.country || "") ? (user.country as string) : f.address,
    }));
  }, [user]);

  const unpaid = entries.find((e) => e.status === "Unpaid");
  const amount = unpaid ? Number(unpaid.amount) : 67;

  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2500); }
  function addMethod() {
    const num = String(Math.floor(100000 + Math.random() * 900000));
    const id = "card-" + num;
    setMethods((m) => [...m, { id, number: num, brand: "Visa" }]);
    setSelected(id);
    flash("New payment method added");
  }
  function deleteMethod(id: string) {
    setMethods((ms) => {
      const next = ms.filter((m) => m.id !== id);
      if (selected === id && next[0]) setSelected(next[0].id);
      return next;
    });
    flash("Payment method removed");
  }

  const complete = Boolean(form.holder.trim() && form.address && form.zip.trim() && form.city.trim());

  async function pay() {
    if (!complete) { flash("Please complete all payment fields."); return; }
    if (unpaid) await update(unpaid._id, { status: "Paid" });
    setPaid(true);
    flash(`Payment of $${amount.toFixed(2)} successful`);
  }

  const setC = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setContact({ ...contact, [k]: e.target.value });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h2 className="text-xl font-bold text-ink">Payment Details</h2>

      {/* Contact */}
      <Card className="!p-0">
        <button onClick={() => setContactOpen(!contactOpen)} className="flex w-full items-center justify-between p-5 font-semibold text-ink">
          Contact <Icon name="chevron" size={18} className={`text-slate-400 transition-transform ${contactOpen ? "-rotate-90" : "rotate-90"}`} />
        </button>
        {contactOpen && (
          <div className="space-y-3 border-t border-slate-100 p-5">
            <Field label="Full name" value={contact.name} onChange={setC("name")} placeholder="John Walden" />
            <Field label="Email" value={contact.email} onChange={setC("email")} placeholder="john@email.com" />
            <Field label="Phone" value={contact.phone} onChange={setC("phone")} placeholder="+1 234 567" />
          </div>
        )}
      </Card>

      {/* Payment */}
      <Card className="!p-0">
        <button onClick={() => setPaymentOpen(!paymentOpen)} className="flex w-full items-center justify-between p-5 font-semibold text-ink">
          Payment <Icon name="chevron" size={18} className={`text-slate-400 transition-transform ${paymentOpen ? "-rotate-90" : "rotate-90"}`} />
        </button>

        {paymentOpen && (
          <div className="border-t border-slate-100 p-5">
            {unpaid && (
              <div className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                Outstanding invoice for <b>{String(unpaid.plan)}</b> — ${amount.toFixed(2)} (Unpaid)
              </div>
            )}
            <p className="mb-3 font-semibold text-ink">Payment method</p>

            <div className="grid gap-3 sm:grid-cols-3">
              {methods.map((m) => (
                <div key={m.id} onClick={() => setSelected(m.id)} className={`relative flex cursor-pointer items-center justify-between rounded-xl border p-3 text-left transition ${selected === m.id ? "border-brand-500 ring-2 ring-brand-100" : "border-slate-200 hover:border-slate-300"}`}>
                  {methods.length > 1 && (
                    <button onClick={(e) => { e.stopPropagation(); deleteMethod(m.id); }} className="absolute right-1.5 top-1.5 text-slate-300 hover:text-red-500" aria-label="Delete card">✕</button>
                  )}
                  <span className="flex items-center gap-2">
                    <input type="checkbox" readOnly checked={selected === m.id} className="accent-brand-600" />
                    <span>
                      <span className="block text-sm font-medium text-ink">{m.number}</span>
                      <span className="text-xs text-muted">{m.brand} <span className="text-brand-600">Edit</span></span>
                    </span>
                  </span>
                  <Brand brand={m.brand} />
                </div>
              ))}
              <button onClick={addMethod} className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 p-3 text-sm text-brand-600 hover:border-brand-300">
                <Icon name="plus" size={18} /> New users
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <Field label="Card holder name" value={form.holder} onChange={set("holder")} placeholder="John Walden" required />
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Billing address <span className="text-red-400">*</span></span>
                <div className="relative">
                  <select value={form.address} onChange={set("address")} className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:bg-white">
                    {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <Icon name="chevron" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400" />
                </div>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Zip code" value={form.zip} onChange={set("zip")} placeholder="6789123" required />
                <Field label="City" value={form.city} onChange={set("city")} placeholder="Berlain" required />
              </div>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={form.invoiceAddress} onChange={(e) => setForm({ ...form, invoiceAddress: e.target.checked })} className="accent-brand-600" /> Invoice Address
              </label>
              <button onClick={pay} disabled={paid || !complete} className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50">
                {paid ? "Paid ✓" : `Pay $${amount.toFixed(2)}`}
              </button>
            </div>
          </div>
        )}
      </Card>

      {toast && <div className="fixed bottom-6 right-6 z-50 animate-fade-in rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white shadow-lg">{toast}</div>}
    </div>
  );
}

function Brand({ brand }: { brand: "Visa" | "Paypal" }) {
  return brand === "Visa" ? (
    <span className="text-sm font-extrabold italic tracking-tight text-blue-700">VISA</span>
  ) : (
    <span className="text-sm font-bold text-[#179bd7]">Pay<span className="text-[#253b80]">Pal</span></span>
  );
}
function Field({ label, required, ...props }: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}{required && <span className="text-red-400"> *</span>}</span>
      <input {...props} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100" />
    </label>
  );
}
