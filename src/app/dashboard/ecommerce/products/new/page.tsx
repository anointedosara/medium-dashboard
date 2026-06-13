"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useResource } from "@/components/dashboard/useResource";

const STEPS = ["Product Info", "Media", "Social", "Pricing"];
const SOCIALS = ["Facebook Account", "Instagram Account", "LinkedIn Account", "Dribble Account", "Behance Account", "UI8 Account"];

export default function NewProductPage() {
  const router = useRouter();
  const { create } = useResource("products");
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState("");
  const [form, setForm] = useState({
    name: "", weight: "", sizes: "Large", category: "Clothing", description: "",
    price: "", currency: "USD", sku: "", status: "In Stock",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  const stepValid = [
    Boolean(form.name && form.weight && form.description.trim()),
    true,
    true,
    Boolean(form.price && form.sku),
  ][step];

  function handleMedia(f: File | undefined) {
    if (!f || !f.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setMedia(String(reader.result));
    reader.readAsDataURL(f);
  }

  async function finish() {
    setSaving(true);
    await create({
      name: form.name, category: form.category, quantity: 1,
      sku: form.sku, price: Number(form.price) || 100, status: form.status,
      description: form.description, image: media,
    });
    setSaving(false);
    router.push("/dashboard/ecommerce/products/list");
  }

  return (
    <div className="space-y-8">
      {/* Stepper */}
      <div className="flex items-center justify-center">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="flex items-center gap-2">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${i <= step ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-400"}`}>
                {i < step ? "✓" : i + 1}
              </span>
              {/* Labels hide on phones so 4 steps never overflow; current step still labelled */}
              <span className={`text-sm font-medium ${i === step ? "inline text-brand-600" : `hidden sm:inline ${i < step ? "text-brand-500" : "text-brand-300"}`}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className="mx-2 h-px w-6 bg-slate-200 sm:mx-3 sm:w-24" />}
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-3xl">
        <Card>
          <h3 className="mb-6 text-center text-lg font-semibold text-ink">
            {["Product Information", "Media", "Social", "Pricing"][step]}
          </h3>

          {step === 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Name" placeholder="Off -White" value={form.name} onChange={set("name")} />
              <Input label="Weight" placeholder="42" value={form.weight} onChange={set("weight")} />
              <Select label="Sizes" value={form.sizes} onChange={set("sizes")} options={["Small", "Medium", "Large"]} />
              <Select label="Category" value={form.category} onChange={set("category")} options={["Clothing", "Electronics", "Furniture", "Shoes"]} />
              <div className="sm:col-span-2 sm:max-w-[calc(50%-0.625rem)]">
                <Input label="Description" placeholder="Some initial bold text" value={form.description} onChange={set("description")} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleMedia(e.dataTransfer.files[0]); }}
              className="cursor-pointer rounded-xl border-2 border-dashed border-brand-300 p-10 text-center transition hover:bg-brand-50/40"
            >
              {media ? (
                <div className="flex flex-col items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={media} alt="" className="h-24 w-24 rounded-lg object-cover" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); setMedia(""); }} className="text-xs text-red-500 hover:underline">Remove</button>
                </div>
              ) : (
                <>
                  <span className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Icon name="layers" size={20} /></span>
                  <p className="text-sm"><span className="font-medium text-brand-600">Drop your image here</span><span className="text-muted"> or Browse</span></p>
                  <p className="text-xs text-muted">Support: JPG, JPEG, PNG</p>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleMedia(e.target.files?.[0])} />
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-5 sm:grid-cols-2">
              {SOCIALS.map((s) => <Input key={s} label={s} placeholder="@warner" />)}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Price" placeholder="$100" value={form.price} onChange={set("price")} />
              <Select label="Currency" value={form.currency} onChange={set("currency")} options={["USD", "EUR", "GBP"]} />
              <Input label="SKU" placeholder="829672639" value={form.sku} onChange={set("sku")} />
              <Select label="Tags" value={form.status} onChange={set("status")} options={["In Stock", "Out of Stock"]} />
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button onClick={() => setStep(Math.max(0, step - 1))} className={`rounded-lg border border-slate-200 px-5 py-2 text-sm hover:bg-slate-50 ${step === 0 ? "invisible" : ""}`}>Back</button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => stepValid && setStep(step + 1)} disabled={!stepValid} className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">Next</button>
            ) : (
              <button onClick={finish} disabled={!stepValid || saving} className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">{saving ? "Saving…" : "Create product"}</button>
            )}
          </div>
        </Card>
      </div>
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
