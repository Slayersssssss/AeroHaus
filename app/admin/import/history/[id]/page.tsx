import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthContext } from "@/lib/supabase/auth";

export default async function ImportHistoryDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const auth = await getAuthContext();
  if (!auth.user || auth.profile?.role !== "admin") notFound();
  const { id } = await props.params;
  const supabase = createSupabaseAdminClient();
  const { data: importRun } = await supabase
    .from("catalog_imports")
    .select("id, filename, created_at, row_count, suppliers(name)")
    .eq("id", id)
    .maybeSingle();
  if (!importRun) notFound();
  const supplierName =
    Array.isArray(importRun.suppliers) && importRun.suppliers.length > 0
      ? importRun.suppliers[0].name
      : "Supplier";
  const { data: rows } = await supabase
    .from("catalog_import_rows")
    .select("*")
    .eq("import_id", id)
    .order("created_at", { ascending: true });

  return (
    <div>
      <PageHero
        eyebrow="Import Detail"
        title={importRun.filename}
        description={`${supplierName} · ${importRun.row_count} rows`}
        image="/assets/page-admin-products.svg"
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="overflow-x-auto border border-white/10 bg-zinc-950/80">
          <table className="min-w-full text-left text-sm text-zinc-300">
            <thead className="border-b border-white/10 text-xs uppercase tracking-[0.22em] text-zinc-500">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Suggested Product Name</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Supplier SKU</th>
                <th className="px-4 py-3">Landed Cost</th>
                <th className="px-4 py-3">Recommended Retail</th>
                <th className="px-4 py-3">Issues</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((row) => (
                <tr key={row.id} className="border-b border-white/10 align-top">
                  <td className="px-4 py-3">{row.status}</td>
                  <td className="px-4 py-3">{row.normalized_title}</td>
                  <td className="px-4 py-3">
                    {row.vehicle_make} {row.vehicle_model} {row.vehicle_chassis}{" "}
                    {row.start_year && row.end_year ? `(${row.start_year}-${row.end_year})` : ""}
                  </td>
                  <td className="px-4 py-3">{row.supplier_sku}</td>
                  <td className="px-4 py-3">{row.landed_cost}</td>
                  <td className="px-4 py-3">{row.recommended_retail_price}</td>
                  <td className="px-4 py-3">{(row.issues ?? []).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
