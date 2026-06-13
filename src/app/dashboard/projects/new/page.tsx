"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useResource } from "@/components/dashboard/useResource";

export default function NewProjectPage() {
  const router = useRouter();
  const { create } = useResource("projects");
  const [form, setForm] = useState({ name: "", title: "", tag: "Choice 1", start: "", due: "", desc: "" });
  const [file, setFile] = useState<{ name: string; url: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const complete = Boolean(form.name && form.title && form.start && form.due);

  function handleFile(f: File | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setFile({ name: f.name, url: String(reader.result) });
    reader.readAsDataURL(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!complete) return;
    setSaving(true);
    await create({ ...form, participants: 1, image: file?.url ?? "" });
    setSaving(false);
    router.push("/dashboard/profile/projects");
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <h2 className="text-lg font-bold text-ink">New project</h2>
        <p className="text-sm text-muted">Create new project</p>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Project Name" value={form.name} onChange={set("name")} required />
            <Input label="Project Title" value={form.title} onChange={set("title")} required />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Project Tags</span>
              <select value={form.tag} onChange={set("tag")} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-brand-600 outline-none focus:border-brand-400 focus:bg-white">
                <option>Choice 1</option><option>Design</option><option>Development</option><option>Marketing</option><option>Support</option>
              </select>
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <DateField label="Start Date" placeholder="Please select start date" value={form.start} onChange={set("start")} />
            <DateField label="End Date" placeholder="Please select end date" value={form.due} onChange={set("due")} />
          </div>

          {/* Starting File */}
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-ink">Starting File</p>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
              className="mt-3 cursor-pointer rounded-lg border-2 border-dashed border-brand-300 p-8 text-center transition hover:bg-brand-50/40"
            >
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={file.url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  <p className="text-sm font-medium text-ink">{file.name}</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <span className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon name="layers" size={18} />
                  </span>
                  <p className="text-sm">
                    <span className="font-medium text-brand-600">Click to upload</span>
                    <span className="text-muted"> or drag and drop</span>
                  </p>
                  <p className="text-xs text-muted">SVG, PNG, JPG or GIF</p>
                  <p className="text-xs text-slate-400">(max, 800×400px)</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => router.back()} className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving || !complete} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
              {saving ? "Creating…" : "Create project"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Input({ label, required, ...props }: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}{required && <span className="text-red-400"> *</span>}</span>
      <input {...props} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100" />
    </label>
  );
}

// Shows a text placeholder until focused, then becomes a native date picker.
function DateField({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label} <span className="text-red-400">*</span></span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={(e) => (e.target.type = "date")}
        onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}
