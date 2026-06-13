"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useResource } from "@/components/dashboard/useResource";

type Ev = {
  id: string;
  _id?: string;       // present for the user's own (DB-persisted) events
  shared?: boolean;   // true for built-in schedules shown to everyone
  year: number;
  month: number;
  day: number;
  title: string;
  location: string;
  time: string;
  tone: string;
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TONE_KEYS = ["brand", "green", "blue", "amber", "red"];

const TONES: Record<string, string> = {
  brand: "border-brand-500 bg-brand-50 text-brand-700",
  green: "border-green-500 bg-green-50 text-green-700",
  blue: "border-blue-500 bg-blue-50 text-blue-700",
  amber: "border-amber-500 bg-amber-50 text-amber-700",
  red: "border-red-500 bg-red-50 text-red-700",
};

const TODAY = new Date();

/** Built-in schedules everyone sees, anchored to the current month — some land on today. */
function sharedSchedules(): Ev[] {
  const y = TODAY.getFullYear();
  const m = TODAY.getMonth();
  const d = TODAY.getDate();
  const dim = new Date(y, m + 1, 0).getDate();
  const at = (day: number) => Math.min(Math.max(day, 1), dim);
  const mk = (day: number, title: string, location: string, time: string, tone: string): Ev => ({
    id: `shared-${title}-${day}`, shared: true, year: y, month: m, day: at(day), title, location, time, tone,
  });
  return [
    mk(d, "Team standup", "Online · Zoom", "9:00am to 9:30am", "brand"),
    mk(d, "Design review", "Berlin HQ", "2:00pm to 3:00pm", "amber"),
    mk(d - 2, "Sprint planning", "Online", "11:00am to 12:00pm", "blue"),
    mk(d + 1, "1:1 with manager", "Room 4", "4:00pm to 4:30pm", "green"),
    mk(d + 3, "Product demo", "Main hall", "1:00pm to 2:00pm", "blue"),
    mk(d + 6, "Company all-hands", "Auditorium", "10:00am to 11:00am", "red"),
    mk(Math.max(1, d - 5), "Onboarding session", "Online", "3:00pm to 4:00pm", "brand"),
  ];
}

export default function CalendarPage() {
  const { items, create, remove } = useResource("schedules");
  const [cur, setCur] = useState({ year: TODAY.getFullYear(), month: TODAY.getMonth() });
  const [selected, setSelected] = useState<number | null>(TODAY.getDate());
  const [sortBy, setSortBy] = useState("Month");
  const [viewDay, setViewDay] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", location: "", time: "12:00pm to 1:00pm", tone: "brand" });

  const shared = useMemo(() => sharedSchedules(), []);
  const userEvents: Ev[] = useMemo(
    () =>
      items.map((e) => ({
        id: String(e._id),
        _id: String(e._id),
        year: Number(e.year),
        month: Number(e.month),
        day: Number(e.day),
        title: String(e.title ?? ""),
        location: String(e.location ?? ""),
        time: String(e.time ?? ""),
        tone: String(e.tone ?? "brand"),
      })),
    [items]
  );
  const events = useMemo(() => [...shared, ...userEvents], [shared, userEvents]);

  const firstWeekday = new Date(cur.year, cur.month, 1).getDay();
  const daysInMonth = new Date(cur.year, cur.month + 1, 0).getDate();
  const prevDays = new Date(cur.year, cur.month, 0).getDate();

  const cells = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstWeekday + 1;
    if (dayNum < 1) return { day: prevDays + dayNum, current: false };
    if (dayNum > daysInMonth) return { day: dayNum - daysInMonth, current: false };
    return { day: dayNum, current: true };
  });

  const monthEvents = events
    .filter((e) => e.year === cur.year && e.month === cur.month)
    .sort((a, b) => a.day - b.day);
  const eventsOn = (day: number) => monthEvents.filter((e) => e.day === day);

  const isToday = (day: number) => cur.year === TODAY.getFullYear() && cur.month === TODAY.getMonth() && day === TODAY.getDate();

  function shift(delta: number) {
    setSelected(null);
    setCur((c) => {
      const m = c.month + delta;
      return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  }
  function goToday() {
    setCur({ year: TODAY.getFullYear(), month: TODAY.getMonth() });
    setSelected(TODAY.getDate());
  }
  function openDay(day: number, ev?: Ev) {
    // Make the grid reflect what was clicked — jump to its month if needed, then highlight + view it.
    if (ev && (ev.year !== cur.year || ev.month !== cur.month)) setCur({ year: ev.year, month: ev.month });
    setSelected(day);
    setViewDay(day);
    setAdding(false);
    setForm({ title: "", location: "", time: "12:00pm to 1:00pm", tone: "brand" });
  }
  async function saveEvent() {
    if (!form.title.trim() || viewDay == null) return;
    await create({ year: cur.year, month: cur.month, day: viewDay, title: form.title.trim(), location: form.location.trim(), time: form.time, tone: form.tone });
    setAdding(false);
    setForm({ title: "", location: "", time: "12:00pm to 1:00pm", tone: "brand" });
  }

  const viewEvents = viewDay != null ? eventsOn(viewDay) : [];

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      {/* Details Day — full month agenda, click to view */}
      <Card className="scroll-thin max-h-[78vh] overflow-y-auto">
        <h3 className="font-semibold text-ink">Details Day</h3>
        <p className="text-sm text-muted">Don&apos;t miss scheduled events</p>
        <div className="mt-4 space-y-3">
          {monthEvents.length === 0 && <p className="text-sm text-muted">No events this month. Click a day to add one.</p>}
          {monthEvents.map((e) => (
            <button key={e.id} onClick={() => openDay(e.day, e)} className="w-full rounded-xl border border-slate-100 p-3 text-left transition hover:border-brand-200 hover:bg-slate-50">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{e.title}</p>
                <span className={`shrink-0 rounded-md border-l-2 px-2 py-0.5 text-[10px] ${TONES[e.tone]}`}>{e.time}</span>
              </div>
              {e.location && <p className="mt-1 text-xs text-muted">{e.location}</p>}
              <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                <Icon name="calendar" size={12} className="text-brand-500" /> {DAYS[new Date(e.year, e.month, e.day).getDay()]}, {MONTHS[e.month].slice(0, 3)} {e.day}, {e.year}
                {e.shared ? <span className="ml-1 rounded bg-slate-100 px-1.5 text-[9px] font-medium text-slate-500">Shared</span> : null}
              </p>
            </button>
          ))}
        </div>
      </Card>

      {/* Month grid */}
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => shift(-1)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"><Icon name="chevron" size={18} className="rotate-180" /></button>
            <h3 className="font-semibold text-ink">{MONTHS[cur.month]} {cur.year}</h3>
            <button onClick={() => shift(1)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"><Icon name="chevron" size={18} /></button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={goToday} className="rounded-lg bg-brand-100 px-3 py-1 text-sm font-medium text-brand-600 hover:bg-brand-200">Today</button>
            <span className="flex items-center gap-1 text-sm text-muted">
              Sort By:
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm outline-none">
                <option>Month</option><option>Week</option><option>Day</option>
              </select>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center text-xs text-muted">
          {DAYS.map((d) => <div key={d} className="pb-2 font-medium">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-slate-100">
          {cells.map((c, i) => {
            const evs = c.current ? eventsOn(c.day) : [];
            const isSel = c.current && selected === c.day;
            const today = c.current && isToday(c.day);
            return (
              <button
                key={i}
                onClick={() => c.current && openDay(c.day)}
                className={`min-h-[84px] bg-white p-1.5 text-left align-top text-xs transition hover:bg-brand-50/40 ${isSel ? "ring-2 ring-inset ring-brand-400" : ""}`}
              >
                <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 ${today ? "bg-brand-600 font-semibold text-white" : c.current ? "text-slate-500" : "text-slate-300"}`}>{c.day}</span>
                <div className="mt-1 space-y-1">
                  {evs.slice(0, 3).map((e) => (
                    <div key={e.id} className={`truncate rounded border-l-2 px-1 py-0.5 text-[10px] ${TONES[e.tone]}`}>{e.title}</div>
                  ))}
                  {evs.length > 3 && <div className="px-1 text-[10px] text-muted">+{evs.length - 3} more</div>}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Day view / add modal */}
      {viewDay != null && (
        <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/40 p-4" onClick={() => setViewDay(null)}>
          <div className="w-full max-w-md animate-scale-in rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-ink">
                  {DAYS[new Date(cur.year, cur.month, viewDay).getDay()]}, {MONTHS[cur.month]} {viewDay}, {cur.year}
                </h3>
                <p className="text-sm text-muted">{viewEvents.length} event{viewEvents.length === 1 ? "" : "s"}</p>
              </div>
              <button onClick={() => setViewDay(null)} className="text-slate-400 hover:text-ink"><Icon name="close" size={18} /></button>
            </div>

            <div className="scroll-thin max-h-64 space-y-2 overflow-y-auto">
              {viewEvents.length === 0 && <p className="rounded-lg bg-slate-50 p-3 text-sm text-muted">No events on this day yet.</p>}
              {viewEvents.map((e) => (
                <div key={e.id} className="rounded-xl border border-slate-100 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{e.title}</p>
                    <div className="flex items-center gap-2">
                      <span className={`shrink-0 rounded-md border-l-2 px-2 py-0.5 text-[10px] ${TONES[e.tone]}`}>{e.time}</span>
                      {e._id && (
                        <button onClick={() => remove(e._id!)} className="text-slate-300 hover:text-red-500" aria-label="Delete event"><Icon name="close" size={13} /></button>
                      )}
                    </div>
                  </div>
                  {e.location && <p className="mt-1 flex items-center gap-1 text-xs text-muted"><Icon name="users" size={12} /> {e.location}</p>}
                  {e.shared && <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 text-[9px] font-medium text-slate-500">Shared</span>}
                </div>
              ))}
            </div>

            {/* Add (inline, no prompt) */}
            {adding ? (
              <div className="mt-4 space-y-2 rounded-xl border border-brand-100 bg-brand-50/40 p-3">
                <input autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} onKeyDown={(e) => e.key === "Enter" && saveEvent()} placeholder="Event title" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400" />
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location (optional)" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400" />
                <div className="flex gap-2">
                  <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="Time" className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400" />
                  <select value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm capitalize outline-none">
                    {TONE_KEYS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEvent} disabled={!form.title.trim()} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">Save event</button>
                  <button onClick={() => setAdding(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAdding(true)} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2.5 text-sm text-slate-500 hover:border-brand-300 hover:text-brand-600">
                <Icon name="plus" size={16} /> Add event
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
