import { serverApi } from "@/lib/server-api";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: periodParam } = await searchParams;
  const period = [7, 30, 90].includes(Number(periodParam)) ? Number(periodParam) : 30;

  const data = await serverApi.orders.analytics(period).catch(() => null);

  return <AnalyticsClient data={data} period={period} />;
}
