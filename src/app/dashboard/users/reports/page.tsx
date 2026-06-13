"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { LollipopChart, StackedBars } from "@/components/charts";

const PERIODS = ["Day", "Week", "Month", "Quarter", "Year"];
const SEED: Record<string, number> = { Day: 1, Week: 2, Month: 3, Quarter: 4, Year: 5 };

const SALES = [180, 220, 150, 95, 70, 120, 185, 110, 185, 200, 185, 215, 275, 185, 300];
const SEEDS = SALES.map((_, i) => `sales-user-${i}`);

const PAYMENTS = [
  { bottom: 3, top: 2 }, { bottom: 4, top: 4 }, { bottom: 3, top: 2.5 },
  { bottom: 4.5, top: 2 }, { bottom: 3, top: 2 }, { bottom: 1, top: 1.5 },
];
const LOANS = [
  { bottom: 1.2, top: 1 }, { bottom: 1, top: 0.8 }, { bottom: 1.6, top: 1.2 },
  { bottom: 1.5, top: 1 }, { bottom: 1.8, top: 1.4 }, { bottom: 1.2, top: 1 }, { bottom: 2, top: 1.4 },
];

// Re-shape data deterministically by period (stays within each chart's axis range).
function vary(v: number, i: number, period: string) {
  const s = SEED[period] ?? 3;
  const f = 0.5 + 0.5 * ((Math.sin(i * s + s) + 1) / 2);
  return v * f;
}

export default function ReportsPage() {
  const [salesP, setSalesP] = useState("Month");
  const [payP, setPayP] = useState("Month");
  const [loanP, setLoanP] = useState("Month");

  const sales = SALES.map((v, i) => Math.round(vary(v, i, salesP)));
  const payments = PAYMENTS.map((d, i) => ({ bottom: vary(d.bottom, i, payP), top: vary(d.top, i, payP) }));
  const loans = LOANS.map((d, i) => ({ bottom: vary(d.bottom, i, loanP), top: vary(d.top, i, loanP) }));

  const payTotal = payments.reduce((s, d) => s + d.bottom + d.top, 0) * 1000;
  const loanTotal = loans.reduce((s, d) => s + d.bottom + d.top, 0) * 100000;

  return (
    <div className="space-y-5">
      <Card>
        <div className="grid divide-y divide-slate-100 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          <Metric value="$8,098.32" label="Payment" />
          <Metric value="$901,256.01" label="Loan income" />
          <Metric value="$987,256.98" label="Gross amount" />
          <Metric value="$564,164.57" label="Jobs create" />
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-sm text-muted">Statistics</p>
            <h3 className="text-lg font-bold text-ink">Sales closed</h3>
          </div>
          <Period value={salesP} onChange={setSalesP} />
        </div>
        <LollipopChart values={sales} seeds={SEEDS} max={320} height={240} />
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted">Payments</p>
              <h3 className="text-lg font-bold text-ink">${payTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3>
            </div>
            <Period value={payP} onChange={setPayP} />
          </div>
          <StackedBars data={payments} yLabels={["$8", "$2", "$9", "$0"]} xLabels={["1Nov", "20Nov"]} max={9} height={200} />
        </Card>

        <Card>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted">Loan income</p>
              <h3 className="text-lg font-bold text-ink">${loanTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            </div>
            <Period value={loanP} onChange={setLoanP} />
          </div>
          <StackedBars data={loans} yLabels={["3k", "2k", "1k", "0"]} xLabels={["5Nov"]} max={3.6} height={200} />
        </Card>
      </div>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-4 py-3 text-center">
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

function Period({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-muted outline-none focus:border-brand-300">
      {PERIODS.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}
