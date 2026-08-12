import { ExternalApiAlibabaCatalogProvider } from "@/lib/alibaba-import/providers/external-api";
import { MockAlibabaCatalogProvider } from "@/lib/alibaba-import/providers/mock";
import { OfficialAlibabaCatalogProvider } from "@/lib/alibaba-import/providers/official-api";
import type { AlibabaCatalogProvider } from "@/lib/alibaba-import/types";

export function getAlibabaImportProviderName() {
  return (process.env.ALIBABA_IMPORT_PROVIDER ?? "mock").trim() || "mock";
}

export function getAlibabaCatalogProvider(): AlibabaCatalogProvider {
  switch (getAlibabaImportProviderName()) {
    case "external-api":
      return new ExternalApiAlibabaCatalogProvider();
    case "official-api":
      return new OfficialAlibabaCatalogProvider();
    case "mock":
    default:
      return new MockAlibabaCatalogProvider();
  }
}
