"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { AreaChart, DualGauge, StackedBars } from "@/components/charts";

const AGE_LABELS = ["35 to 40", "30 to 35", "25 to 30", "20 to 25", "15 to 20", "10 to 15"];
const X_LABELS = ["10", "20", "30", "40", "50", "60", "70", "80", "90", "100", "200", "300", "400", "500"];

const GRADIENT: Record<string, number[]> = {
  "This Month": [40, 45, 42, 50, 48, 55, 50, 80, 52, 58, 54, 60, 56, 62, 58, 55],
  "This Week": [30, 50, 40, 60, 45, 70, 55, 65, 50, 60, 48, 58, 52, 62, 50, 56],
  "This Year": [60, 70, 65, 80, 75, 90, 85, 100, 88, 92, 86, 94, 88, 96, 90, 95],
};

const BARS = [
  { bottom: 0.7, top: 1.9 }, { bottom: 0.5, top: 1.9 }, { bottom: 1.0, top: 1.8 },
  { bottom: 0.9, top: 1.6 }, { bottom: 1.6, top: 1.4 }, { bottom: 0.8, top: 1.5 }, { bottom: 1.0, top: 2.0 },
];

export default function ChartsPage() {
  const [period, setPeriod] = useState("This Month");

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Charts</h2>
        <p className="text-sm text-muted">Charts on this page use Chart.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Line Chart */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-ink">Line Chart</h3>
            <span className="flex items-center gap-1 text-xs text-brand-600"><span className="h-2 w-2 rounded-full bg-brand-500" /> Sales</span>
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col justify-between py-1 text-[10px] text-muted">
              {AGE_LABELS.map((l) => <span key={l}>{l}</span>)}
            </div>
            <div className="flex-1">
              <AreaChart values={[30, 80, 60, 100, 70, 120, 90, 130, 80, 60, 90, 50, 70, 45]} labels={X_LABELS} height={210} />
              <div className="mt-2 flex justify-between text-[10px] text-muted">
                {X_LABELS.map((x) => <span key={x}>{x}</span>)}
              </div>
            </div>
          </div>
        </Card>

        {/* Pie Chart */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-ink">Pie Chart</h3>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] text-muted">?</span>
          </div>
          <div className="flex flex-col items-center pt-4">
            <DualGauge a={{ value: 35, color: "#6d28d9" }} b={{ value: 45, color: "#c4b5fd" }} />
            <div className="mt-4 flex w-full justify-center gap-10 text-sm">
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-brand-700" /> <span><b className="block text-ink">35%</b><span className="text-muted">Men</span></span></span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-brand-200" /> <span><b className="block text-ink">45%</b><span className="text-muted">Women</span></span></span>
            </div>
          </div>
        </Card>

        {/* Bar Chart */}
        <Card>
          <h3 className="font-semibold text-ink">Bar Chart</h3>
          <p className="text-lg font-bold text-ink">$860,472.29</p>
          <div className="mt-4">
            <StackedBars data={BARS} yLabels={["3k", "2k", "1k", "0"]} xLabels={["5Nov"]} max={3.6} height={200} />
          </div>
        </Card>

        {/* Line Chart Gradient */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-ink">Line Chart Gradient</h3>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-brand-600 outline-none focus:border-brand-300">
              {Object.keys(GRADIENT).map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col justify-between py-1 text-[10px] text-muted">
              {["100K", "80k", "60k", "40k"].map((l) => <span key={l}>{l}</span>)}
            </div>
            <div className="flex-1">
              <AreaChart
                values={GRADIENT[period]}
                labels={["10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25"]}
                marker={{ index: 7, label: "80,234" }}
                format={() => "80,234"}
                height={200}
              />
              <div className="mt-2 flex justify-between text-[10px] text-muted">
                {["10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25"].map((x) => <span key={x}>{x}</span>)}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
