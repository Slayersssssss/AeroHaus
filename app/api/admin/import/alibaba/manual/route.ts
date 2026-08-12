import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { applyDuplicateState, catalogProductToPreviewRow, getPricingSettingsOrDefault } from "@/lib/alibaba-import/normalize";
import { getAlibabaImportProviderName } from "@/lib/alibaba-import/provider";
import { parseManualCatalogPayload } from "@/lib/alibaba-import/providers/manual";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthContext } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth.user || auth.profile?.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  const supabase = createSupabaseAdminClient();
  let supplierId = "";
  let sourceLabel = "manual-catalog";
  let products = parseManualCatalogPayload([]);

  try {
    if (contentType.includes("application/json")) {
      const body = await request.json();
      supplierId = typeof body.supplierId === "string" ? body.supplierId : "";
      sourceLabel = typeof body.filename === "string" ? body.filename : "pasted-json";
      products = parseManualCatalogPayload(body.products ?? body.rows ?? body);
    } else {
      const form = await request.formData();
      supplierId = String(form.get("supplierId") ?? "");
      const file = form.get("file");
      if (file instanceof File) {
        sourceLabel = file.name || "uploaded-catalog";
        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const firstSheet = workbook.SheetNames[0];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[firstSheet], {
          defval: "",
        });
        products = parseManualCatalogPayload(json);
      }
    }
  } catch {
    return NextResponse.json(
      { error: "Unable to parse the uploaded catalog. Use CSV, Excel, or JSON." },
      { status: 400 }
    );
  }

  if (!products.length) {
    return NextResponse.json(
      { error: "No products were found in the uploaded catalog." },
      { status: 400 }
    );
  }

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
  const rows = products.map((product, index) =>
    applyDuplicateState(
      catalogProductToPreviewRow(product, index, settings),
      existingSupplierProducts ?? [],
      existingProducts ?? [],
      supplierId || undefined
    )
  );

  const { data: importRun, error: importError } = await supabase
    .from("catalog_imports")
    .insert({
      supplier_id: supplierId || null,
      filename: sourceLabel,
      file_type: sourceLabel.split(".").pop()?.toLowerCase() || "manual",
      row_count: rows.length,
      imported_by: auth.user.id,
      provider: `${getAlibabaImportProviderName()}-manual`,
      source_url: null,
      fetch_started_at: new Date().toISOString(),
      fetch_completed_at: new Date().toISOString(),
      pages_fetched: 1,
      products_found: rows.length,
      failed_products: 0,
    })
    .select("id")
    .single();

  if (importError || !importRun) {
    return NextResponse.json({ error: "Could not record the manual catalog import." }, { status: 500 });
  }

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
      fitment_review_required: row.fitmentReviewRequired,
      image_review_required: row.imageReviewRequired,
      imported: false,
      raw_provider_response: products[index]?.rawProviderResponse ?? null,
    }))
  );

  const { data: storedRows } = await supabase
    .from("catalog_import_rows")
    .select("id, supplier_sku, supplier_product_url, supplier_product_id")
    .eq("import_id", importRun.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({
    importId: importRun.id,
    pagesFetched: 1,
    productsFound: rows.length,
    failedProducts: 0,
    rows: rows.map((row) => ({
      ...row,
      catalogImportRowId: storedRows?.find(
        (item) =>
          (row.supplierProductId && item.supplier_product_id === row.supplierProductId) ||
          (row.supplierSku && item.supplier_sku === row.supplierSku) ||
          (row.supplierProductUrl && item.supplier_product_url === row.supplierProductUrl)
      )?.id,
    })),
  });
}
