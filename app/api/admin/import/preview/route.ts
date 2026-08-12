import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthContext } from "@/lib/supabase/auth";
import {
  buildMappedRow,
  defaultPricingSettings,
  normalizeSupplierRow,
  type ImporterField,
} from "@/lib/importer";

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth.user || auth.profile?.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const rows = Array.isArray(body.rows) ? body.rows : [];
  const mapping = (body.mapping ?? {}) as Record<string, ImporterField>;
  const supplierId = typeof body.supplierId === "string" ? body.supplierId : null;
  const supabase = createSupabaseAdminClient();

  const { data: pricingSettings } = await supabase
    .from("pricing_settings")
    .select("rules, minimum_gross_margin, rounding_mode")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: existingSupplierProducts } = await supabase
    .from("supplier_products")
    .select("id, supplier_sku, supplier_product_url, product_id");
  const { data: existingProducts } = await supabase
    .from("products")
    .select("id, title");

  const settings = pricingSettings
    ? {
        rules: pricingSettings.rules,
        minimumGrossMargin: Number(pricingSettings.minimum_gross_margin),
        roundingMode: pricingSettings.rounding_mode,
      }
    : defaultPricingSettings;

  const normalizedRows = rows.map((row: Record<string, unknown>, index: number) => {
    const mappedRow = buildMappedRow(row, mapping);
    const normalized = normalizeSupplierRow(index, mappedRow, settings);

    const supplierDuplicate = existingSupplierProducts?.find(
      (item) =>
        (normalized.supplierSku && item.supplier_sku === normalized.supplierSku) ||
        (normalized.supplierProductUrl &&
          item.supplier_product_url === normalized.supplierProductUrl)
    );
    const titleDuplicate = existingProducts?.find(
      (item) =>
        item.title.toLowerCase() === normalized.normalizedTitle.toLowerCase()
    );

    if (supplierDuplicate || titleDuplicate) {
      normalized.issues.push("Possible Duplicate Product");
      normalized.duplicateStrategy = "update";
      normalized.existingProductId =
        supplierDuplicate?.product_id ?? titleDuplicate?.id ?? undefined;
      normalized.existingSupplierProductId = supplierDuplicate?.id ?? undefined;
      normalized.status = "REVIEW REQUIRED";
    }

    if (supplierId === null) {
      normalized.issues.push("Supplier Required");
      normalized.status = "REVIEW REQUIRED";
    }

    return normalized;
  });

  return NextResponse.json({
    rows: normalizedRows,
    pricingSettings: settings,
  });
}
