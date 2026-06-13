"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useResource, type Item } from "@/components/dashboard/useResource";

const SOCIALS = ["Facebook Account", "Instagram Account", "LinkedIn Account", "Dribble Account", "Behance Account", "UI8 Account"];

export default function EditProductPage() {
  const { items, update, loading } = useResource("products");
  const [selected, setSelected] = useState<Item | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (items.length && !selected) load(items[0]);
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  function load(p: Item) {
    setSelected(p);
    setForm({
      name: String(p.name ?? ""), weight: String(p.weight ?? ""), sizes: String(p.sizes ?? "Large"),
      category: String(p.category ?? "Clothing"), description: String(p.description ?? ""),
      facebook: String(p.facebook ?? ""), instagram: String(p.instagram ?? ""), linkedin: String(p.linkedin ?? ""),
      dribble: String(p.dribble ?? ""), behance: String(p.behance ?? ""), ui8: String(p.ui8 ?? ""),
      price: String(p.price ?? ""), currency: String(p.currency ?? "USD"), sku: String(p.sku ?? ""), status: String(p.status ?? "In Stock"),
    });
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  async function save() {
    if (!selected) return;
    setSaving(true);
    await update(selected._id, { ...form, price: Number(form.price) || 0 });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-ink">Edit Product</h2>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <select
              value={selected?._id ?? ""}
              onChange={(e) => { const p = items.find((x) => x._id === e.target.value); if (p) load(p); }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {items.map((p) => <option key={p._id} value={p._id}>{String(p.name)}</option>)}
            </select>
          )}
          <button onClick={save} disabled={!selected || saving} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
          </button>
        </div>
      </div>

      {loading && <Card>Loading…</Card>}
      {!loading && !selected && <Card>No products to edit. Create one first.</Card>}

      {selected && (
        <Card className="space-y-6">
          <Section title="Product Information">
            <Input label="Name" placeholder="Off -White" value={form.name} onChange={set("name")} />
            <Input label="Weight" placeholder="42" value={form.weight} onChange={set("weight")} />
            <Select label="Sizes" value={form.sizes} onChange={set("sizes")} options={["Small", "Medium", "Large"]} />
            <Select label="Category" value={form.category} onChange={set("category")} options={["Clothing", "Electronics", "Furniture", "Shoes"]} />
            <div className="sm:col-span-2 sm:max-w-[calc(50%-0.625rem)]">
              <Input label="Description" placeholder="Some initial bold text" value={form.description} onChange={set("description")} />
            </div>
          </Section>

          <Section title="Social">
            {SOCIALS.map((s) => {
              const key = s.split(" ")[0].toLowerCase();
              return <Input key={s} label={s} placeholder="@warner" value={form[key] ?? ""} onChange={set(key)} />;
            })}
          </Section>

          <Section title="Pricing">
            <Input label="Price" placeholder="$100" value={form.price} onChange={set("price")} />
            <Select label="Currency" value={form.currency} onChange={set("currency")} options={["USD", "EUR", "GBP"]} />
            <Input label="SKU" placeholder="829672639" value={form.sku} onChange={set("sku")} />
            <Select label="Tags" value={form.status} onChange={set("status")} options={["In Stock", "Out of Stock"]} />
          </Section>
        </Card>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-100 p-5">
      <h3 className="mb-5 text-center font-semibold text-ink">{title}</h3>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}
function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input {...props} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100" />
    </label>
  );
}
function Select({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <div className="relative">
        <select {...props} className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:bg-white">
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <Icon name="chevron" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400" />
      </div>
    </label>
  );
}
