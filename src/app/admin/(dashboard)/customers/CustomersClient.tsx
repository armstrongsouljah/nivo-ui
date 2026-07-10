"use client";

import { useState } from "react";
import { Search, ChevronDown, ShieldCheck } from "lucide-react";
import type { UserSummary } from "@/lib/api";

function initials(user: UserSummary): string {
  const first = user.first_name[0] ?? user.email[0] ?? "?";
  const last = user.last_name[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

const AVATAR_COLORS = [
  "bg-violet-500/20 text-violet-700 dark:text-violet-300",
  "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  "bg-rose-500/20 text-rose-700 dark:text-rose-300",
  "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
];

function avatarColor(id: string): string {
  const n = id.charCodeAt(id.length - 1) % AVATAR_COLORS.length;
  return AVATAR_COLORS[n];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function CustomersClient({ initial }: { initial: UserSummary[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = initial.filter((u) => {
    const name = `${u.first_name} ${u.last_name}`.toLowerCase();
    const matchSearch =
      name.includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole =
      roleFilter === "All" || u.role === roleFilter.toLowerCase();
    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && u.is_active) ||
      (statusFilter === "Inactive" && !u.is_active) ||
      (statusFilter === "Unverified" && !u.is_email_verified);
    return matchSearch && matchRole && matchStatus;
  });

  const totalAdmins   = initial.filter((u) => u.role === "admin").length;
  const totalVerified = initial.filter((u) => u.is_email_verified).length;
  const totalInactive = initial.filter((u) => !u.is_active).length;

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Customers</h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">
          {initial.length} account{initial.length !== 1 ? "s" : ""} &mdash; manage users, roles &amp; access
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Accounts", value: initial.length,  color: "text-zinc-900 dark:text-white" },
          { label: "Admins",         value: totalAdmins,     color: "text-violet-600 dark:text-violet-400" },
          { label: "Verified",       value: totalVerified,   color: "text-green-600 dark:text-green-400" },
          { label: "Inactive",       value: totalInactive,   color: "text-zinc-600 dark:text-zinc-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 py-4">
            <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs pl-9 pr-4 py-2.5 rounded-md placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
          />
        </div>

        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 pl-3 pr-8 py-2.5 rounded-md focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 cursor-pointer"
          >
            {["All", "Admin", "Customer"].map((r) => (
              <option key={r} value={r}>{r === "All" ? "All Roles" : r}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-500 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 pl-3 pr-8 py-2.5 rounded-md focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 cursor-pointer"
          >
            {["All", "Active", "Inactive", "Unverified"].map((s) => (
              <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                {["Account", "Email", "Role", "Verified", "Status", "Joined"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-500 dark:text-zinc-600 text-xs">
                    {initial.length === 0 ? "No accounts yet." : "No accounts match your filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((user, i) => {
                  const isLast = i === filtered.length - 1;
                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 transition-colors ${isLast ? "" : "border-b border-zinc-200/70 dark:border-zinc-800/50"}`}
                    >
                      {/* Account */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[11px] font-black ${avatarColor(user.id)}`}>
                            {initials(user)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-zinc-900 dark:text-white leading-none">
                              {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : "—"}
                            </p>
                            {user.phone && (
                              <p className="text-[10px] text-zinc-600 dark:text-zinc-500 mt-0.5">{user.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3.5 text-xs text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        {user.email}
                      </td>

                      {/* Role */}
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          user.role === "admin"
                            ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                            : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Verified */}
                      <td className="px-5 py-3.5">
                        {user.is_email_verified ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-green-400">
                            <ShieldCheck size={12} />
                            Verified
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          user.is_active
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-500"
                        }`}>
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-3.5 text-xs text-zinc-600 dark:text-zinc-500 whitespace-nowrap">
                        {formatDate(user.date_joined)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-[10px] text-zinc-500 dark:text-zinc-600 uppercase tracking-widest font-bold">
            {filtered.length} of {initial.length} accounts
          </p>
        </div>
      </div>
    </main>
  );
}
