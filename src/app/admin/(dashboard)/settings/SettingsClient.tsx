"use client";

import { useState } from "react";
import { Save, Loader2, Check, Eye, EyeOff, ShieldCheck, User } from "lucide-react";
import type { AdminProfile } from "@/lib/api";
import { updateProfileAction, changePasswordAction } from "./actions";

// ─── Shared primitives ────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }: {
  title: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-zinc-600 dark:text-zinc-500">{icon}</span>
        <h2 className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
        {label}{required && <span className="text-red-600 dark:text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm px-3.5 py-2.5 rounded-md placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors";
const readonlyCls = "w-full bg-zinc-100/60 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-500 text-sm px-3.5 py-2.5 rounded-md cursor-not-allowed select-all";

// ─── Profile section ──────────────────────────────────────────────────────────

function ProfileSection({ profile, onUpdated }: {
  profile: AdminProfile;
  onUpdated: (p: AdminProfile) => void;
}) {
  const [firstName, setFirstName] = useState(profile.first_name);
  const [lastName,  setLastName]  = useState(profile.last_name);
  const [phone,     setPhone]     = useState(profile.phone);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  async function handleSave() {
    setSaving(true); setError(null); setSaved(false);
    try {
      const updated = await updateProfileAction({ first_name: firstName, last_name: lastName, phone });
      onUpdated(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard title="Profile" icon={<User size={15} />}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name" required>
            <input
              type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name" className={inputCls}
            />
          </Field>
          <Field label="Last Name" required>
            <input
              type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name" className={inputCls}
            />
          </Field>
        </div>

        <Field label="Phone Number">
          <input
            type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="+256 700 000 000" className={inputCls}
          />
        </Field>

        <Field label="Email Address">
          <input type="email" value={profile.email} readOnly className={readonlyCls} />
          <p className="text-[10px] text-zinc-500 dark:text-zinc-600 mt-1">Email cannot be changed here.</p>
        </Field>

        {error && (
          <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold bg-red-500/10 px-3 py-2 rounded-md">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-500 text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest rounded-md hover:bg-blue-600 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-green-600 dark:text-green-400">
              <Check size={12} /> Saved
            </span>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Password input (module-level to keep identity stable across re-renders) ──

function PasswordInput({ id, value, onChange, show, onToggle, placeholder }: {
  id: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; placeholder: string;
}) {
  return (
    <div className="relative">
      <input
        id={id} type={show ? "text" : "password"} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} pr-10`}
      />
      <button
        type="button" onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

// ─── Password section ─────────────────────────────────────────────────────────

function PasswordSection() {
  const [current,  setCurrent]  = useState("");
  const [next,     setNext]     = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [done,     setDone]     = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function handleChange() {
    if (!current || !next || !confirm) { setError("All fields are required."); return; }
    if (next !== confirm) { setError("New passwords do not match."); return; }
    if (next.length < 8)  { setError("Password must be at least 8 characters."); return; }
    setSaving(true); setError(null); setDone(false);
    try {
      await changePasswordAction({ current_password: current, new_password: next, confirm_new_password: confirm });
      setCurrent(""); setNext(""); setConfirm("");
      setDone(true);
      setTimeout(() => setDone(false), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to change password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard title="Security" icon={<ShieldCheck size={15} />}>
      <div className="space-y-4">
        <Field label="Current Password" required>
          <PasswordInput
            id="current" value={current} onChange={setCurrent}
            show={showCur} onToggle={() => setShowCur((v) => !v)}
            placeholder="Enter current password"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="New Password" required>
            <PasswordInput
              id="new" value={next} onChange={setNext}
              show={showNew} onToggle={() => setShowNew((v) => !v)}
              placeholder="Min 8 characters"
            />
          </Field>
          <Field label="Confirm New Password" required>
            <PasswordInput
              id="confirm" value={confirm} onChange={setConfirm}
              show={showNew} onToggle={() => setShowNew((v) => !v)}
              placeholder="Repeat new password"
            />
          </Field>
        </div>

        {/* Strength hint */}
        {next && (
          <div className="flex gap-1">
            {[8, 12, 16].map((len) => (
              <div
                key={len}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  next.length >= len ? "bg-green-500" : "bg-zinc-100 dark:bg-zinc-800"
                }`}
              />
            ))}
            <span className="text-[10px] text-zinc-500 dark:text-zinc-600 ml-2 self-center">
              {next.length < 8 ? "Too short" : next.length < 12 ? "Fair" : next.length < 16 ? "Good" : "Strong"}
            </span>
          </div>
        )}

        {error && (
          <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold bg-red-500/10 px-3 py-2 rounded-md">{error}</p>
        )}
        {done && (
          <p className="text-[11px] text-green-600 dark:text-green-400 font-semibold bg-green-500/10 px-3 py-2 rounded-md flex items-center gap-1.5">
            <Check size={12} /> Password changed successfully.
          </p>
        )}

        <div className="pt-1">
          <button
            onClick={handleChange} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-500 text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest rounded-md hover:bg-blue-600 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
            {saving ? "Changing…" : "Change Password"}
          </button>
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Account info card ────────────────────────────────────────────────────────

function AccountInfo({ profile }: { profile: AdminProfile }) {
  const rows = [
    { label: "Role",     value: profile.role.charAt(0).toUpperCase() + profile.role.slice(1) },
    { label: "Status",   value: profile.is_email_verified ? "Verified" : "Unverified" },
    { label: "Member since", value: new Date(profile.date_joined).toLocaleDateString("en-UG", { day: "numeric", month: "long", year: "numeric" }) },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
      {/* Avatar placeholder */}
      <div className="flex flex-col items-center text-center mb-5 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
          <span className="text-xl font-black text-zinc-600 dark:text-zinc-400">
            {(profile.first_name?.[0] ?? profile.email[0]).toUpperCase()}
          </span>
        </div>
        <p className="text-sm font-bold text-zinc-900 dark:text-white">{profile.full_name || profile.email}</p>
        <p className="text-[11px] text-zinc-600 dark:text-zinc-500 mt-0.5">{profile.email}</p>
        <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
          {profile.role}
        </span>
      </div>

      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.label} className="flex justify-between text-xs">
            <span className="text-zinc-600 dark:text-zinc-500">{r.label}</span>
            <span className={`font-semibold ${
              r.label === "Status"
                ? profile.is_email_verified ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                : "text-zinc-900 dark:text-white"
            }`}>{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SettingsClient({ profile: initial }: { profile: AdminProfile | null }) {
  const [profile, setProfile] = useState<AdminProfile | null>(initial);

  if (!profile) {
    return (
      <main className="flex-1 px-4 sm:px-6 py-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-600">Failed to load profile. Please refresh.</p>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
      <div className="mb-6">
        <p className="text-[11px] font-bold tracking-[0.2em] text-zinc-600 dark:text-zinc-500 uppercase mb-1">Account</p>
        <h1 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Settings</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-4 max-w-4xl">
        {/* Left — editable sections */}
        <div className="space-y-4">
          <ProfileSection profile={profile} onUpdated={setProfile} />
          <PasswordSection />
        </div>

        {/* Right — account info */}
        <AccountInfo profile={profile} />
      </div>
    </main>
  );
}
