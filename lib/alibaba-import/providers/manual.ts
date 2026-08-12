import type {
  AlibabaCatalogProvider,
  CatalogFetchOptions,
  CatalogFetchResult,
  NormalizedSupplierProduct,
} from "@/lib/alibaba-import/types";

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[$,\s]/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item)).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export function parseManualCatalogPayload(payload: unknown): NormalizedSupplierProduct[] {
  const rows = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as { products?: unknown }).products)
      ? ((payload as { products: unknown[] }).products)
      : [];

  return rows.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const record = row as Record<string, unknown>;
    const originalTitle =
      asString(record.originalTitle) ||
      asString(record.title) ||
      asString(record.name) ||
      asString(record["Supplier Product Name"]);
    if (!originalTitle) return [];

    const images = asStringArray(
      record.images ?? record.image ?? record["Supplier Image URL"] ?? record.mainImage
    );
    const extraImages = asStringArray(record.additionalImageUrls ?? record["Additional Image URLs"]);

    const product: NormalizedSupplierProduct = {
      supplierProductId: asString(record.supplierProductId ?? record.productId ?? record.id) || undefined,
      supplierSku: asString(record.supplierSku ?? record.sku ?? record["Supplier SKU"]) || undefined,
      originalTitle,
      supplierUrl: asString(record.supplierUrl ?? record.url ?? record["Supplier Product URL"]),
      images: [...images, ...extraImages],
      supplierPriceMin: asNumber(record.supplierPriceMin ?? record.price ?? record["Supplier Price"]),
      supplierPriceMax: asNumber(record.supplierPriceMax ?? record.priceMax),
      currency: asString(record.currency) || "USD",
      moq: asNumber(record.moq ?? record["MOQ"]),
      description: asString(record.description ?? record["Description"]) || undefined,
      specifications:
        record.specifications && typeof record.specifications === "object"
          ? (record.specifications as Record<string, string>)
          : undefined,
      variants: Array.isArray(record.variants)
        ? (record.variants as NormalizedSupplierProduct["variants"])
        : undefined,
      rawVehicleApplication: asString(record.rawVehicleApplication ?? record.application) || undefined,
      rawCategory: asString(record.rawCategory ?? record.category ?? record["Category"]) || undefined,
      shippingCost: asNumber(record.shippingCost ?? record["Supplier Shipping Cost"]),
      processingTime: asString(record.processingTime ?? record["Supplier Processing Time"]) || undefined,
      rawProviderResponse: record,
    };
    return [product];
  });
}

export class ManualCatalogProvider implements AlibabaCatalogProvider {
  constructor(private readonly products: NormalizedSupplierProduct[]) {}

  async fetchCatalog(_url: string, options?: CatalogFetchOptions): Promise<CatalogFetchResult> {
    await options?.onProgress?.({
      page: 1,
      productsOnPage: this.products.length,
      productsFound: this.products.length,
      message: `${this.products.length} products found`,
    });

    return {
      products: this.products,
      pagesFetched: 1,
      failedProducts: 0,
    };
  }
}
