import Sidebar from "@/components/admin/Sidebar";
import { ConfirmProvider } from "@/components/admin/ConfirmDialog";
import { ThemeProvider, THEME_STORAGE_KEY, THEME_ROOT_ID } from "@/components/admin/ThemeProvider";

export const metadata = {
  title: "Admin — Nivo",
};

// Runs synchronously during HTML parsing, before hydration, so the correct
// theme is applied on first paint instead of flashing light then dark (or
// vice versa). Mirrors the logic in ThemeProvider's initial-mount effect.
const NO_FLASH_SCRIPT = `
(function () {
  try {
    var pref = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var dark = pref === "dark" || ((!pref || pref === "system") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var el = document.getElementById(${JSON.stringify(THEME_ROOT_ID)});
    if (el) el.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ConfirmProvider>
        <div id={THEME_ROOT_ID} className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
          <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0">
            {children}
          </div>
        </div>
      </ConfirmProvider>
    </ThemeProvider>
  );
}
