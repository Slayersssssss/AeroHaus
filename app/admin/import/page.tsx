import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { SupplierImporter } from "@/components/supplier-importer";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthContext } from "@/lib/supabase/auth";

export default async function AdminImportPage() {
  const auth = await getAuthContext();
  if (!auth.user || auth.profile?.role !== "admin") notFound();
  const supabase = createSupabaseAdminClient();

  const [{ data: suppliers }, { data: templates }, { data: pricingSettings }] = await Promise.all([
    supabase.from("suppliers").select("id, name").order("name"),
    supabase.from("supplier_mapping_templates").select("id, name, supplier_id, mapping").order("created_at", { ascending: false }),
    supabase.from("pricing_settings").select("rules, minimum_gross_margin, rounding_mode").order("created_at", { ascending: true }).limit(1).maybeSingle(),
  ]);

  return (
    <div>
      <PageHero
        eyebrow="Admin Import"
        title="Supplier Catalog Importer"
        description="Upload CSV or Excel supplier catalogs, map fields, normalize titles and fitment, review pricing, and import AeroHaus draft products without exposing confidential supplier data."
        image="/assets/page-admin-products.svg"
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Alibaba URL Import</p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.12em] text-white">
            Supplier Catalog Import
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Paste an Alibaba supplier catalog URL to fetch, normalize, review, and import selected products as drafts.
          </p>
          <Link
            href="/admin/import/alibaba"
            className="mt-5 inline-flex items-center border border-lime-300 bg-lime-300 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-black hover:bg-lime-200"
          >
            Open Alibaba Importer
          </Link>
        </div>
        <SupplierImporter
          suppliers={suppliers ?? []}
          templates={(templates ?? []).map((template) => ({
            ...template,
            mapping: template.mapping as Record<string, string>,
          }))}
          pricingSettings={pricingSettings}
        />
      </div>
    </div>
  );
}
