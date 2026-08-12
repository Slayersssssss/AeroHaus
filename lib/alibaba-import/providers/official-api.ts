import type {
  AlibabaCatalogProvider,
  CatalogFetchResult,
} from "@/lib/alibaba-import/types";

const PROVIDER_ERROR =
  "Unable to retrieve this supplier catalog using the configured provider.";

export class OfficialAlibabaCatalogProvider implements AlibabaCatalogProvider {
  async fetchCatalog(): Promise<CatalogFetchResult> {
    if (!process.env.ALIBABA_IMPORT_API_KEY || !process.env.ALIBABA_IMPORT_API_URL) {
      throw new Error(PROVIDER_ERROR);
    }

    throw new Error(PROVIDER_ERROR);
  }
}
