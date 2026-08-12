import { AdminLockedState, AdminOverview } from "@/components/admin-dashboard";
import { PageHero } from "@/components/page-hero";
import { getAdminOverviewData } from "@/lib/admin-server";
import { getAuthContext } from "@/lib/supabase/auth";

export default async function AdminPage() {
  const auth = await getAuthContext();
  const overviewData =
    auth.user && auth.profile?.role === "admin"
      ? await getAdminOverviewData()
      : null;
  return <div><PageHero eyebrow="Admin" title="Store Operations" description="Revenue, orders, profitability, supplier workflow, low-margin products and top platforms are organized around a Supabase-backed admin surface." image="/assets/page-admin.svg" /><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">{auth.user && auth.profile?.role === 'admin' && overviewData ? <AdminOverview data={overviewData} /> : <AdminLockedState />}</div></div>;
}
