"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, Avatar } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useResource } from "@/components/dashboard/useResource";

const SOCIAL_KEYS = ["facebook", "instagram", "linkedin", "dribble", "behance", "ui8"] as const;

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { items, loading, remove } = useResource("products");
  const [deleting, setDeleting] = useState(false);

  const product = useMemo(() => items.find((p) => p._id === id) ?? null, [items, id]);

  async function del() {
    if (!product) return;
    setDeleting(true);
    await remove(product._id);
    router.push("/dashboard/ecommerce/products/list");
  }

  if (loading) return <Card>Loading…</Card>;
  if (!product) {
    return (
      <Card className="space-y-3 text-center">
        <p className="text-sm text-muted">Product not found.</p>
        <Link href="/dashboard/ecommerce/products/list" className="text-sm font-medium text-brand-600">Back to product list</Link>
      </Card>
    );
  }

  const p = product;
  const inStock = p.status === "In Stock";
  const socials = SOCIAL_KEYS.map((k) => ({ k, v: String(p[k] ?? "") })).filter((s) => s.v);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-ink">
          <Icon name="chevron" size={16} className="rotate-180" /> Back
        </button>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/ecommerce/products/edit" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Edit</Link>
          <button onClick={del} disabled={deleting} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50">
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      <Card className="grid gap-6 sm:grid-cols-[200px_1fr]">
        {/* Image — identical source to the product list (same seed + image). */}
        <div className="flex items-start justify-center">
          <Avatar seed={String(p.name)} src={(p.image as string) || undefined} size={180} />
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-ink">{String(p.name)}</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${inStock ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>{String(p.status)}</span>
            </div>
            <p className="mt-1 text-sm text-muted">{String(p.category ?? "Uncategorized")}</p>
          </div>

          <p className="text-3xl font-bold text-brand-600">
            {String(p.currency ?? "USD")} ${Number(p.price ?? 0).toLocaleString()}
          </p>

          {p.description ? <p className="text-sm leading-relaxed text-slate-600">{String(p.description)}</p> : null}

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
            <Stat label="SKU" value={String(p.sku ?? "—")} />
            <Stat label="Quantity" value={String(p.quantity ?? "—")} />
            <Stat label="Weight" value={p.weight ? `${p.weight}` : "—"} />
            <Stat label="Sizes" value={String(p.sizes ?? "—")} />
            <Stat label="Currency" value={String(p.currency ?? "USD")} />
            <Stat label="Status" value={String(p.status ?? "—")} />
          </div>

          {socials.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <p className="mb-2 text-sm font-semibold text-ink">Social</p>
              <div className="flex flex-wrap gap-2">
                {socials.map((s) => (
                  <span key={s.k} className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                    <span className="capitalize text-muted">{s.k}:</span> {s.v}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
