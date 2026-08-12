import {
  buildMappedRow,
  calculatePricing,
  defaultPricingSettings,
  normalizeSupplierRow,
  type ImporterField,
  type NormalizedImportRow,
  type PricingSettings,
} from "@/lib/importer";
import type { NormalizedSupplierProduct } from "@/lib/alibaba-import/types";
import { formatCurrency } from "@/lib/utils";

export type ExistingSupplierProduct = {
  id: string;
  supplier_id?: string | null;
  supplier_sku: string | null;
  supplier_product_url: string | null;
  supplier_product_id?: string | null;
  product_id: string | null;
  supplier_cost?: number | null;
  supplier_current_price?: number | null;
};

const catalogFieldMapping: Record<string, ImporterField> = {
  originalTitle: "Supplier Product Name",
  supplierSku: "Supplier SKU",
  supplierPriceMin: "Supplier Price",
  shippingCost: "Supplier Shipping Cost",
  supplierUrl: "Supplier Product URL",
  image: "Supplier Image URL",
  additionalImages: "Additional Image URLs",
  rawCategory: "Category",
  description: "Description",
  moq: "MOQ",
  processingTime: "Supplier Processing Time",
  rawVehicleApplication: "Supplier Notes",
};

function costChangeWarning(previous: number, next: number) {
  if (!previous || previous <= 0 || next <= 0) return undefined;
  const delta = ((next - previous) / previous) * 100;
  if (Math.abs(delta) < 10) return undefined;
  const direction = next >= previous ? "increased" : "decreased";
  const sign = delta >= 0 ? "+" : "";
  return `Supplier cost ${direction} from ${formatCurrency(previous)} to ${formatCurrency(next)} (${sign}${delta.toFixed(1)}%)`;
}

export function catalogProductToPreviewRow(
  product: NormalizedSupplierProduct,
  index: number,
  settings: PricingSettings
): NormalizedImportRow {
  const mapped = buildMappedRow(
    {
      originalTitle: product.originalTitle,
      supplierSku: product.supplierSku ?? "",
      supplierPriceMin: product.supplierPriceMin ?? 0,
      shippingCost: product.shippingCost ?? 0,
      supplierUrl: product.supplierUrl,
      image: product.images[0] ?? "",
      additionalImages: product.images.slice(1).join(", "),
      rawCategory: product.rawCategory ?? "",
      description: product.description ?? "",
      moq: product.moq ?? "",
      processingTime: product.processingTime ?? "",
      rawVehicleApplication: product.rawVehicleApplication ?? "",
    },
    catalogFieldMapping
  );

  const row = normalizeSupplierRow(index, mapped, settings);
  row.supplierProductId = product.supplierProductId;
  row.variants = (product.variants ?? []).map((variant) => {
    const variantCost = variant.supplierCost ?? product.supplierPriceMin ?? row.supplierPrice;
    const pricing = calculatePricing(variantCost, row.supplierShippingCost, settings);
    return {
      ...variant,
      recommendedRetailPrice: pricing.recommendedRetailPrice,
    };
  });

  return row;
}

export function applyDuplicateState(
  row: NormalizedImportRow,
  existingSupplierProducts: ExistingSupplierProduct[],
  existingProducts: Array<{ id: string; title: string }>,
  supplierId?: string
) {
  const supplierDuplicate = existingSupplierProducts.find((item) => {
    if (supplierId && item.supplier_id && item.supplier_id !== supplierId) {
      return false;
    }
    return Boolean(
      (row.supplierProductId && item.supplier_product_id === row.supplierProductId) ||
        (row.supplierProductUrl && item.supplier_product_url === row.supplierProductUrl) ||
        (row.supplierSku && item.supplier_sku === row.supplierSku) ||
        (row.existingProductId && item.product_id === row.existingProductId)
    );
  });

  const titleDuplicate = existingProducts.find(
    (item) => item.title.toLowerCase() === row.normalizedTitle.toLowerCase()
  );

  if (supplierDuplicate || titleDuplicate) {
    const previousCost = Number(
      supplierDuplicate?.supplier_current_price ?? supplierDuplicate?.supplier_cost ?? 0
    );
    row.alreadyImported = true;
    row.status = "ALREADY IMPORTED";
    row.duplicateStrategy = "skip";
    row.existingProductId = supplierDuplicate?.product_id ?? titleDuplicate?.id ?? undefined;
    row.existingSupplierProductId = supplierDuplicate?.id ?? undefined;
    row.costChangeWarning = costChangeWarning(previousCost, row.supplierPrice);
    if (!row.issues.includes("ALREADY IMPORTED")) {
      row.issues.unshift("ALREADY IMPORTED");
    }
    if (row.costChangeWarning && !row.issues.includes(row.costChangeWarning)) {
      row.issues.push(row.costChangeWarning);
    }
  }

  return row;
}

export function getPricingSettingsOrDefault(settings: {
  rules: unknown;
  minimum_gross_margin: number | string;
  rounding_mode: string;
} | null): PricingSettings {
  if (!settings) return defaultPricingSettings;
  return {
    rules: Array.isArray(settings.rules) ? (settings.rules as PricingSettings["rules"]) : defaultPricingSettings.rules,
    minimumGrossMargin: Number(settings.minimum_gross_margin),
    roundingMode:
      settings.rounding_mode === "nearest-99" ? "nearest-99" : "nearest-9",
  };
}
