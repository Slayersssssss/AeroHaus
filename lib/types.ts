export type BrandSlug = "bmw" | "mercedes-benz" | "audi" | "porsche";
export type CategorySlug =
  | "carbon-fiber"
  | "front-lips"
  | "rear-diffusers"
  | "side-skirts"
  | "spoilers"
  | "grilles"
  | "mirror-caps"
  | "body-kits"
  | "headlights"
  | "tail-lights"
  | "exhaust-tips"
  | "interior-trim"
  | "wheels"
  | "suspension"
  | "lighting"
  | "exterior-styling-accessories";

export type ProductBadge = "BEST SELLER" | "NEW" | "SALE" | "PREORDER";
export type ProductStatus = "Draft" | "Active" | "Out of Stock" | "Preorder" | "Archived";
export type FitmentResult = "exact" | "partial" | "none";
export type SupportCategory =
  | "Order Status"
  | "Fitment Question"
  | "Product Question"
  | "Return"
  | "Damage Claim"
  | "Wholesale"
  | "Other";

export interface MegaMenuGroup {
  label: string;
  items: string[];
}

export interface BrandDefinition {
  slug: BrandSlug;
  name: string;
  tagline: string;
  heroImage: string;
  description: string;
  featuredGenerationSlug: string;
  megaMenu: MegaMenuGroup[];
}

export interface VehicleGeneration {
  slug: string;
  makeSlug: BrandSlug;
  modelSlug: string;
  modelName: string;
  name: string;
  chassisLabel: string;
  years: number[];
  trims: string[];
  notes?: string;
}

export interface VehicleRecord {
  key: string;
  year: number;
  makeSlug: BrandSlug;
  makeName: string;
  modelSlug: string;
  modelName: string;
  generationSlug: string;
  generationName: string;
  chassisLabel: string;
  trim: string;
  label: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  material: string;
  finish: string;
  optionLabel: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
}

export interface ProductFitment {
  generationSlug: string;
  yearStart: number;
  yearEnd: number;
  trims: string[];
  exact: boolean;
  notes: string;
  exclusions?: string[];
  requires?: string[];
}

export interface ProductReview {
  id: string;
  customer: string;
  rating: number;
  title: string;
  review: string;
  vehicle: string;
  verifiedPurchase: boolean;
  photos: string[];
  date: string;
  approved: boolean;
}

export interface ShippingWindow {
  processingBusinessDays: string;
  deliveryBusinessDays: string;
}

export interface Product {
  id: string;
  slug: string;
  brandSlug: BrandSlug;
  brandName: string;
  categorySlug: CategorySlug;
  categoryName: string;
  title: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  status: ProductStatus;
  badges: ProductBadge[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  materialOptions: string[];
  finishOptions: string[];
  gallery: string[];
  compatibilitySummary: string;
  fitments: ProductFitment[];
  variants: ProductVariant[];
  shippingWindow: ShippingWindow;
  installation: string;
  whatsIncluded: string[];
  faq: { question: string; answer: string }[];
  relatedSlugs: string[];
}

export interface Build {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  vehicleLabel: string;
  description: string;
  heroImage: string;
  gallery: string[];
  productSlugs: string[];
}

export interface CartLine {
  id: string;
  productSlug: string;
  variantId: string;
  quantity: number;
  vehicleKey?: string;
}

export interface OrderTimelineEvent {
  status: string;
  label: string;
  date: string;
  complete: boolean;
}

export interface DemoOrder {
  orderNumber: string;
  email: string;
  status: string;
  items: { productSlug: string; variantId: string; quantity: number }[];
  timeline: OrderTimelineEvent[];
  trackingNumber?: string;
  carrier?: string;
}

export interface SupplierRecord {
  productSlug: string;
  variantId: string;
  supplierName: string;
  supplierProductUrl: string;
  supplierSku: string;
  supplierVariantId: string;
  supplierCost: number;
  supplierShippingCost: number;
  supplierMOQ: number;
  supplierProcessingTime: string;
  supplierCountry: string;
  supplierContact: string;
  customerSalePrice: number;
  shippingEstimate: string;
  trackingNumber?: string;
  internalNotes: string;
}
