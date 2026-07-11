import { serverApi } from "@/lib/server-api";
import InvoicesClient from "./InvoicesClient";

const PAGE_SIZE = 15;

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  // No .catch(() => []) — a real API/auth failure should surface through
  // the route's error boundary, not render as a misleading empty table.
  const data = await serverApi.invoices.list({ page, page_size: PAGE_SIZE });

  return (
    <InvoicesClient
      initial={data.results}
      count={data.count ?? data.results.length}
      page={page}
      pageSize={PAGE_SIZE}
    />
  );
}
