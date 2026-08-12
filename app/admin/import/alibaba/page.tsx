import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { AlibabaCatalogImporter } from "@/components/alibaba-catalog-importer";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthContext } from "@/lib/supabase/auth";

export default async function AdminAlibabaImportPage() {
  const auth = await getAuthContext();
  if (!auth.user || auth.profile?.role !== "admin") notFound();
  const supabase = createSupabaseAdminClient();
  const { data: suppliers } = await supabase.from("suppliers").select("id, name").order("name");

  return (
    <div>
      <PageHero
        eyebrow="Admin Import"
        title="Import Alibaba Supplier Catalog"
        description="Paste a supplier catalog URL, review normalized products, pricing and fitment, then import selected items as unpublished drafts."
        image="/assets/page-admin-products.svg"
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <AlibabaCatalogImporter suppliers={suppliers ?? []} />
      </div>
    </div>
  );
}
