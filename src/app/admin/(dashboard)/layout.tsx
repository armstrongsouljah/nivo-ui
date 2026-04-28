import Sidebar from "@/components/admin/Sidebar";
import { ConfirmProvider } from "@/components/admin/ConfirmDialog";

export const metadata = {
  title: "Admin — Nivo",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConfirmProvider>
      <div className="min-h-screen bg-zinc-950 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0">
          {children}
        </div>
      </div>
    </ConfirmProvider>
  );
}
