"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { DonutGauge, ImpressionChart, MiniArea, MultiLineChart } from "@/components/charts";
import { useUser } from "@/components/dashboard/UserProvider";
import { avatarFor } from "@/lib/assets";

const HASHTAGS = [
  { cat: "Sport & Health", tags: ["#sport", "#fit", "#health"] },
  { cat: "Animals", tags: ["#animal", "#nature", "#health"] },
  { cat: "Beauty", tags: ["#beauty", "#makeup", "#fashion"] },
  { cat: "Art", tags: ["#art", "#artist", "#love"] },
];

const ACTIONS = [
  { label: "Profile visits", value: 250 },
  { label: "Website clicks", value: 115 },
  { label: "Calls", value: 67 },
  { label: "Getvdirection", value: 164 },
  { label: "Emails", value: 170 },
];

export default function ProfileOverviewPage() {
  const { user } = useUser();
  const fields = [user?.fullName, user?.username, user?.phone, user?.city, user?.country, user?.zip, user?.bio, user?.timezone];
  const completeness = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
      <div className="space-y-5">
        {/* Stat cards: bigger decorative sparkline + value */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat value="635" delta="+21.01%" label="Average Likes" color="#7c47ff" values={[20, 50, 25, 60, 30, 70, 45, 58]} />
          <Stat value="123" delta="+4.399%" label="Comments recived" color="#22c55e" values={[30, 40, 25, 55, 45, 65, 50, 62]} />
          <Stat value="23%" delta="-7.9%" label="Av. Engagement rate" color="#38bdf8" values={[40, 35, 55, 45, 60, 50, 65, 48]} negative />
        </div>

        {/* Followers + Actions */}
        <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-ink">Followers</h3>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" /> Income</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-brand-500" /> Outcome</span>
              </div>
            </div>
            <MultiLineChart
              smooth
              series={[
                { values: [180, 280, 230, 360, 420, 380, 300, 250, 290, 230], color: "#fb5151" },
                { values: [200, 240, 210, 190, 230, 320, 360, 280, 240, 210], color: "#7c47ff" },
              ]}
              xLabels={["25.02", "", "26.02", "", "27.02", "", "28.02", "", "29.02", ""]}
              yMax={460}
              yTickLabels={["500k", "100k", "50k", "0"]}
              height={200}
            />
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-ink">Actions</h3>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] text-muted">?</span>
            </div>
            <div className="space-y-3.5">
              {ACTIONS.map((a) => (
                <div key={a.label} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0">
                  <span className="text-sm text-slate-600">{a.label}</span>
                  <span className="text-sm font-semibold text-brand-600">{a.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Interaction + Best time */}
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-ink">Interaction</h3>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] text-muted">?</span>
            </div>
            <MultiLineChart
              smooth
              dashed
              series={[
                { values: [60, 120, 90, 200, 150, 80, 120, 60, 180, 90], color: "#fb5151" },
                { values: [120, 90, 160, 110, 70, 130, 90, 150, 80, 110], color: "#6366f1" },
              ]}
              xLabels={["25.02", "", "26.02", "", "27.02", "", "28.02", "", "29.02", ""]}
              yMax={260}
              yTickLabels={["250", "150", "50", "0"]}
              height={180}
            />
          </Card>

          <BestTime />
        </div>

        {/* Gender + Age range */}
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <h3 className="mb-3 font-semibold text-ink">Gender</h3>
            <DonutGauge percent={45} />
            <div className="mt-3 flex justify-center gap-6 text-sm">
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-brand-600" /> <b className="text-ink">35%</b> <span className="text-muted">Men</span></span>
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-brand-200" /> <b className="text-ink">45%</b> <span className="text-muted">Women</span></span>
            </div>
          </Card>

          <AgeRange />
        </div>
      </div>

      {/* My profile rail */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink">My profile</h3>
          <div className="flex gap-2 text-slate-400">
            <Link href="/dashboard/profile/teams" title="Teams" className="hover:text-brand-600">
              <Icon name="users" size={18} />
            </Link>
            <Link href="/dashboard/account/settings" title="Settings" className="hover:text-brand-600">
              <Icon name="settings" size={18} />
            </Link>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={user?.avatar || avatarFor(user?.email || "u")} alt="" className="h-24 w-24 rounded-full object-cover ring-4 ring-brand-100" />
          <p className="mt-3 font-semibold text-ink">{user?.username || user?.fullName}</p>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-ink">VIP Training Course</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs font-medium text-brand-600">{completeness}%</span>
            <div className="h-1.5 flex-1 rounded-full bg-brand-100">
              <div className="h-1.5 rounded-full bg-brand-500 transition-all" style={{ width: `${completeness}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm font-medium text-ink">Hashtags sets</p>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
            <Icon name="settings" size={14} />
          </span>
        </div>

        <div className="mt-3 divide-y divide-slate-100">
          {HASHTAGS.map((h) => (
            <HashtagSet key={h.cat} cat={h.cat} tags={h.tags} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function BestTime() {
  const [view, setView] = useState<"Days" | "Hours">("Days");
  const data =
    view === "Days"
      ? { values: [80, 30, 55, 40, 120, 25, 70], labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], active: 4 }
      : { values: [40, 70, 50, 90, 60, 110, 75, 50], labels: ["6a", "9a", "12p", "3p", "6p", "9p", "12a", "3a"], active: 5 };
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-ink">Best time</h3>
        <div className="flex gap-3 text-sm">
          <button onClick={() => setView("Days")} className={view === "Days" ? "font-medium text-ink" : "text-muted"}>Days</button>
          <button onClick={() => setView("Hours")} className={view === "Hours" ? "font-medium text-brand-600" : "text-muted"}>Hours</button>
        </div>
      </div>
      <ImpressionChart values={data.values} labels={data.labels} activeIndex={data.active} max={130} height={150} />
    </Card>
  );
}

function AgeRange() {
  const [view, setView] = useState<"All" | "Men" | "Women">("All");
  const buckets = [
    { label: "13-17", men: 40, women: 55 },
    { label: "18-24", men: 28, women: 45 },
    { label: "25-34", men: 36, women: 50 },
    { label: "35-44", men: 48, women: 40 },
    { label: "45-54", men: 65, women: 52 },
    { label: "55-64", men: 22, women: 35 },
    { label: "65-74+", men: 40, women: 48 },
  ];
  const max = 70;
  const tabs = ["All", "Men", "Women"] as const;
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-ink">Age range</h3>
        <div className="flex gap-3 text-sm">
          {tabs.map((t) => (
            <button key={t} onClick={() => setView(t)} className={view === t ? "font-medium text-brand-600" : "text-muted"}>{t}</button>
          ))}
        </div>
      </div>
      <div className="flex items-end justify-between gap-2" style={{ height: 150 }}>
        {buckets.map((b) => (
          <div key={b.label} className="flex h-full flex-1 items-end justify-center gap-1">
            {(view === "All" || view === "Men") && (
              <div className="w-2 rounded-full bg-brand-600 transition-all" style={{ height: `${(b.men / max) * 100}%` }} title={`Men: ${b.men}`} />
            )}
            {(view === "All" || view === "Women") && (
              <div className="w-2 rounded-full bg-brand-200 transition-all" style={{ height: `${(b.women / max) * 100}%` }} title={`Women: ${b.women}`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted">
        {buckets.map((b) => <span key={b.label}>{b.label}</span>)}
      </div>
    </Card>
  );
}

function HashtagSet({ cat, tags }: { cat: string; tags: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-3">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between">
        <span className="text-sm font-medium text-ink">{cat}</span>
        <Icon name="chevron" size={16} className={`text-slate-400 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="mt-1.5 flex flex-wrap gap-2">
          {tags.map((t) => <span key={t} className="text-xs text-muted">{t}</span>)}
        </div>
      )}
    </div>
  );
}

function Stat({
  value,
  delta,
  label,
  color,
  values,
  negative,
}: {
  value: string;
  delta: string;
  label: string;
  color: string;
  values: number[];
  negative?: boolean;
}) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="shrink-0 rounded-xl p-2" style={{ background: `${color}14`, width: 96 }}>
          <MiniArea values={values} color={color} height={52} />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-ink">{value}</span>
            <span className={`text-xs font-medium ${negative ? "text-red-500" : "text-brand-600"}`}>{delta}</span>
          </div>
          <p className="text-sm text-muted">{label}</p>
        </div>
      </div>
    </Card>
  );
}
