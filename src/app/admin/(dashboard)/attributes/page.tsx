import { serverApi } from "@/lib/server-api";
import AttributesClient from "./AttributesClient";

export default async function AttributesPage() {
  const attributes = await serverApi.attributes
    .list()
    .then((r) => r.results)
    .catch(() => []);

  return <AttributesClient initial={attributes} />;
}
