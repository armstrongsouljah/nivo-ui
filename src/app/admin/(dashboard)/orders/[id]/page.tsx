import { notFound } from "next/navigation";
import { serverApi } from "@/lib/server-api";
import OrderDetailClient from "./OrderDetailClient";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await serverApi.orders.get(id).catch(() => null);
  if (!order) notFound();

  return <OrderDetailClient order={order} />;
}
