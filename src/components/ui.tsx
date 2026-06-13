import { avatarFor } from "@/lib/assets";

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`card p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function Avatar({ seed, src, size = 36 }: { seed: string; src?: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || avatarFor(seed)}
      alt=""
      style={{ width: size, height: size }}
      className="rounded-full object-cover"
    />
  );
}

export function Badge({ tone = "brand", children }: { tone?: string; children: React.ReactNode }) {
  const tones: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tones[tone] ?? tones.brand}`}>
      {children}
    </span>
  );
}

export function StatCard({
  icon,
  label,
  value,
  accent = "brand",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  const accents: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accents[accent]}`}>
          {icon}
        </span>
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-ink">{value}</p>
      <div className="mt-3 h-1 rounded-full bg-slate-100">
        <div className={`h-1 w-2/3 rounded-full ${accents[accent].split(" ")[1].replace("text", "bg")}`} />
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold text-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: { variant?: "primary" | "outline" | "ghost" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    outline: "border border-slate-200 text-ink hover:bg-slate-50",
    ghost: "text-brand-600 hover:bg-brand-50",
  };
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  ...props
}: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>}
      <input
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
        {...props}
      />
    </label>
  );
}
