import { serverApi } from "@/lib/server-api";
import SalesClient from "./SalesClient";

export default async function SalesPage() {
  const [sales, summary, stockEntries] = await Promise.all([
    serverApi.sales.list({ page_size: 100 }).then((r) => r.results).catch(() => []),
    serverApi.sales.summary({ period: "week" }).catch(() => null),
    serverApi.stock.list().then((r) => r.results).catch(() => []),
  ]);

  return <SalesClient initialSales={sales} initialSummary={summary} stockEntries={stockEntries} />;
}
