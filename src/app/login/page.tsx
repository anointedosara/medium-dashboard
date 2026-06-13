"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { BrandMark } from "@/components/BrandLogo";
import { GoogleIcon, FacebookIcon } from "@/components/auth/SocialIcons";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Login failed.");
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
            <h1 className="text-3xl font-bold text-ink">Login</h1>
            <p className="mt-1 text-sm text-muted">How do i get started lorem ipsum dolor at?</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div className="text-right">
                <Link href="/forgot-password" className="text-sm font-medium text-brand-600">
                  Forgot password
                </Link>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-ink transition hover:bg-slate-50"
              >
                <GoogleIcon /> Sign in with Google
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-ink transition hover:bg-slate-50"
              >
                <FacebookIcon /> Sign in with Facebook
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-muted">
              Don&apos;t have an account.{" "}
              <Link href="/signup" className="font-medium text-brand-600">
                Sign up
              </Link>
            </p>
          </div>
        </div>
        <AuthPanel />
      </div>
    </div>
  );
}
