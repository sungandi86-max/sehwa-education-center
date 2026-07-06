import { AdminMenuClient } from "@/components/admin-menu-client";
import { appsScriptClient } from "@/lib/api/appsScriptClient";

export default async function AdminPage() {
  const trainings = await appsScriptClient.getTrainings().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl">
      <AdminMenuClient trainings={trainings} />
    </div>
  );
}
