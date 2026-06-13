"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { avatarFor } from "@/lib/assets";

/* Measure container width so charts map mouse position to data accurately. */
function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, w };
}

/* Catmull-Rom -> cubic bezier smoothing for natural-looking curves. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return pts.length ? `M${pts[0].x} ${pts[0].y}` : "";
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function coords(values: number[], w: number, h: number, pad = 8) {
  const max = Math.max(...values);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0;
  return values.map((v, i) => ({
    x: pad + i * step,
    y: h - pad - ((v - min) / range) * (h - pad * 2),
    v,
  }));
}

type LineProps = {
  values: number[];
  labels?: string[];
  height?: number;
  color?: string;
  area?: boolean;
  format?: (v: number) => string;
  marker?: { index: number; label: string };
};

function LineChart({
  values,
  labels,
  height = 160,
  color = "#7c47ff",
  area = true,
  format = (v) => v.toLocaleString(),
  marker,
}: LineProps) {
  const { ref, w } = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const pts = w > 0 ? coords(values, w, height) : [];
  const gid = `g-${color.replace("#", "")}`;
  const mk = marker && pts[marker.index] ? pts[marker.index] : null;

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const fill = pts.length ? `${line} L${pts[pts.length - 1].x} ${height} L${pts[0].x} ${height} Z` : "";

  function onMove(e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const frac = Math.max(0, Math.min(1, (x - 8) / (rect.width - 16)));
    setHover(Math.round(frac * (values.length - 1)));
  }

  const active = hover != null ? pts[hover] : null;

  return (
    <div
      ref={ref}
      className="relative w-full select-none"
      style={{ height }}
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      {w > 0 && (
        <svg width={w} height={height} className="overflow-visible">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {area && <path d={fill} fill={`url(#${gid})`} />}
          <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {mk && !active && (
            <>
              <line x1={mk.x} y1={0} x2={mk.x} y2={height} stroke={color} strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
              <circle cx={mk.x} cy={mk.y} r="5" fill="#fff" stroke={color} strokeWidth="3" />
            </>
          )}
          {active && (
            <>
              <line x1={active.x} y1={0} x2={active.x} y2={height} stroke={color} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
              <circle cx={active.x} cy={active.y} r="6" fill="#fff" stroke={color} strokeWidth="3" />
            </>
          )}
        </svg>
      )}

      {active && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-brand-600 px-2 py-1 text-center text-[11px] font-semibold text-white shadow-md"
          style={{ left: active.x, top: active.y - 10 }}
        >
          {format(active.v)}
          {labels?.[hover!] && <div className="text-[9px] font-normal text-white/70">{labels[hover!]}</div>}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-brand-600" />
        </div>
      )}

      {mk && !active && marker && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-brand-600 px-2 py-1 text-center text-[11px] font-semibold text-white shadow-md"
          style={{ left: mk.x, top: mk.y - 10 }}
        >
          {marker.label}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-brand-600" />
        </div>
      )}
    </div>
  );
}

export function AreaChart(props: LineProps) {
  return <LineChart {...props} area />;
}

/* Decorative (non-interactive) filled sparkline for stat cards. */
export function MiniArea({
  values,
  height = 56,
  color = "#7c47ff",
  smooth = true,
}: {
  values: number[];
  height?: number;
  color?: string;
  smooth?: boolean;
}) {
  const { ref, w } = useWidth();
  const pts = w > 0 ? coords(values, w, height, 4) : [];
  const line = smooth ? smoothPath(pts) : pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
  const fill = pts.length ? `${line} L${pts[pts.length - 1].x} ${height} L${pts[0].x} ${height} Z` : "";
  const gid = `mini-${color.replace("#", "")}`;
  return (
    <div ref={ref} className="w-full" style={{ height }}>
      {w > 0 && (
        <svg width={w} height={height}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={fill} fill={`url(#${gid})`} />
          <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

export function Sparkline(props: LineProps) {
  return <LineChart height={40} {...props} area={props.area ?? true} />;
}

/* ------------------------------ Bar chart ------------------------------ */

export function BarChart({
  values,
  labels,
  height = 200,
  color = "#7c47ff",
  format = (v: number) => v.toLocaleString(),
}: {
  values: number[];
  labels?: string[];
  height?: number;
  color?: string;
  format?: (v: number) => string;
}) {
  const max = Math.max(...values, 1);
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {values.map((v, i) => (
        <div
          key={i}
          className="relative flex flex-1 cursor-pointer flex-col justify-end"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        >
          {hover === i && (
            <div className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-brand-600 px-2 py-1 text-[11px] font-semibold text-white shadow-md">
              {format(v)}
              {labels?.[i] && <span className="ml-1 font-normal text-white/70">{labels[i]}</span>}
            </div>
          )}
          <div
            className="rounded-t-md transition-all"
            style={{
              height: `${(v / max) * 100}%`,
              background: hover === i ? color : i % 2 ? color : `${color}66`,
              opacity: hover != null && hover !== i ? 0.5 : 1,
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* --------------- Active users bars (white bar + dark cap, gridlines) -------------- */

export function ActiveUsersChart({
  values,
  max = 300,
  height = 180,
}: {
  values: number[];
  max?: number;
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const levels = [300, 200, 100];
  return (
    <div className="flex gap-3" style={{ height }}>
      <div className="flex flex-col justify-between py-1 text-[11px] font-medium text-white/85">
        {levels.map((l) => <span key={l}>{l}</span>)}
      </div>
      <div className="relative flex-1">
        {levels.map((l) => (
          <div
            key={l}
            className="absolute left-0 right-0 border-t border-dashed border-white/30"
            style={{ top: `${(1 - l / max) * 100}%` }}
          />
        ))}
        <div className="absolute inset-0 flex items-end justify-between gap-2">
          {values.map((v, i) => {
            const h = Math.min(100, (v / max) * 100);
            return (
              <div
                key={i}
                className="relative flex h-full flex-1 items-end justify-center"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                {hover === i && (
                  <div
                    className="pointer-events-none absolute z-10 -translate-y-1 rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-brand-700 shadow"
                    style={{ bottom: `${h}%` }}
                  >
                    {v}
                  </div>
                )}
                <div className="flex w-[5px] flex-col overflow-hidden rounded-full" style={{ height: `${h}%` }}>
                  <div className="bg-[#4b2bb3]" style={{ flex: "0 0 32%" }} />
                  <div className="flex-1 bg-white" />
                </div>
                {((hover == null && i === 0) || hover === i) && (
                  <span
                    className="pointer-events-none absolute h-2.5 w-2.5 rounded-full border-2 border-[#4b2bb3] bg-white"
                    style={{ bottom: `calc(${h}% - 5px)` }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* --------------- Impression bars (rounded, one highlighted) -------------- */

export function ImpressionChart({
  values,
  labels,
  activeIndex = -1,
  max,
  height = 130,
}: {
  values: number[];
  labels: string[];
  activeIndex?: number;
  max?: number;
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const top = max ?? Math.max(...values, 20);
  const ticks = [20, 10, 0];
  return (
    <div>
      <div className="flex gap-3" style={{ height }}>
        <div className="flex flex-col justify-between py-1 text-[10px] text-muted">
          {ticks.map((t) => <span key={t}>{t}</span>)}
        </div>
        <div className="flex flex-1 items-end justify-around gap-4">
          {values.map((v, i) => {
            const active = i === activeIndex;
            return (
              <div
                key={i}
                className="relative flex h-full flex-1 flex-col items-center justify-end"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                {hover === i && (
                  <div className="pointer-events-none absolute -top-1 z-10 -translate-y-full rounded-md bg-brand-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow">
                    {v}
                  </div>
                )}
                <div
                  className="w-full max-w-[34px] rounded-t-lg transition-colors"
                  style={{
                    height: `${(v / top) * 100}%`,
                    background: active ? "#6c2fd6" : "#d8c9ff",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex" style={{ paddingLeft: 28 }}>
        <div className="flex flex-1 justify-around text-[10px] text-muted">
          {labels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      </div>
    </div>
  );
}

/* --------------- Multi-series area chart (e.g. Watchlists) -------------- */

export function MultiLineChart({
  series,
  xLabels,
  yMax = 450,
  yTicks = [400, 300, 200, 100, 0],
  yTickLabels,
  height = 240,
  smooth = false,
  dashed = false,
}: {
  series: { values: number[]; color: string }[];
  xLabels: string[];
  yMax?: number;
  yTicks?: number[];
  yTickLabels?: string[];
  height?: number;
  smooth?: boolean;
  dashed?: boolean;
}) {
  const { ref, w } = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const n = series[0]?.values.length ?? 0;
  const padTop = 12;
  const plotH = height - padTop;

  // Axis ticks: either custom display strings (evenly spaced) or numeric values.
  const ticks = yTickLabels
    ? yTickLabels.map((label, i) => ({ label, frac: i / (yTickLabels.length - 1) }))
    : yTicks.map((t) => ({ label: String(t), frac: 1 - t / yMax }));

  const toXY = (vals: number[]) =>
    vals.map((v, i) => ({
      x: n > 1 ? (i / (n - 1)) * w : 0,
      y: padTop + plotH - (v / yMax) * plotH,
      v,
    }));

  function onMove(e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHover(Math.round(frac * (n - 1)));
  }

  return (
    <div>
      <div className="flex gap-3" style={{ height }}>
        <div className="flex flex-col justify-between text-[10px] text-muted" style={{ paddingTop: padTop }}>
          {ticks.map((t, i) => <span key={i}>{t.label}</span>)}
        </div>
        <div
          ref={ref}
          className="relative flex-1 select-none"
          style={{ height }}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          {w > 0 && (
            <svg width={w} height={height} className="overflow-visible">
              <defs>
                {series.map((s, si) => (
                  <linearGradient key={si} id={`ml-${si}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                  </linearGradient>
                ))}
              </defs>
              {ticks.map((t, i) => {
                const y = padTop + t.frac * plotH;
                return <line key={i} x1={0} y1={y} x2={w} y2={y} stroke="#eef0f5" strokeWidth="1" />;
              })}
              {series.map((s, si) => {
                const pts = toXY(s.values);
                const line = smooth
                  ? smoothPath(pts)
                  : pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
                const fill = `${line} L${w} ${height} L0 ${height} Z`;
                return (
                  <g key={si}>
                    {!dashed && <path d={fill} fill={`url(#ml-${si})`} />}
                    <path
                      d={line}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={dashed ? 2 : 3}
                      strokeDasharray={dashed ? "5 5" : undefined}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                );
              })}
              {hover != null && (
                <line x1={toXY(series[0].values)[hover].x} y1={0} x2={toXY(series[0].values)[hover].x} y2={height} stroke="#cbd2e0" strokeWidth="1" strokeDasharray="4 4" />
              )}
              {hover != null && series.map((s, si) => {
                const p = toXY(s.values)[hover];
                return <circle key={si} cx={p.x} cy={p.y} r="5" fill="#fff" stroke={s.color} strokeWidth="3" />;
              })}
            </svg>
          )}

          {hover != null && w > 0 && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md px-2 py-0.5 text-[11px] font-semibold text-white shadow-md"
              style={{ left: toXY(series[0].values)[hover].x, top: toXY(series[0].values)[hover].y - 10, background: series[0].color }}
            >
              {series[0].values[hover]}
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 flex" style={{ paddingLeft: 30 }}>
        <div className="flex flex-1 justify-between text-[10px] text-muted">
          {xLabels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      </div>
    </div>
  );
}

/* --------------- Lollipop chart with avatars (Sales closed) -------------- */

export function LollipopChart({
  values,
  seeds,
  max = 300,
  yTicks = [300, 200, 100, 0],
  height = 230,
}: {
  values: number[];
  seeds: string[];
  max?: number;
  yTicks?: number[];
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div>
      <div className="flex gap-3" style={{ height }}>
        <div className="flex flex-col justify-between text-[11px] text-muted">
          {yTicks.map((t) => <span key={t}>{t}</span>)}
        </div>
        <div className="relative flex-1">
          {yTicks.map((t) => (
            <div key={t} className="absolute left-0 right-0 border-t border-dashed border-slate-200" style={{ top: `${(1 - t / max) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end justify-between gap-1">
            {values.map((v, i) => (
              <div
                key={i}
                className="relative flex h-full flex-1 items-end justify-center"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                {hover === i && (
                  <div className="pointer-events-none absolute z-10 rounded-md bg-brand-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow" style={{ bottom: `calc(${(v / max) * 100}% + 6px)` }}>
                    {v}
                  </div>
                )}
                <div className="relative w-1.5 rounded-full bg-gradient-to-b from-brand-300 to-brand-100" style={{ height: `${(v / max) * 100}%` }}>
                  <span className={`absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full ${hover === i ? "bg-brand-700" : "bg-brand-600"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Avatars aligned under each bar */}
      <div className="mt-2 flex" style={{ paddingLeft: 28 }}>
        <div className="flex flex-1 justify-between gap-1">
          {seeds.map((s, i) => (
            <div key={i} className="flex flex-1 justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarFor(s)} alt="" className="h-6 w-6 rounded-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------- Stacked two-tone bars (Payments / Loan income) -------------- */

export function StackedBars({
  data,
  yLabels,
  xLabels,
  max,
  height = 200,
  colors = ["#6d28d9", "#c4b5fd"],
}: {
  data: { bottom: number; top: number }[];
  yLabels: string[];
  xLabels: string[];
  max: number;
  height?: number;
  colors?: [string, string] | string[];
}) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div>
      <div className="flex gap-3" style={{ height }}>
        <div className="flex flex-col justify-between text-[10px] text-muted">
          {yLabels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
        <div className="relative flex-1">
          {yLabels.map((_, i) => (
            <div key={i} className="absolute left-0 right-0 border-t border-dashed border-slate-100" style={{ top: `${(i / (yLabels.length - 1)) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end justify-between gap-2 sm:gap-4">
            {data.map((d, i) => {
              const total = d.bottom + d.top;
              return (
                <div
                  key={i}
                  className="relative flex h-full flex-1 items-end justify-center"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  {hover === i && (
                    <div className="pointer-events-none absolute z-10 -translate-y-1 rounded-md bg-brand-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow" style={{ bottom: `${(total / max) * 100}%` }}>
                      {total.toLocaleString()}
                    </div>
                  )}
                  <div className="flex w-5 flex-col justify-end overflow-hidden rounded-md sm:w-8" style={{ height: `${(total / max) * 100}%` }}>
                    <div style={{ height: `${(d.top / total) * 100}%`, background: colors[1] }} />
                    <div style={{ height: `${(d.bottom / total) * 100}%`, background: colors[0] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted" style={{ paddingLeft: 28 }}>
        {xLabels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </div>
  );
}

/* --------------- Two-segment semicircle gauge (Pie chart) -------------- */

export function DualGauge({
  a,
  b,
}: {
  a: { value: number; color: string };
  b: { value: number; color: string };
}) {
  const r = 56;
  const C = Math.PI * r;
  const total = a.value + b.value || 1;
  const aFrac = a.value / total;
  const aLen = aFrac * C;
  const angle = Math.PI - aFrac * Math.PI; // boundary angle from the left
  const kx = 70 + r * Math.cos(angle);
  const ky = 70 - r * Math.sin(angle);
  return (
    <svg viewBox="0 0 140 92" className="w-56 overflow-visible">
      {/* Women (b) — full light arc */}
      <path d="M14 70 A56 56 0 0 1 126 70" fill="none" stroke={b.color} strokeWidth="16" strokeLinecap="round" />
      {/* Men (a) — dark arc from the left */}
      <path d="M14 70 A56 56 0 0 1 126 70" fill="none" stroke={a.color} strokeWidth="16" strokeLinecap="round" strokeDasharray={`${aLen} ${C}`} />
      {/* Knob at the boundary */}
      <circle cx={kx} cy={ky} r="11" fill={b.color} stroke="#fff" strokeWidth="3" />
    </svg>
  );
}

/* ------------------------------ Donut gauge ------------------------------ */

export function DonutGauge({
  percent,
  label,
  color = "#7c47ff",
}: {
  percent: number;
  label?: string;
  color?: string;
}) {
  const [hover, setHover] = useState(false);
  const r = 56;
  const c = Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="flex flex-col items-center" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <svg viewBox="0 0 140 90" className="w-40 overflow-visible">
        <path d="M14 70 A56 56 0 0 1 126 70" fill="none" stroke="#ece9ff" strokeWidth="14" strokeLinecap="round" />
        <path
          d="M14 70 A56 56 0 0 1 126 70"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset .3s" }}
        />
        {hover && (
          <text x="70" y="60" textAnchor="middle" className="fill-ink text-lg font-bold">
            {percent}%
          </text>
        )}
      </svg>
      {label && <span className="-mt-3 text-sm font-semibold text-ink">{label}</span>}
    </div>
  );
}
