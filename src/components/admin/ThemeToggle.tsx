"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useAdminTheme, type ThemePreference } from "./ThemeProvider";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function ThemeToggle() {
  const { preference, setPreference } = useAdminTheme();

  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            title={label}
            onClick={() => setPreference(value)}
            className={`flex-1 flex items-center justify-center p-1.5 rounded transition-colors ${
              active
                ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white"
            }`}
          >
            <Icon size={13} />
          </button>
        );
      })}
    </div>
  );
}
