"use client";

import { Card, StatCard } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { AreaChart, ActiveUsersChart, ImpressionChart, Sparkline } from "@/components/charts";
import { useUser } from "@/components/dashboard/UserProvider";

const EARNINGS = [
  { title: "Bento 3D Kit", sub: "Illustration", color: "#7c47ff" },
  { title: "Bento 3D Kit", sub: "Coded Template", color: "#22c55e" },
  { title: "Bento 3D Kit", sub: "Illustration", color: "#fb7185" },
];

const AGE_LABELS = ["10 to 15", "15 to 20", "20 to 25", "25 to 30", "30 to 35", "35 to 40"];

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
      {/* Main column */}
      <div className="space-y-5">
        <Card>
          <h3 className="mb-4 font-semibold text-ink">Active users right now</h3>
          <div className="grid gap-5 md:grid-cols-[150px_1fr]">
            <div>
              <p className="text-5xl font-bold text-brand-600">300</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <Icon name="doc" size={14} /> Page views per minute
              </div>
              <div className="mt-4">
                <Sparkline values={[10, 20, 14, 28, 18, 30, 22, 34]} />
                <p className="mt-1 text-[11px] text-muted">Upgrade your payout method in setting</p>
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 p-4">
              <ActiveUsersChart
                values={[300, 210, 250, 150, 240, 200, 280, 160, 230, 130, 210, 170]}
                height={180}
              />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={<Icon name="users" size={16} />} label="Users" value="35k" accent="brand" />
          <StatCard icon={<Icon name="apps" size={16} />} label="Clicks" value="1m" accent="blue" />
          <StatCard icon={<Icon name="tag" size={16} />} label="Sales" value="345$" accent="red" />
          <StatCard icon={<Icon name="grid" size={16} />} label="Items" value="68" accent="green" />
        </div>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-ink">Sales by Age</h3>
            <span className="flex items-center gap-1 text-xs text-brand-600">
              <span className="h-2 w-2 rounded-full bg-brand-500" /> Sales
            </span>
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col justify-between py-1 text-[10px] text-muted">
              {[...AGE_LABELS].reverse().map((l) => <span key={l}>{l}</span>)}
            </div>
            <div className="flex-1">
              <AreaChart
                values={[30, 80, 60, 100, 70, 120, 90, 130, 80, 60, 90, 50]}
                labels={["10", "20", "40", "60", "80", "100", "200", "300", "400", "500"]}
                height={200}
              />
              <div className="mt-2 flex justify-between text-[10px] text-muted">
                {["10", "20", "40", "60", "80", "100", "200", "300", "400", "500"].map((x) => <span key={x}>{x}</span>)}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right rail */}
      <div className="space-y-5">
        <Card>
          <h3 className="font-semibold text-ink">Your earning this month</h3>
          <p className="mt-3 text-4xl font-bold text-brand-600">735.2$</p>
          <p className="mt-2 text-sm text-muted">Update your payout method in Setting</p>
          <button className="mt-4 w-full rounded-lg border border-brand-200 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50">
            Withdraw All Earnings
          </button>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold text-ink">Earnings by item</h3>
          <div className="space-y-3">
            {EARNINGS.map((e, i) => (
              <div key={i} className="flex items-center gap-3">
                <Cube color={e.color} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{e.title}</p>
                  <p className="truncate text-xs text-muted">{e.sub}</p>
                </div>
                <Icon name="chevron" size={16} className="text-slate-300" />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold text-ink">Impression</h3>
          <ImpressionChart
            values={[24, 6, 22, 8]}
            labels={["Mon", "Tue", "Wed", "Thu"]}
            activeIndex={2}
            max={26}
          />
        </Card>

        {user && (
          <p className="px-1 text-center text-[11px] text-muted">
            Signed in as {user.email}
          </p>
        )}
      </div>
    </div>
  );
}

function Cube({ color }: { color: string }) {
  return (
    <span
      className="flex h-9 w-9 items-center justify-center rounded-lg"
      style={{ background: `${color}1a` }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2 21 7v10l-9 5-9-5V7z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 2v20M3 7l9 5 9-5" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
