"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { AreaChart, MultiLineChart } from "@/components/charts";

const WATCHLISTS: Record<string, { green: number[]; orange: number[]; labels: string[] }> = {
  Day: {
    green: [220, 180, 175, 260, 360, 420, 390, 300, 230, 170, 140],
    orange: [140, 120, 90, 150, 210, 250, 230, 150, 90, 110, 80],
    labels: ["May 5", "May 6", "May 7", "May 8", "May 9", "May 10", "May 11", "May 12", "May 13", "May 14", "May 15"],
  },
  Week: {
    green: [180, 240, 300, 360, 410, 330, 280],
    orange: [100, 150, 210, 250, 200, 160, 120],
    labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7"],
  },
  Month: {
    green: [150, 220, 280, 340, 300, 260],
    orange: [90, 140, 190, 230, 180, 130],
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  },
};

const DEVICES = [
  { name: "Mobile", value: "96.42%", icon: "📱" },
  { name: "Desktop", value: "2.76%", icon: "🖥️" },
  { name: "Tablet", value: "0.82%", icon: "📲" },
  { name: "TV", value: "12.3%", icon: "📺" },
];

const COUNTRIES = [
  { name: "Pakistan", value: "54%", code: "pk" },
  { name: "Germany", value: "32%", code: "de" },
  { name: "United State", value: "27%", code: "us" },
  { name: "Spain", value: "25%", code: "es" },
];

const PERIODS = ["Today", "This Week", "This Month", "This Quarter", "This Year"];

const FUNNEL: Record<string, number[]> = {
  Today: [20, 35, 28, 40, 32, 48, 60, 52, 70, 64, 80, 72],
  "This Week": [40, 55, 50, 70, 60, 90, 80, 65, 75, 60, 70, 65],
  "This Month": [50, 80, 60, 100, 75, 80, 90, 70, 85, 65, 95, 88],
  "This Quarter": [60, 70, 90, 85, 110, 95, 120, 100, 130, 115, 125, 140],
  "This Year": [80, 120, 100, 160, 140, 200, 180, 150, 210, 190, 230, 220],
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("This Month");
  const [view, setView] = useState<"Day" | "Week" | "Month">("Day");
  const wl = WATCHLISTS[view];

  return (
    <div className="space-y-5">
      <Card>
        <div className="grid gap-4 sm:grid-cols-4">
          <Metric value="$1,567.99" delta="10.0%" up sub="Available to withdraw" note="Wed, Jul 20" />
          <Metric value="$2,868.99" delta="3.0%" sub="Today Revenue" note="143 Orders" />
          <Metric value="156k" delta="3.2%" up sub="Today Sessions" note="32k Visitors" />
          <Metric value="3,422" delta="8.3%" up sub="Subscribers" note="$32.48 Average Order" />
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-ink">Sales Funnel</h3>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-300"
            >
              {PERIODS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <AreaChart values={FUNNEL[period]} height={220} />
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold text-ink">Device Category</h3>
          <div className="space-y-4">
            {DEVICES.map((d) => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-sm">{d.icon}</span>
                <span className="flex-1 text-sm text-ink">{d.name}</span>
                <span className="text-sm font-medium text-muted">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-ink">Watchlists</h3>
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-sm">
              {(["Day", "Week", "Month"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`rounded-md px-3 py-1 transition ${view === v ? "bg-white font-medium text-ink shadow-sm" : "text-muted"}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <MultiLineChart
            series={[
              { values: wl.green, color: "#22c55e" },
              { values: wl.orange, color: "#f59e0b" },
            ]}
            xLabels={wl.labels}
            height={230}
          />
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold text-ink">Top Countries</h3>
          <div className="space-y-4">
            {COUNTRIES.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://flagcdn.com/w40/${c.code}.png`} alt={c.name} className="h-5 w-7 rounded object-cover" />
                <span className="flex-1 text-sm text-ink">{c.name}</span>
                <span className="text-sm font-medium text-muted">{c.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Metric({ value, delta, up, sub, note }: { value: string; delta: string; up?: boolean; sub: string; note: string }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">{sub}</span>
        <span className={`text-xs ${up ? "text-green-500" : "text-red-500"}`}>{up ? "▲" : "▼"} {delta}</span>
      </div>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
      <p className="text-xs text-muted">{note}</p>
    </div>
  );
}
