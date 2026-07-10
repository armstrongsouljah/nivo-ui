import Sidebar from "@/components/admin/Sidebar";
import { ConfirmProvider } from "@/components/admin/ConfirmDialog";
import { ThemeProvider, THEME_ROOT_ID } from "@/components/admin/ThemeProvider";

export const metadata = {
  title: "Admin — Nivo",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ConfirmProvider>
        <div id={THEME_ROOT_ID} className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0">
            {children}
          </div>
        </div>
      </ConfirmProvider>
    </ThemeProvider>
  );
}
