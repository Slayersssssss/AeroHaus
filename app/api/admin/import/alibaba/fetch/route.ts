import { NextResponse } from "next/server";
import { getAlibabaCatalogProvider, getAlibabaImportProviderName } from "@/lib/alibaba-import/provider";
import { applyDuplicateState, catalogProductToPreviewRow, getPricingSettingsOrDefault } from "@/lib/alibaba-import/normalize";
import type { CatalogFetchEvent } from "@/lib/alibaba-import/types";
import { validateAlibabaUrl } from "@/lib/alibaba-import/url";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthContext } from "@/lib/supabase/auth";

export const runtime = "nodejs";

const PROVIDER_ERROR =
  "Unable to retrieve this supplier catalog using the configured provider.";

function sendEvent(controller: ReadableStreamDefaultController<Uint8Array>, event: CatalogFetchEvent) {
  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`));
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth.user || auth.profile?.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const supplierId = typeof body.supplierId === "string" ? body.supplierId : "";
  let catalogUrl = "";
  try {
    catalogUrl = validateAlibabaUrl(typeof body.url === "string" ? body.url : "");
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Please enter a valid Alibaba supplier or catalog URL." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const providerName = getAlibabaImportProviderName();
  const { data: importRun, error: importError } = await supabase
    .from("catalog_imports")
    .insert({
      supplier_id: supplierId || null,
      filename: catalogUrl,
      file_type: "alibaba-url",
      row_count: 0,
      imported_by: auth.user.id,
      provider: providerName,
      source_url: catalogUrl,
      fetch_started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (importError || !importRun) {
    return NextResponse.json({ error: PROVIDER_ERROR }, { status: 500 });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        sendEvent(controller, { type: "status", message: "Fetching products..." });

        const [{ data: pricingSettings }, { data: existingSupplierProducts }, { data: existingProducts }] =
          await Promise.all([
            supabase
              .from("pricing_settings")
              .select("rules, minimum_gross_margin, rounding_mode")
              .order("created_at", { ascending: true })
              .limit(1)
              .maybeSingle(),
            supabase
              .from("supplier_products")
              .select(
                "id, supplier_id, supplier_sku, supplier_product_url, supplier_product_id, product_id, supplier_cost, supplier_current_price"
              ),
            supabase.from("products").select("id, title"),
          ]);

        const settings = getPricingSettingsOrDefault(pricingSettings);
        const provider = getAlibabaCatalogProvider();
        const result = await provider.fetchCatalog(catalogUrl, {
          onProgress: async (progress) => {
            sendEvent(controller, {
              type: "page",
              page: progress.page,
              productsOnPage: progress.productsOnPage,
              productsFound: progress.productsFound,
              message: progress.message,
            });
          },
        });

        const rows = result.products.map((product, index) => {
          const preview = catalogProductToPreviewRow(product, index, settings);
          return applyDuplicateState(
            preview,
            existingSupplierProducts ?? [],
            existingProducts ?? [],
            supplierId || undefined
          );
        });

        if (rows.length) {
          await supabase.from("catalog_import_rows").insert(
            rows.map((row, index) => ({
              import_id: importRun.id,
              supplier_product_id: row.supplierProductId || null,
              supplier_product_name: row.supplierProductName,
              supplier_sku: row.supplierSku,
              supplier_price: row.supplierPrice,
              supplier_shipping_cost: row.supplierShippingCost,
              supplier_product_url: row.supplierProductUrl,
              supplier_image_url: row.supplierImageUrl,
              additional_image_urls: row.additionalImageUrls || [],
              vehicle_make: row.vehicleMake,
              vehicle_model: row.vehicleModel,
              vehicle_chassis: row.vehicleChassis,
              start_year: row.startYear,
              end_year: row.endYear,
              trim: row.trim,
              category: row.category,
              material: row.material,
              finish: row.finish,
              description: row.description,
              moq: row.moq,
              supplier_processing_time: row.supplierProcessingTime,
              supplier_notes: row.supplierNotes,
              landed_cost: row.landedCost,
              recommended_retail_price: row.recommendedRetailPrice,
              gross_profit: row.grossProfit,
              gross_margin_percent: row.grossMarginPercent,
              markup_percent: row.markupPercent,
              normalized_title: row.normalizedTitle,
              status: row.status,
              issues: row.issues,
              duplicate_strategy: row.duplicateStrategy,
              existing_product_id: row.existingProductId || null,
              existing_supplier_product_id: row.existingSupplierProductId || null,
              supplier_variant_id: row.variants?.[0]?.supplierVariantId || null,
              fitment_review_required: row.fitmentReviewRequired,
              image_review_required: row.imageReviewRequired,
              imported: false,
              raw_provider_response: result.products[index]?.rawProviderResponse ?? null,
            }))
          );
        }

        const { data: storedRows } = await supabase
          .from("catalog_import_rows")
          .select("id, supplier_product_id, supplier_sku, supplier_product_url")
          .eq("import_id", importRun.id)
          .order("created_at", { ascending: true });

        const rowsWithIds = rows.map((row) => {
          const stored = storedRows?.find(
            (item) =>
              (row.supplierProductId && item.supplier_product_id === row.supplierProductId) ||
              (row.supplierSku && item.supplier_sku === row.supplierSku) ||
              (row.supplierProductUrl && item.supplier_product_url === row.supplierProductUrl)
          );
          return { ...row, catalogImportRowId: stored?.id };
        });

        await supabase
          .from("catalog_imports")
          .update({
            fetch_completed_at: new Date().toISOString(),
            pages_fetched: result.pagesFetched,
            products_found: result.products.length,
            failed_products: result.failedProducts,
            row_count: result.products.length,
            error_message: null,
          })
          .eq("id", importRun.id);

        sendEvent(controller, {
          type: "complete",
          importId: importRun.id,
          pagesFetched: result.pagesFetched,
          productsFound: result.products.length,
          failedProducts: result.failedProducts,
          rows: rowsWithIds,
        });
      } catch {
        await supabase
          .from("catalog_imports")
          .update({
            fetch_completed_at: new Date().toISOString(),
            error_message: PROVIDER_ERROR,
          })
          .eq("id", importRun.id);
        sendEvent(controller, { type: "error", message: PROVIDER_ERROR });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
