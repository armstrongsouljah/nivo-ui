import Loader from "@/components/admin/Loader";

export default function DashboardLoading() {
  return (
    <main className="flex-1 flex flex-col px-4 sm:px-6 py-6">
      <Loader />
    </main>
  );
}
