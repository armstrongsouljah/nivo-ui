import { serverApi } from "@/lib/server-api";
import type { VoucherStatus } from "@/lib/api";
import VouchersClient from "./VouchersClient";

const PAGE_SIZE = 15;
const VALID_STATUSES: VoucherStatus[] = ["active", "used", "cancelled"];

export default async function VouchersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const { page: pageParam, status: statusParam } = await searchParams;
  const parsedPage = Number(pageParam);
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const status = VALID_STATUSES.includes(statusParam as VoucherStatus) ? (statusParam as VoucherStatus) : undefined;

  // No .catch(() => []) — a real API/auth failure should surface through
  // the route's error boundary, not render as a misleading empty table.
  const data = await serverApi.vouchers.list({ page, page_size: PAGE_SIZE, status });

  return (
    <VouchersClient
      initial={data.results}
      count={data.count ?? data.results.length}
      page={page}
      pageSize={PAGE_SIZE}
      status={status}
    />
  );
}
