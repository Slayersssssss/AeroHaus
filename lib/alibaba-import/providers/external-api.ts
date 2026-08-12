import type {
  AlibabaCatalogProvider,
  CatalogFetchOptions,
  CatalogFetchResult,
  NormalizedSupplierProduct,
} from "@/lib/alibaba-import/types";

const PROVIDER_ERROR =
  "Unable to retrieve this supplier catalog using the configured provider.";

function asCatalogResult(payload: unknown): CatalogFetchResult {
  if (!payload || typeof payload !== "object") {
    throw new Error(PROVIDER_ERROR);
  }

  const record = payload as Record<string, unknown>;
  const products = Array.isArray(record.products)
    ? (record.products as NormalizedSupplierProduct[])
    : Array.isArray(record.items)
      ? (record.items as NormalizedSupplierProduct[])
      : null;

  if (!products) {
    throw new Error(PROVIDER_ERROR);
  }

  return {
    products,
    pagesFetched: Number(record.pagesFetched ?? record.pages ?? 1) || 1,
    failedProducts: Number(record.failedProducts ?? 0) || 0,
  };
}

export class ExternalApiAlibabaCatalogProvider implements AlibabaCatalogProvider {
  async fetchCatalog(url: string, options?: CatalogFetchOptions): Promise<CatalogFetchResult> {
    const endpoint = process.env.ALIBABA_IMPORT_API_URL;
    const apiKey = process.env.ALIBABA_IMPORT_API_KEY;

    if (!endpoint || !apiKey) {
      throw new Error(PROVIDER_ERROR);
    }

    let parsedEndpoint: URL;
    try {
      parsedEndpoint = new URL(endpoint);
    } catch {
      throw new Error(PROVIDER_ERROR);
    }

    if (!["http:", "https:"].includes(parsedEndpoint.protocol)) {
      throw new Error(PROVIDER_ERROR);
    }

    await options?.onProgress?.({
      page: 1,
      productsOnPage: 0,
      productsFound: 0,
      message: "Fetching products...",
    });

    const response = await fetch(parsedEndpoint.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(PROVIDER_ERROR);
    }

    const result = asCatalogResult(await response.json());
    await options?.onProgress?.({
      page: result.pagesFetched,
      productsOnPage: result.products.length,
      productsFound: result.products.length,
      message: `${result.products.length} products found`,
    });
    return result;
  }
}
