"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Avatar } from "@/components/ui";
import { useResource } from "@/components/dashboard/useResource";

const DOT: Record<string, string> = { Paid: "bg-brand-500", Canceled: "bg-red-500", Refunded: "bg-sky-400" };

function txn(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return String(Math.abs(h) % 1000000000).padStart(6, "0");
}

export default function OrderListPage() {
  const { items, loading } = useResource("orders");
  const router = useRouter();
  const [q, setQ] = useState("");

  const rows = useMemo(
    () => items.filter((o) => Object.values(o).some((v) => String(v).toLowerCase().includes(q.toLowerCase()))),
    [items, q]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-ink">Order List</h2>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100" />
      </div>

      <Card className="overflow-x-auto">
        {loading && <p className="text-sm text-muted">Loading…</p>}
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-muted">
              <th className="py-3 font-medium">Customer</th>
              <th className="py-3 font-medium">Product</th>
              <th className="py-3 font-medium">Id</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Revenue</th>
              <th className="py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr
                key={o._id}
                onClick={() => router.push(`/dashboard/ecommerce/orders/detail?id=${o._id}`)}
                className="cursor-pointer border-b border-slate-50 transition hover:bg-slate-50/60"
              >
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <Avatar seed={String(o.email)} size={36} />
                    <div>
                      <p className="font-medium text-ink">{String(o.customer)}</p>
                      <p className="text-xs text-muted">{String(o.email)}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-muted">{String(o.product)}</td>
                <td className="py-4 text-muted">{String(o.orderId)}</td>
                <td className="py-4 text-muted">{txn(String(o.orderId))}</td>
                <td className="py-4">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className={`h-2 w-2 rounded-full ${DOT[String(o.status)] ?? "bg-slate-400"}`} /> {String(o.status)}
                  </span>
                </td>
                <td className="py-4 text-muted">{formatDate(String(o.date))}</td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-muted">{q ? "No matching orders." : "No orders yet."}</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function formatDate(s: string) {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return s;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(m[3])} ${months[Number(m[2]) - 1]}, ${m[1]}`;
}
