import { builds, brands, demoOrders, featuredReviews, products, vehicleGenerations, vehicleRecords } from "@/lib/public-data";
import type { BrandSlug, FitmentResult, Product } from "@/lib/types";

export function getBrandBySlug(slug: string) {
  return brands.find((brand) => brand.slug === slug);
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getBuildBySlug(slug: string) {
  return builds.find((build) => build.slug === slug);
}

export function getVehicleRecordByKey(key?: string | null) {
  if (!key) return undefined;
  return vehicleRecords.find((vehicle) => vehicle.key === key);
}

export function getGenerationBySlug(slug?: string | null) {
  if (!slug) return undefined;
  return vehicleGenerations.find((generation) => generation.slug === slug);
}

export function getProductsForBrand(brandSlug: BrandSlug) {
  return products.filter((product) => product.brandSlug === brandSlug);
}

export function getProductsForGeneration(generationSlug: string) {
  return products.filter((product) => product.fitments.some((fitment) => fitment.generationSlug === generationSlug));
}

function normalizeTrimLabel(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function trimMatches(vehicleTrim: string, fitmentTrim: string) {
  const vehicle = normalizeTrimLabel(vehicleTrim);
  const fitment = normalizeTrimLabel(fitmentTrim);
  return vehicle === fitment || vehicle.includes(fitment) || fitment.includes(vehicle);
}

function packageKeywordMatches(vehicleTrim: string, requirement: string) {
  const vehicle = normalizeTrimLabel(vehicleTrim);
  const required = normalizeTrimLabel(requirement);
  if (required.includes("m sport")) return vehicle.includes("m sport");
  if (required.includes("base")) return vehicle.includes("base") || vehicle.includes("standard");
  if (required.includes("amg")) return vehicle.includes("amg");
  if (required.includes("s line")) return vehicle.includes("s line");
  return vehicle.includes(required);
}

export function evaluateFitment(product: Product, vehicleKey?: string | null): FitmentResult {
  const vehicle = getVehicleRecordByKey(vehicleKey);
  if (!vehicle) return "none";
  const match = product.fitments.find((fitment) => fitment.generationSlug === vehicle.generationSlug && vehicle.year >= fitment.yearStart && vehicle.year <= fitment.yearEnd && fitment.trims.some((trim) => trimMatches(vehicle.trim, trim)));
  if (!match) return "none";

  const excluded = (match.exclusions ?? []).some((exclusion) =>
    packageKeywordMatches(vehicle.trim, exclusion)
  );
  if (excluded) return "none";

  const missingRequirement = (match.requires ?? []).some(
    (requirement) => !packageKeywordMatches(vehicle.trim, requirement)
  );
  if (missingRequirement) return "partial";

  return match.exact ? "exact" : "partial";
}

export function getRelatedProducts(product: Product) {
  return product.relatedSlugs.map((slug) => getProductBySlug(slug)).filter((item): item is Product => Boolean(item));
}

export function searchProducts(query: string) {
  const search = query.trim().toLowerCase();
  if (!search) return products;
  return products.filter((product) => [product.title, product.brandName, product.categoryName, product.compatibilitySummary, ...product.fitments.map((fitment) => fitment.generationSlug)].join(" ").toLowerCase().includes(search));
}

export function filterProductList(
  productList: Product[],
  params: { brand?: string; category?: string; generation?: string; badge?: string; material?: string; availability?: string; search?: string; sort?: string; }
) {
  const search = (params.search || "").trim().toLowerCase();
  const filtered = productList
    .filter((product) => {
      if (!search) return true;
      return [
        product.title,
        product.brandName,
        product.categoryName,
        product.compatibilitySummary,
        ...product.fitments.map((fitment) => fitment.generationSlug),
      ]
        .join(" ")
        .toLowerCase()
        .includes(search);
    })
    .filter((product) => {
    if (params.brand && product.brandSlug !== params.brand) return false;
    if (params.category && product.categorySlug !== params.category) return false;
    if (params.generation && !product.fitments.some((fitment) => fitment.generationSlug === params.generation)) return false;
    if (params.badge && !product.badges.includes(params.badge.toUpperCase() as Product["badges"][number])) return false;
    if (params.material && !product.materialOptions.includes(params.material)) return false;
    if (params.availability === "in-stock" && !product.variants.some((variant) => variant.inventory > 0)) return false;
    return true;
  });

  switch (params.sort) {
    case "newest":
      return filtered.sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
    case "price-asc":
      return filtered.sort((a, b) => a.price - b.price);
    case "price-desc":
      return filtered.sort((a, b) => b.price - a.price);
    case "best-selling":
      return filtered.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller));
    default:
      return filtered.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

export function filterProducts(params: { brand?: string; category?: string; generation?: string; badge?: string; material?: string; availability?: string; search?: string; sort?: string; }) {
  return filterProductList(products, params);
}

export function getTrackableOrder(orderNumber: string, email: string) {
  return demoOrders.find((order) => order.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase() && order.email.toLowerCase() === email.trim().toLowerCase());
}

export { brands, builds, demoOrders, featuredReviews, products, vehicleGenerations, vehicleRecords };
