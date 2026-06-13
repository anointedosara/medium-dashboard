"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { avatarFor } from "@/lib/assets";
import { useResource } from "@/components/dashboard/useResource";

function ageFromDob(dob: string): number | string {
  const m = dob.match(/(\d{1,2})\D(\d{1,2})\D(\d{4})/);
  if (!m) return "—";
  return Math.max(0, 2026 - Number(m[3]));
}

const STEPS = ["About", "Account", "Address"];
const INTERESTS = ["Design", "Develop", "Code", "Design", "Develop", "Code", "Design", "Develop", "Code"];

export default function WizardPage() {
  const { create } = useResource("people");
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string>("");

  const [about, setAbout] = useState({ firstName: "", lastName: "", email: "", dob: "", city: "", postal: "" });
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [address, setAddress] = useState({ street: "", streetNo: "", city: "", country: "Germany" });

  const setA = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setAbout({ ...about, [k]: e.target.value });
  const setAddr = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setAddress({ ...address, [k]: e.target.value });

  const valid = [
    Object.values(about).every((v) => v.trim()),
    selected.size > 0,
    Boolean(address.street && address.streetNo && address.city && address.country),
  ][step];

  function handlePhoto(f: File | undefined) {
    if (!f || !f.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(f);
  }

  async function next() {
    if (!valid) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    // Final step: create a person record that appears in Data tables.
    setSaving(true);
    const labels = Array.from(selected).map((i) => INTERESTS[i]);
    const position = labels[0] ? `${labels[0]}er` : "Member";
    await create({
      name: `${about.firstName} ${about.lastName}`.trim(),
      position,
      age: ageFromDob(about.dob),
      office: [address.city, address.country].filter(Boolean).join(", "),
      salary: 80000 + Math.floor(Math.random() * 370000),
      start: "13/6/2026",
      avatar: photo,
      email: about.email,
    });
    setSaving(false);
    setDone(true);
  }

  return (
    <div className="space-y-8">
      {/* Stepper */}
      <div className="flex items-center justify-center">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="flex items-center gap-2">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${i <= step ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-400"}`}>
                {i < step ? "✓" : i + 1}
              </span>
              <span className={`text-sm font-medium ${i === step ? "text-ink" : i < step ? "text-brand-600" : "text-brand-300"}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className="mx-3 h-px w-16 bg-slate-200 sm:w-28" />}
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-3xl">
        <Card>
          {done ? (
            <div className="py-12 text-center">
              <p className="text-3xl">🎉</p>
              <h3 className="mt-3 text-lg font-bold text-ink">All set, {about.firstName || "there"}!</h3>
              <p className="text-sm text-muted">Your information has been submitted successfully.</p>
              <button onClick={() => { setDone(false); setStep(0); }} className="mt-5 rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">Start over</button>
            </div>
          ) : (
            <>
              {step === 0 && (
                <>
                  <h3 className="text-center text-lg font-semibold text-ink">Let&apos;s start with the basic information</h3>
                  <p className="mx-auto mt-1 max-w-md text-center text-sm text-muted">Let us know your name and email address. Use an address you don&apos;t mind other users contact you at</p>

                  <div className="mt-6 flex items-center gap-4">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo || avatarFor(about.email || "wizard")} alt="" className="h-16 w-16 rounded-full object-cover" />
                      <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white" aria-label="Edit photo">
                        <Icon name="settings" size={12} />
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto(e.target.files?.[0])} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">Profile photo</p>
                      <p className="text-sm text-muted">This will be displayed on your profile.</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <Input label="First name" placeholder="Kame" value={about.firstName} onChange={setA("firstName")} />
                    <Input label="Last name" placeholder="Williamson" value={about.lastName} onChange={setA("lastName")} />
                    <Input label="Email Address" placeholder="kamewilliamson@gmail.com" value={about.email} onChange={setA("email")} />
                    <Input label="Date of Birth" placeholder="25/01/2001" value={about.dob} onChange={setA("dob")} />
                    <Input label="City" placeholder="Berlin, Germany" value={about.city} onChange={setA("city")} />
                    <Input label="Postal code" placeholder="87532" value={about.postal} onChange={setA("postal")} />
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <h3 className="text-center text-lg font-semibold text-ink">What are you doing? (checkboxes)</h3>
                  <p className="mx-auto mt-1 max-w-md text-center text-sm text-muted">Give us more detail about you. What do you enjoy doing in your spare time?</p>
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {INTERESTS.map((label, i) => {
                      const on = selected.has(i);
                      return (
                        <button
                          key={i}
                          onClick={() => setSelected((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                          className={`flex flex-col items-center gap-2 rounded-xl border py-6 transition ${on ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-brand-300"}`}
                        >
                          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${on ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-500"}`}>
                            <Icon name="users" size={16} />
                          </span>
                          <span className="text-sm font-medium text-ink">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h3 className="text-center text-lg font-semibold text-ink">Are you living in nice area?</h3>
                  <p className="mx-auto mt-1 max-w-md text-center text-sm text-muted">One thing I love about the later sunsets is the chance to go for a walk through the neighborhood woods before dinner</p>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <Input label="Street name" placeholder="Soft" value={address.street} onChange={setAddr("street")} />
                    <Input label="Street no" placeholder="197" value={address.streetNo} onChange={setAddr("streetNo")} />
                    <Input label="City" placeholder="Berlin" value={address.city} onChange={setAddr("city")} />
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-ink">Country</span>
                      <select value={address.country} onChange={setAddr("country")} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:bg-white">
                        {["Germany", "United States", "United Kingdom", "France", "Spain", "Nigeria"].map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </label>
                  </div>
                </>
              )}

              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(Math.max(0, step - 1))} className={`rounded-lg border border-slate-200 px-5 py-2 text-sm hover:bg-slate-50 ${step === 0 ? "invisible" : ""}`}>Back</button>
                <button onClick={next} disabled={!valid || saving} className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
                  {step < STEPS.length - 1 ? "Next" : saving ? "Saving…" : "Send"}
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input {...props} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100" />
    </label>
  );
}
