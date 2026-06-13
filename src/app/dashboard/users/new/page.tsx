"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";
import { useResource } from "@/components/dashboard/useResource";

const STEPS = ["User Info", "Address", "Socials", "Profile"];
const SOCIAL_KEYS = ["facebook", "instagram", "linkedin", "twitter"] as const;

export default function NewUserPage() {
  const router = useRouter();
  const { create } = useResource("team");
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({ firstName: "", lastName: "", company: "", email: "", password: "", repeat: "", role: "Member" });
  const [address, setAddress] = useState({ street: "", streetNo: "", city: "", country: "" });
  const [socials, setSocials] = useState({ facebook: "", instagram: "", linkedin: "", twitter: "" });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });
  const setAddr = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setAddress({ ...address, [k]: e.target.value });
  const setSoc = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setSocials({ ...socials, [k]: e.target.value });

  const passwordsMatch = form.password === form.repeat;
  const stepValid = [
    Boolean(form.firstName && form.lastName && form.company && form.email && form.password && form.repeat) && passwordsMatch,
    Boolean(address.street && address.streetNo && address.city && address.country),
    SOCIAL_KEYS.every((k) => socials[k].trim()),
    Boolean(form.role),
  ][step];

  async function next() {
    if (!stepValid) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      await create({
        name: `${form.firstName} ${form.lastName}`.trim() || form.email,
        email: form.email, role: form.role, company: form.company,
        ...address, ...socials,
      });
      router.push("/dashboard/profile/teams");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Card>
        <div className="relative flex justify-between">
          <div className="absolute h-px bg-slate-200" style={{ top: 14, left: 14, right: 14 }} />
          {STEPS.map((s, i) => (
            <div key={s} className="relative z-10 flex flex-col items-center bg-white px-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${i <= step ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-300"}`}>
                {i < step ? "✓" : ""}
              </div>
              <span className={`mt-2 text-sm ${i <= step ? "font-medium text-ink" : "text-muted"}`}>{s}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-ink">{step === 0 ? "About me" : STEPS[step]}</h3>
        <p className="text-sm text-muted">{step === 0 ? "Mandatory information" : "Fill in the details below"}</p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {step === 0 && (
            <>
              <Input label="First name" placeholder="eg. Malik" value={form.firstName} onChange={set("firstName")} />
              <Input label="Last Name" placeholder="eg. Ali" value={form.lastName} onChange={set("lastName")} />
              <Input label="Company" placeholder="eg. TeamUXD" value={form.company} onChange={set("company")} />
              <Input label="Email Address" placeholder="eg. Team@gmail.com" value={form.email} onChange={set("email")} />
              <Input label="Password" type="password" placeholder="ma56kl90" value={form.password} onChange={set("password")} />
              <Input label="Repeat password" type="password" placeholder="ma56kl90" value={form.repeat} onChange={set("repeat")} />
            </>
          )}
          {step === 1 && (
            <>
              <Input label="Street name" placeholder="Soft" value={address.street} onChange={setAddr("street")} />
              <Input label="Street no" placeholder="197" value={address.streetNo} onChange={setAddr("streetNo")} />
              <Input label="City" placeholder="Berlin" value={address.city} onChange={setAddr("city")} />
              <Input label="Country" placeholder="Germany" value={address.country} onChange={setAddr("country")} />
            </>
          )}
          {step === 2 && (
            <>
              <Input label="Facebook" placeholder="@username" value={socials.facebook} onChange={setSoc("facebook")} />
              <Input label="Instagram" placeholder="@username" value={socials.instagram} onChange={setSoc("instagram")} />
              <Input label="LinkedIn" placeholder="@username" value={socials.linkedin} onChange={setSoc("linkedin")} />
              <Input label="Twitter" placeholder="@username" value={socials.twitter} onChange={setSoc("twitter")} />
            </>
          )}
          {step === 3 && (
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-ink">Role</span>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm">
                <option>Member</option><option>Admin</option><option>Editor</option>
              </select>
            </label>
          )}
        </div>

        {step === 0 && form.repeat && !passwordsMatch && <p className="mt-3 text-sm text-red-500">Passwords do not match.</p>}
        {!stepValid && step !== 0 && <p className="mt-3 text-sm text-amber-600">Please fill in all fields to continue.</p>}

        <div className="mt-8 flex justify-between">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="rounded-lg border border-slate-200 px-5 py-2 text-sm disabled:opacity-0">Back</button>
          <button onClick={next} disabled={!stepValid} className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
            {step < STEPS.length - 1 ? "Next" : "Create user"}
          </button>
        </div>
      </Card>
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
