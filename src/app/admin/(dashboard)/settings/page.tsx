import { serverApi } from "@/lib/server-api";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const profile = await serverApi.auth.profile().catch(() => null);
  return <SettingsClient profile={profile} />;
}
