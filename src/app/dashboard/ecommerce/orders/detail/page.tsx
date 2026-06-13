"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, Avatar } from "@/components/ui";
import { useResource } from "@/components/dashboard/useResource";

const STEPS = ["Order received", "Order generate", "Order transmited", "Order delivered"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function hashNum(id: string, mod: number) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % mod;
}
function txn(id: string) {
  return String(hashNum(id, 1000000000)).padStart(6, "0");
}
function formatDate(s: string) {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return s || "—";
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]}, ${m[1]}`;
}

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  Paid: { label: "Delivered", cls: "text-green-600" },
  Canceled: { label: "Canceled", cls: "text-red-500" },
  Refunded: { label: "Refunded", cls: "text-sky-500" },
};

export default function OrderDetailPage() {
  const params = useSearchParams();
  const id = params.get("id");
  const { items, loading } = useResource("orders");
  const { items: products } = useResource("products");

  const order = useMemo(() => items.find((o) => o._id === id) ?? items[0] ?? null, [items, id]);
  // Match the order's product to the real product so we show the same image as the product list.
  const product = useMemo(
    () => products.find((p) => String(p.name) === String(order?.product)) ?? null,
    [products, order]
  );

  const [rating, setRating] = useState(4);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState("");

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }
  function invoice() {
    flash("Invoice opened for printing");
    setTimeout(() => window.print(), 300);
  }

  if (loading) return <Card>Loading…</Card>;
  if (!order) {
    return (
      <Card className="space-y-3 text-center">
        <p className="text-sm text-muted">No orders yet.</p>
        <Link href="/dashboard/ecommerce/orders/list" className="text-sm font-medium text-brand-600">Back to order list</Link>
      </Card>
    );
  }

  const o = order;
  const orderId = String(o.orderId ?? o._id);
  const status = String(o.status ?? "Paid");
  const st = STATUS_STYLE[status] ?? { label: status, cls: "text-slate-600" };
  const price = Number(o.amount ?? o.price) || 100 + hashNum(orderId, 900);
  const delivery = 10;
  const taxes = Math.round(price * 0.1);
  const total = price + delivery + taxes;

  return (
    <div className="space-y-5">
      {/* Back + stepper */}
      <Link href="/dashboard/ecommerce/orders/list" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-ink">← Back to orders</Link>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">{i + 1}</span>
            <span className="text-sm font-semibold text-brand-600">{s}</span>
          </div>
        ))}
      </div>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-ink">Order details</h3>
            <div className="mt-3 space-y-1 text-sm">
              <p className="flex gap-6 text-muted">Order no: <span className="text-ink">{orderId}</span></p>
              <p className="flex gap-6 text-muted">From: <span className="text-ink">{formatDate(String(o.date ?? ""))}</span></p>
              <p className="flex gap-6 text-muted">Code: <span className="text-ink">{txn(orderId)}</span></p>
            </div>
          </div>
          <button onClick={invoice} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700">Invoice</button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <Block title="Product detail">
            <div className="flex gap-4">
              <Avatar seed={String(o.product ?? "product")} src={(product?.image as string) || undefined} size={64} />
              <div>
                <p className="font-medium text-ink">{String(o.product ?? "—")}</p>
                <p className="text-sm text-muted">${price.toLocaleString()}</p>
                <p className="mt-1 text-xs text-muted">Ordered on {formatDate(String(o.date ?? ""))}</p>
                <p className={`text-xs font-medium ${st.cls}`}>{st.label}</p>
              </div>
            </div>
          </Block>

          <Block title="Billing Information">
            <p className="font-medium text-ink">{String(o.customer ?? "—")}</p>
            <div className="mt-2 space-y-1 text-sm text-muted">
              <p>Email Address : <span className="text-ink">{String(o.email ?? "—")}</span></p>
              <p>Order Id : <span className="text-ink">{orderId}</span></p>
              <p>Status : <span className="text-ink">{status}</span></p>
            </div>
          </Block>

          <Block title="Payment detail">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink">Card payment</p>
                <p className="text-xs text-muted">Card **** {txn(orderId).slice(-4)}</p>
                <p className="text-xs text-muted">Transaction {txn(orderId)}</p>
                <p className="mt-1 text-sm text-ink">{String(o.customer ?? "")}</p>
              </div>
              <div className="flex">
                <span className="h-6 w-6 rounded-full bg-red-500" />
                <span className="-ml-2 h-6 w-6 rounded-full bg-amber-400/90" />
              </div>
            </div>
          </Block>

          <Block title="Order Summary">
            <div className="grid grid-cols-[1fr_auto] gap-x-8">
              <div className="space-y-1.5 text-sm text-muted">
                <div className="flex justify-between"><span>Product Price :</span><span>${price.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Delivery :</span><span>${delivery}</span></div>
                <div className="flex justify-between"><span>Taxes :</span><span>${taxes}</span></div>
                <div className="flex justify-between border-t border-slate-100 pt-1.5 font-semibold text-ink"><span>Total :</span><span>${total.toLocaleString()}</span></div>
              </div>
              <div className="text-center text-xs text-muted">
                <p>Do you like the product?<br />leave us a review here</p>
                <div className="mt-2 flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onMouseEnter={() => setHover(n)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(n)}
                      className={`text-lg ${(hover || rating) >= n ? "text-brand-500" : "text-slate-300"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <button onClick={() => { setSubmitted(true); flash(`Thanks! You rated ${rating}★`); }} className="mt-1 text-sm font-medium text-brand-600">
                  {submitted ? "Submitted ✓" : "Submit"}
                </button>
              </div>
            </div>
          </Block>
        </div>
      </Card>

      {toast && <div className="fixed bottom-6 right-6 z-50 animate-fade-in rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white shadow-lg">{toast}</div>}
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 font-semibold text-ink">{title}</p>
      <div className="rounded-xl border border-slate-100 p-4">{children}</div>
    </div>
  );
}
