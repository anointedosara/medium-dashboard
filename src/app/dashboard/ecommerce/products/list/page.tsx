"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Avatar } from "@/components/ui";
import { useResource } from "@/components/dashboard/useResource";

export default function ProductListPage() {
  const { items, loading } = useResource("products");
  const router = useRouter();
  const [q, setQ] = useState("");

  const rows = useMemo(
    () => items.filter((p) => Object.values(p).some((v) => String(v).toLowerCase().includes(q.toLowerCase()))),
    [items, q]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-ink">Product List</h2>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100" />
      </div>

      <Card className="overflow-x-auto">
        {loading && <p className="text-sm text-muted">Loading…</p>}
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-muted">
              <th className="py-3 font-medium">Product</th>
              <th className="py-3 font-medium">Category</th>
              <th className="py-3 font-medium">Quantity</th>
              <th className="py-3 font-medium">Sku</th>
              <th className="py-3 font-medium">Salary</th>
              <th className="py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p._id}
                onClick={() => router.push(`/dashboard/ecommerce/products/${p._id}`)}
                className="cursor-pointer border-b border-slate-50 transition hover:bg-slate-50/60"
              >
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <Avatar seed={String(p.name)} src={(p.image as string) || undefined} size={36} />
                    <span className="font-medium text-ink">{String(p.name)}</span>
                  </div>
                </td>
                <td className="py-4 text-muted">{String(p.category)}</td>
                <td className="py-4 text-muted">{String(p.quantity)}</td>
                <td className="py-4 text-muted">{String(p.sku)}</td>
                <td className="py-4 text-muted">${Number(p.price).toLocaleString()}</td>
                <td className="py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${p.status === "In Stock" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                    {String(p.status)}
                  </span>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-muted">{q ? "No matching products." : "No products yet."}</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
