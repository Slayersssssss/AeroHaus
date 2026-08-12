import type { NormalizedImportRow } from "@/lib/importer";

export type SupplierVariant = {
  supplierVariantId?: string;
  supplierSku?: string;
  optionName: string;
  optionValue: string;
  supplierCost?: number;
};

export type NormalizedSupplierProduct = {
  supplierProductId?: string;
  supplierSku?: string;
  originalTitle: string;
  supplierUrl: string;
  images: string[];
  supplierPriceMin?: number;
  supplierPriceMax?: number;
  currency?: string;
  moq?: number;
  description?: string;
  specifications?: Record<string, string>;
  variants?: SupplierVariant[];
  rawVehicleApplication?: string;
  rawCategory?: string;
  shippingCost?: number;
  processingTime?: string;
  rawProviderResponse?: unknown;
};

export type CatalogFetchProgress = {
  page: number;
  productsOnPage: number;
  productsFound: number;
  message: string;
};

export type CatalogFetchResult = {
  products: NormalizedSupplierProduct[];
  pagesFetched: number;
  failedProducts: number;
};

export type CatalogFetchOptions = {
  onProgress?: (progress: CatalogFetchProgress) => void | Promise<void>;
};

export interface AlibabaCatalogProvider {
  fetchCatalog(url: string, options?: CatalogFetchOptions): Promise<CatalogFetchResult>;
}

export type CatalogPreviewRow = NormalizedImportRow;

export type CatalogFetchEvent =
  | { type: "status"; message: string }
  | {
      type: "page";
      page: number;
      productsOnPage: number;
      productsFound: number;
      message: string;
    }
  | {
      type: "complete";
      importId: string;
      pagesFetched: number;
      productsFound: number;
      failedProducts: number;
      rows: CatalogPreviewRow[];
    }
  | { type: "error"; message: string };
