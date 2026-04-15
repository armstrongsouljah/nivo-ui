"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  Tag,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",  href: "/admin",          icon: LayoutDashboard },
  { label: "Orders",     href: "/admin/orders",   icon: ShoppingBag },
  { label: "Products",   href: "/admin/products", icon: Package },
  { label: "Customers",  href: "/admin/customers",icon: Users },
  { label: "Promotions", href: "/admin/promos",   icon: Tag },
  { label: "Analytics",  href: "/admin/analytics",icon: BarChart2 },
  { label: "Settings",   href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black border-b border-zinc-800 flex items-center justify-between px-4 h-14">
        <span className="text-white font-black text-lg tracking-widest uppercase">Nivo Admin</span>
        <button onClick={() => setOpen(!open)} className="text-zinc-400 hover:text-white">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-60 bg-black border-r border-zinc-800
          flex flex-col transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:flex
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-800 shrink-0">
          <Link href="/" className="text-white font-black text-xl tracking-widest uppercase">
            Nivo
          </Link>
          <span className="ml-2 text-[9px] font-bold tracking-widest text-zinc-500 uppercase mt-1">
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-0.5">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? "bg-white text-black"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-3 pb-5 border-t border-zinc-800 pt-4 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <LogOut size={16} />
            Back to Store
          </Link>
        </div>
      </aside>
    </>
  );
}
