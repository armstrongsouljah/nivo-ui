import { serverApi } from "@/lib/server-api";
import CustomersClient from "./CustomersClient";

export default async function CustomersPage() {
  const users = await serverApi.users
    .list({ page_size: 100 })
    .then((r) => r.results)
    .catch(() => []);

  return <CustomersClient initial={users} />;
}
