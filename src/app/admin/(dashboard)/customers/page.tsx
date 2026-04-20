"use client";

import { useState } from "react";
import { Search, ChevronDown, ShieldCheck, UserX, Mail } from "lucide-react";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: "admin" | "customer";
  is_active: boolean;
  is_email_verified: boolean;
  date_joined: string;
}

const mockUsers: User[] = [
  { id: "u1",  email: "armstrong@nivo.ug",    first_name: "Armstrong",  last_name: "Souljah",   phone: "+256 700 000001", role: "admin",    is_active: true,  is_email_verified: true,  date_joined: "2026-01-01" },
  { id: "u2",  email: "amara@example.com",    first_name: "Amara",      last_name: "Osei",      phone: "+256 700 000002", role: "customer", is_active: true,  is_email_verified: true,  date_joined: "2026-01-10" },
  { id: "u3",  email: "liam@example.com",     first_name: "Liam",       last_name: "Mensah",    phone: null,             role: "customer", is_active: true,  is_email_verified: true,  date_joined: "2026-01-14" },
  { id: "u4",  email: "nana@example.com",     first_name: "Nana",       last_name: "Akoto",     phone: "+256 700 000004", role: "customer", is_active: true,  is_email_verified: true,  date_joined: "2026-01-20" },
  { id: "u5",  email: "kofi@example.com",     first_name: "Kofi",       last_name: "Boateng",   phone: "+256 700 000005", role: "customer", is_active: true,  is_email_verified: false, date_joined: "2026-02-02" },
  { id: "u6",  email: "esi@example.com",      first_name: "Esi",        last_name: "Asante",    phone: null,             role: "customer", is_active: true,  is_email_verified: true,  date_joined: "2026-02-08" },
  { id: "u7",  email: "kwame@example.com",    first_name: "Kwame",      last_name: "Darko",     phone: "+256 700 000007", role: "customer", is_active: false, is_email_verified: true,  date_joined: "2026-02-12" },
  { id: "u8",  email: "abena@example.com",    first_name: "Abena",      last_name: "Frimpong",  phone: "+256 700 000008", role: "customer", is_active: true,  is_email_verified: true,  date_joined: "2026-02-20" },
  { id: "u9",  email: "yaw@example.com",      first_name: "Yaw",        last_name: "Poku",      phone: null,             role: "customer", is_active: true,  is_email_verified: false, date_joined: "2026-03-01" },
  { id: "u10", email: "akosua@example.com",   first_name: "Akosua",     last_name: "Ntim",      phone: "+256 700 000010", role: "customer", is_active: true,  is_email_verified: true,  date_joined: "2026-03-10" },
  { id: "u11", email: "fiifi@example.com",    first_name: "Fiifi",      last_name: "Aidoo",     phone: "+256 700 000011", role: "customer", is_active: true,  is_email_verified: true,  date_joined: "2026-03-18" },
  { id: "u12", email: "adjoa@example.com",    first_name: "Adjoa",      last_name: "Mensah",    phone: null,             role: "customer", is_active: false, is_email_verified: false, date_joined: "2026-04-01" },
];

function initials(user: User): string {
  return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
}

const AVATAR_COLORS = [
  "bg-violet-500/20 text-violet-300",
  "bg-blue-500/20 text-blue-300",
  "bg-emerald-500/20 text-emerald-300",
  "bg-amber-500/20 text-amber-300",
  "bg-rose-500/20 text-rose-300",
  "bg-cyan-500/20 text-cyan-300",
];

function avatarColor(id: string): string {
  const n = id.charCodeAt(id.length - 1) % AVATAR_COLORS.length;
  return AVATAR_COLORS[n];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = mockUsers.filter((u) => {
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

  const totalAdmins    = mockUsers.filter((u) => u.role === "admin").length;
  const totalVerified  = mockUsers.filter((u) => u.is_email_verified).length;
  const totalInactive  = mockUsers.filter((u) => !u.is_active).length;

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-xl font-black text-white uppercase tracking-tight">Customers</h1>
        <p className="text-xs text-zinc-500 mt-1">
          {mockUsers.length} accounts &mdash; manage users, roles &amp; access
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Accounts", value: mockUsers.length,  color: "text-white" },
          { label: "Admins",         value: totalAdmins,       color: "text-violet-400" },
          { label: "Verified",       value: totalVerified,     color: "text-green-400" },
          { label: "Inactive",       value: totalInactive,     color: "text-zinc-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs pl-9 pr-4 py-2.5 rounded-md placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="appearance-none bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 pl-3 pr-8 py-2.5 rounded-md focus:outline-none focus:border-zinc-600 cursor-pointer"
          >
            {["All", "Admin", "Customer"].map((r) => (
              <option key={r} value={r}>{r === "All" ? "All Roles" : r}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 pl-3 pr-8 py-2.5 rounded-md focus:outline-none focus:border-zinc-600 cursor-pointer"
          >
            {["All", "Active", "Inactive", "Unverified"].map((s) => (
              <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {["Account", "Email", "Role", "Verified", "Status", "Joined", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-zinc-600 text-xs">
                    No accounts match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((user, i) => {
                  const isLast = i === filtered.length - 1;
                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-zinc-800/40 transition-colors ${isLast ? "" : "border-b border-zinc-800/50"}`}
                    >
                      {/* Account */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[11px] font-black ${avatarColor(user.id)}`}>
                            {initials(user)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white leading-none">
                              {user.first_name} {user.last_name}
                            </p>
                            {user.phone && (
                              <p className="text-[10px] text-zinc-500 mt-0.5">{user.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3.5 text-xs text-zinc-400 whitespace-nowrap">
                        {user.email}
                      </td>

                      {/* Role */}
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          user.role === "admin"
                            ? "bg-violet-500/10 text-violet-400"
                            : "bg-zinc-500/10 text-zinc-400"
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Verified */}
                      <td className="px-5 py-3.5">
                        {user.is_email_verified ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-green-400">
                            <ShieldCheck size={12} />
                            Verified
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          user.is_active
                            ? "bg-green-500/10 text-green-400"
                            : "bg-zinc-500/10 text-zinc-500"
                        }`}>
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-3.5 text-xs text-zinc-500 whitespace-nowrap">
                        {formatDate(user.date_joined)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            title="Email user"
                            className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors"
                          >
                            <Mail size={13} />
                          </button>
                          <button
                            title={user.is_active ? "Deactivate account" : "Activate account"}
                            className={`p-1.5 rounded-md transition-colors ${
                              user.is_active
                                ? "text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                                : "text-zinc-500 hover:text-green-400 hover:bg-green-500/10"
                            }`}
                          >
                            <UserX size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-zinc-800">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
            {filtered.length} of {mockUsers.length} accounts
          </p>
        </div>
      </div>
    </main>
  );
}
