import { serverApi } from "@/lib/server-api";
import StockClient from "./StockClient";

export default async function StockPage() {
  const entries = await serverApi.stock
    .list()
    .then((r) => r.results)
    .catch(() => []);

  return <StockClient initial={entries} />;
}
