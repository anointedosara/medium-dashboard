"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/dashboard/UserProvider";
import { useResource } from "@/components/dashboard/useResource";

type Feature = { label: string; included: boolean };
type Plan = {
  name: string;
  price: string;
  amount: number;
  sub: string;
  cta: string;
  features: Feature[];
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function todayLabel() {
  const d = new Date();
  return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
}

const PLANS: Plan[] = [
  {
    name: "Free/Personal",
    price: "",
    amount: 0,
    sub: "For a Lifetime",
    cta: "Get started",
    features: [
      { label: "Unlimited Projects", included: false },
      { label: "Share with 5 team members", included: true },
      { label: "Sync across devices", included: false },
      { label: "API Access", included: true },
      { label: "Complete Documentation", included: false },
      { label: "Integration help", included: true },
    ],
  },
  {
    name: "$89/Professional",
    price: "$89",
    amount: 89,
    sub: "/year",
    cta: "Try for free",
    features: [
      { label: "Everything in free plan", included: false },
      { label: "Unlimited projects", included: true },
      { label: "Share with 5 team members", included: false },
      { label: "30 day version history", included: true },
      { label: "Complete Documentation", included: false },
      { label: "Integration help", included: true },
    ],
  },
  {
    name: "Custom/Enterprise",
    price: "",
    amount: 0,
    sub: "Reach out for a quote",
    cta: "Contact Us",
    features: [
      { label: "Everything in Team plan", included: false },
      { label: "Advanced security", included: true },
      { label: "Custom contract", included: false },
      { label: "User provisioning ( SCIM)", included: true },
      { label: "Complete Documentation", included: false },
      { label: "SAML SSO", included: true },
    ],
  },
];

export default function PricingPage() {
  const { user, refresh } = useUser();
  const { create } = useResource("billing");
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState("");

  async function choose(plan: Plan) {
    setBusy(plan.name);
    // Update the user's plan everywhere it's read (billing + invoice + profile).
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: plan.name }),
    });
    // Paid plans add an Unpaid line to billing history that the invoice reads.
    if (plan.amount > 0) {
      await create({ plan: plan.name, amount: plan.amount, users: "1 Users", date: todayLabel(), status: "Unpaid" });
    }
    await refresh();
    setBusy("");
    setToast(`You're now on ${plan.name.replace(/^\$\d+\//, "")} — opening your invoice…`);
    // Take the user to the invoice page to review / complete payment.
    setTimeout(() => router.push("/dashboard/account/invoice"), 600);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Pricing</h2>
        <p className="text-sm text-muted">Simple Pricing. No Hidden Fees. Advance Features for your business.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {PLANS.map((p) => {
          const isCurrent = user?.plan === p.name;
          return (
            <div key={p.name} className="card p-6">
              <h3 className="text-2xl font-bold text-ink">
                {p.price && <span>{p.price}</span>}
                {p.price ? p.name.replace(p.price, "") : p.name}
              </h3>
              <p className="text-sm text-muted">{p.sub}</p>

              {isCurrent ? (
                <button disabled className="mt-5 w-full cursor-default rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-500">
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => choose(p)}
                  disabled={busy === p.name}
                  className="mt-5 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
                >
                  {busy === p.name ? "Updating…" : p.cta}
                </button>
              )}

              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f.label} className="flex items-center gap-3 text-sm">
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${f.included ? "bg-sky-400 text-white" : "border border-slate-300"}`}>
                      {f.included && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l5 5L20 6" />
                        </svg>
                      )}
                    </span>
                    <span className="text-slate-600">{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
