import { serverApi } from "@/lib/server-api";
import CustomersClient from "./CustomersClient";

export default async function CustomersPage() {
  // No .catch() here — a failed fetch should surface through the route's
  // error boundary, not silently render as an empty "No accounts yet." list.
  const users = await serverApi.users.listAll();

  return <CustomersClient initial={users} />;
}
