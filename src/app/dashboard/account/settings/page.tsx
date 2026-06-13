"use client";

import { useEffect, useRef, useState } from "react";
import { Card, Button } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useUser } from "@/components/dashboard/UserProvider";
import { avatarFor } from "@/lib/assets";

const TIMEZONES = [
  "Pacific Standard Time",
  "Mountain Standard Time",
  "Central Standard Time",
  "Eastern Standard Time",
  "Greenwich Mean Time",
  "Central European Time",
  "West Africa Time",
];

// Fields that must be filled before the form can be saved.
const REQUIRED = ["fullName", "lastName", "username", "phone", "city", "country", "zip", "bio", "timezone"];

export default function SettingsPage() {
  const { user, refresh } = useUser();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bioFormat, setBioFormat] = useState("Normal text");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        username: user.username ?? "",
        phone: user.phone ?? "",
        city: user.city ?? "",
        country: user.country ?? "",
        zip: user.zip ?? "",
        bio: user.bio ?? "",
        timezone: user.timezone ?? "Pacific Standard Time",
      });
    }
  }, [user]);

  const missing = REQUIRED.filter((k) => !form[k]?.trim());
  const isComplete = missing.length === 0;

  async function save() {
    if (!isComplete) {
      setError("Please fill in all fields before saving.");
      return;
    }
    setError("");
    setSaving(true);
    setSaved(false);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    await refresh();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function pickFile() {
    fileRef.current?.click();
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: reader.result }),
      });
      await refresh();
    };
    reader.readAsDataURL(file);
  }

  async function deletePhoto() {
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar: "" }),
    });
    await refresh();
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const avatar = user?.avatar || avatarFor(user?.email || "u");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">Setting Details</h2>
          <p className="text-sm text-muted">Update your photo and personal details here.</p>
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-sm text-red-500">{error}</span>}
          <Button variant="outline" onClick={() => refresh()}>Cancel</Button>
          <Button onClick={save} disabled={saving || !isComplete}>{saving ? "Saving…" : saved ? "Saved ✓" : "Save"}</Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <h3 className="mb-4 font-semibold text-ink">Personal information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full Name" value={form.fullName} onChange={set("fullName")} required />
            <Input label="Last Name" value={form.lastName} onChange={set("lastName")} required />
            <Input label="Email Address" value={form.email} disabled />
            <Input label="Username" value={form.username} onChange={set("username")} required />
            <Input label="Phone No" value={form.phone} onChange={set("phone")} required />
            <Input label="City" value={form.city} onChange={set("city")} required />
            <Input label="Country Name" value={form.country} onChange={set("country")} required />
            <Input label="Zip code" value={form.zip} onChange={set("zip")} required />
          </div>

          {/* Bio */}
          <div className="mt-4">
            <span className="mb-1.5 block text-sm font-medium text-ink">
              Bio<span className="font-normal text-muted"> (Write a short introduction)</span>
            </span>
            <select
              value={bioFormat}
              onChange={(e) => setBioFormat(e.target.value)}
              className="mb-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600 outline-none focus:border-brand-400 focus:bg-white"
            >
              {["Normal text", "Heading 1", "Heading 2", "Quote"].map((o) => <option key={o}>{o}</option>)}
            </select>
            <textarea
              value={form.bio}
              onChange={set("bio")}
              rows={4}
              required
              placeholder="Write a short introduction…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {/* Timezone */}
          <div className="mt-4">
            <span className="mb-1.5 block text-sm font-medium text-ink">Timezone</span>
            <select
              value={form.timezone}
              onChange={set("timezone")}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
            >
              {TIMEZONES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          {!isComplete && (
            <p className="mt-4 text-sm text-amber-600">
              {missing.length} field{missing.length > 1 ? "s" : ""} still required before you can save.
            </p>
          )}
        </Card>

        <div className="space-y-5">
          <Card>
            <h3 className="mb-3 font-semibold text-ink">Your Photo</h3>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatar} alt="" className="h-14 w-14 rounded-full object-cover" />
              <div>
                <p className="text-sm font-medium text-ink">Edit your photo</p>
                <p className="text-sm">
                  <button onClick={deletePhoto} className="text-muted hover:text-red-500">Delete</button>
                  <span className="text-muted"> </span>
                  <button onClick={pickFile} className="font-medium text-brand-600 hover:text-brand-700">Update</button>
                </p>
              </div>
            </div>

            <div
              onClick={pickFile}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files[0]);
              }}
              className="mt-4 cursor-pointer rounded-xl border-2 border-dashed border-brand-200 p-6 text-center transition hover:border-brand-400 hover:bg-brand-50/40"
            >
              <span className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon name="layers" size={18} />
              </span>
              <p className="text-sm">
                <span className="font-medium text-brand-600">Click to upload</span>
                <span className="text-muted"> or drag and drop</span>
              </p>
              <p className="text-xs text-muted">SVG, PNG, JPG or GIF</p>
              <p className="text-xs text-slate-400">(max, 800×400px)</p>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink">Google</span>
              <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-600">Connected</span>
            </div>
            <p className="mt-2 text-sm text-muted">Use Google to sign in to your account.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Input({ label, required, ...props }: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {label}{required && <span className="text-red-400"> *</span>}
      </span>
      <input
        {...props}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
      />
    </label>
  );
}
