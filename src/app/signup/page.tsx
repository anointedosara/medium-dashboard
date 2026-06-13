"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { BrandMark } from "@/components/BrandLogo";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-canvas p-4 sm:p-8">
      <div className="card grid w-full max-w-6xl gap-6 p-4 sm:p-6 lg:grid-cols-2">
        <div className="flex flex-col justify-center px-4 py-8 sm:px-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <BrandMark />
            </div>
            <h1 className="text-2xl font-bold text-ink">Sign up</h1>
            <p className="mt-1 text-sm text-muted">Start your 30-day free trial.</p>

            <form onSubmit={submit} className="mt-6 space-y-3">
              <Field
                placeholder="Full Name"
                value={form.fullName}
                onChange={(v) => setForm({ ...form, fullName: v })}
                autoComplete="name"
              />
              <Field
                placeholder="Email Address"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                autoComplete="email"
              />
              <div className="relative">
                <Field
                  placeholder="Password"
                  type={show ? "text" : "password"}
                  value={form.password}
                  onChange={(v) => setForm({ ...form, password: v })}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  aria-label="Toggle password visibility"
                >
                  {show ? "🙈" : "👁️"}
                </button>
              </div>

              <p className="text-xs text-muted">
                You are agreeing to the{" "}
                <span className="font-medium text-brand-600">Terms of Services</span> and{" "}
                <span className="font-medium text-brand-600">Privacy Policy</span>
              </p>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                {loading ? "Creating account…" : "Get started"}
              </button>
            </form>

            <p className="mt-5 text-sm text-muted">
              Already a member?{" "}
              <Link href="/login" className="font-medium text-brand-600">
                Sign in
              </Link>
            </p>
          </div>
        </div>
        <AuthPanel />
      </div>
    </div>
  );
}

function Field({
  placeholder,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required
      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
    />
  );
}
