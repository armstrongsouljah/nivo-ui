"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "admin-theme";
export const THEME_ROOT_ID = "admin-theme-root";

interface ThemeContextValue {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolve(preference: ThemePreference): ResolvedTheme {
  return preference === "system" ? getSystemTheme() : preference;
}

function readInitialPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null) ?? "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Starts as "system" on both the server and the first client render so
  // <ThemeToggle> (which reads this to highlight the active segment) never
  // hydration-mismatches; a mount effect corrects it right after, same as
  // any other client-only value (e.g. localStorage) normally would.
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  // Unlike `preference`, this is never rendered into JSX directly — only fed
  // to an imperative classList side effect — so it's safe, and necessary, to
  // compute it correctly from the very first client render. Deferring this to
  // a mount effect (as `preference` does) would apply the wrong `.dark` class
  // for one paint before self-correcting, which is the exact flash this
  // feature exists to prevent.
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    typeof window === "undefined" ? "light" : resolve(readInitialPreference())
  );

  useEffect(() => {
    // Synchronizes React state with localStorage (an external system) so
    // <ThemeToggle> highlights the right segment post-mount — the standard,
    // hydration-safe way to read a client-only value. Unlike `resolvedTheme`
    // above, correcting this one render late is harmless: it only affects
    // which segment looks selected, never the applied `.dark` class.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreferenceState(readInitialPreference());
  }, []);

  // Live-follow the OS theme while preference is "system".
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange() {
      setPreferenceState((current) => {
        if (current === "system") setResolvedTheme(getSystemTheme());
        return current;
      });
    }
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.getElementById(THEME_ROOT_ID)?.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);

  const setPreference = useCallback((pref: ThemePreference) => {
    localStorage.setItem(THEME_STORAGE_KEY, pref);
    setPreferenceState(pref);
    setResolvedTheme(resolve(pref));
  }, []);

  return (
    <ThemeContext.Provider value={{ preference, resolvedTheme, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAdminTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAdminTheme must be used inside <ThemeProvider>");
  return ctx;
}
