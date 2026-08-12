import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthContext } from "@/lib/supabase/auth";

export default async function ImportHistoryPage() {
  const auth = await getAuthContext();
  if (!auth.user || auth.profile?.role !== "admin") notFound();
  const supabase = createSupabaseAdminClient();
  const { data: imports } = await supabase
    .from("catalog_imports")
    .select("id, filename, row_count, products_created, products_updated, products_skipped, products_requiring_review, created_at, provider, source_url, pages_fetched, products_found, failed_products, error_message, suppliers(name)")
    .order("created_at", { ascending: false });

  const supplierName = (value: unknown) =>
    Array.isArray(value) ? value[0]?.name ?? "Unknown Supplier" : "Unknown Supplier";

  return (
    <div>
      <PageHero
        eyebrow="Admin Imports"
        title="Import History"
        description="Review uploaded catalogs, created products, skipped rows, and any rows that still require manual review."
        image="/assets/page-admin.svg"
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="overflow-x-auto border border-white/10 bg-zinc-950/80">
          <table className="min-w-full text-left text-sm text-zinc-300">
            <thead className="border-b border-white/10 text-xs uppercase tracking-[0.22em] text-zinc-500">
              <tr>
                <th className="px-4 py-3">Import Date</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Rows</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Skipped</th>
                <th className="px-4 py-3">Review</th>
              </tr>
            </thead>
            <tbody>
              {(imports ?? []).map((item) => (
                <tr key={item.id} className="border-b border-white/10">
                  <td className="px-4 py-3">{new Date(item.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">{supplierName(item.suppliers)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/import/history/${item.id}`} className="text-lime-300 hover:text-lime-200">
                      {item.source_url || item.filename}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{item.provider || "csv"}</td>
                  <td className="px-4 py-3">{item.row_count}</td>
                  <td className="px-4 py-3">{item.products_created}</td>
                  <td className="px-4 py-3">{item.products_updated}</td>
                  <td className="px-4 py-3">{item.products_skipped}</td>
                  <td className="px-4 py-3">{item.products_requiring_review}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
