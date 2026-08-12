import { products } from "@/lib/public-data";
import { sum } from "@/lib/utils";
import type { DemoOrder, SupplierRecord } from "@/lib/types";

export const supplierRecords: SupplierRecord[] = [
  { productSlug: "g20-m-performance-carbon-front-lip", variantId: "var_g20_front_lip_gloss", supplierName: "Composite Line Europe", supplierProductUrl: "https://supplier.example/g20-front-lip", supplierSku: "SUP-G20-LIP-01", supplierVariantId: "SUPVAR-GLS", supplierCost: 126, supplierShippingCost: 62, supplierMOQ: 1, supplierProcessingTime: "2-5 Business Days", supplierCountry: "Taiwan", supplierContact: "ops@compositeline.example", customerSalePrice: 449, shippingEstimate: "7-18 Business Days", internalNotes: "Inspect weave consistency before dispatch approval." },
  { productSlug: "w206-carbon-trunk-spoiler", variantId: "var_w206_spoiler_gloss", supplierName: "Euro Aero Works", supplierProductUrl: "https://supplier.example/w206-spoiler", supplierSku: "SUP-W206-SPR-02", supplierVariantId: "SUPVAR-W206-GLS", supplierCost: 74, supplierShippingCost: 28, supplierMOQ: 2, supplierProcessingTime: "2-4 Business Days", supplierCountry: "South Korea", supplierContact: "sales@euroaero.example", customerSalePrice: 269, shippingEstimate: "7-15 Business Days", internalNotes: "MOQ waived for existing monthly volume." },
  { productSlug: "audi-b9-rs-style-front-lip", variantId: "var_b9_lip_gloss", supplierName: "Street Composite Studio", supplierProductUrl: "https://supplier.example/b9-lip", supplierSku: "SUP-B9-LIP-05", supplierVariantId: "SUPVAR-B9-CF", supplierCost: 112, supplierShippingCost: 38, supplierMOQ: 1, supplierProcessingTime: "2-5 Business Days", supplierCountry: "China", supplierContact: "pm@streetcomposite.example", customerSalePrice: 379, shippingEstimate: "7-16 Business Days", internalNotes: "Confirm non-Allroad orders before release." },
  { productSlug: "bmw-g80-g82-v-style-dry-carbon-front-lip", variantId: "var_g8x_v_style_gloss", supplierName: "VCT Composite Catalog", supplierProductUrl: "https://supplier.example/g8x-v-style-front-lip", supplierSku: "VCT-G8X-LIP-03", supplierVariantId: "VCT-G8X-GLS", supplierCost: 248, supplierShippingCost: 88, supplierMOQ: 1, supplierProcessingTime: "3-6 Business Days", supplierCountry: "China", supplierContact: "sales@vctcatalog.example", customerSalePrice: 629, shippingEstimate: "8-18 Business Days", internalNotes: "Mapped from supplier public G80/G82 V-style listing." },
  { productSlug: "mercedes-w118-cla45s-dry-carbon-bodykit", variantId: "var_w118_bodykit_gloss", supplierName: "VCT Composite Catalog", supplierProductUrl: "https://supplier.example/w118-bodykit", supplierSku: "VCT-W118-BKIT-01", supplierVariantId: "VCT-W118-GLS", supplierCost: 642, supplierShippingCost: 165, supplierMOQ: 1, supplierProcessingTime: "5-9 Business Days", supplierCountry: "China", supplierContact: "sales@vctcatalog.example", customerSalePrice: 1499, shippingEstimate: "10-20 Business Days", internalNotes: "Fitment should be manually reviewed against CLA45S bumper profile." },
  { productSlug: "audi-b85-carbon-aero-kit", variantId: "var_b85_aero_gloss", supplierName: "VCT Composite Catalog", supplierProductUrl: "https://supplier.example/b85-aero-kit", supplierSku: "VCT-B85-KIT-07", supplierVariantId: "VCT-B85-GLS", supplierCost: 516, supplierShippingCost: 144, supplierMOQ: 1, supplierProcessingTime: "4-8 Business Days", supplierCountry: "China", supplierContact: "sales@vctcatalog.example", customerSalePrice: 1399, shippingEstimate: "9-18 Business Days", internalNotes: "Bundle listing combines multiple Audi platforms; keep fitment notes strict." },
  { productSlug: "porsche-992-real-carbon-front-lip", variantId: "var_992_front_lip_gloss", supplierName: "VCT Composite Catalog", supplierProductUrl: "https://supplier.example/992-front-lip", supplierSku: "VCT-992-LIP-02", supplierVariantId: "VCT-992-GLS", supplierCost: 392, supplierShippingCost: 112, supplierMOQ: 1, supplierProcessingTime: "4-7 Business Days", supplierCountry: "China", supplierContact: "sales@vctcatalog.example", customerSalePrice: 1099, shippingEstimate: "10-18 Business Days", internalNotes: "Mapped from supplier public 992 carbon front lip listing." },
];

export const adminOrders: (DemoOrder & { supplierState: string; customerName: string; supplierOrderNumber?: string; expectedProfit: number; paymentFees: number; })[] = [
  {
    orderNumber: "AH-100241",
    email: "demo@aerohaus.dev",
    customerName: "Demo Customer",
    status: "In Transit",
    supplierState: "Ordered From Supplier",
    supplierOrderNumber: "SUP-84822",
    expectedProfit: 283,
    paymentFees: 18,
    items: [
      { productSlug: "g20-m-performance-carbon-front-lip", variantId: "var_g20_front_lip_gloss", quantity: 1 },
      { productSlug: "g20-m340i-carbon-mirror-caps", variantId: "var_g20_mirror_gloss", quantity: 1 },
    ],
    timeline: [
      { status: "pending", label: "Order Confirmed", date: "Aug 2, 2026", complete: true },
      { status: "processing", label: "Processing", date: "Aug 4, 2026", complete: true },
      { status: "supplier", label: "Supplier Processing", date: "Aug 6, 2026", complete: true },
      { status: "shipped", label: "Shipped", date: "Aug 8, 2026", complete: true },
      { status: "transit", label: "In Transit", date: "Aug 10, 2026", complete: true },
      { status: "delivery", label: "Out for Delivery", date: "Pending", complete: false },
      { status: "delivered", label: "Delivered", date: "Pending", complete: false },
    ],
    trackingNumber: "AHX784920184US",
    carrier: "DHL eCommerce",
  },
];

export const adminMetrics = {
  revenue: 28480,
  orders: 64,
  grossProfit: 12440,
  averageOrderValue: 445,
  grossMargin: 43.7,
  topProducts: products.slice(0, 4).map((product) => product.title),
  topPlatforms: ["BMW G20", "BMW G80", "Mercedes W206", "Porsche 982"],
  lowMarginProducts: ["Porsche 718 Carbon Ducktail Spoiler"],
};

export function getSupplierRecord(productSlug: string, variantId: string) {
  return supplierRecords.find((record) => record.productSlug === productSlug && record.variantId === variantId);
}

export function calculateSupplierMargin(productSlug: string, variantId: string) {
  const record = getSupplierRecord(productSlug, variantId);
  if (!record) return null;
  const landedCost = record.supplierCost + record.supplierShippingCost;
  const grossProfit = record.customerSalePrice - landedCost;
  return { landedCost, grossProfit, marginPercent: (grossProfit / record.customerSalePrice) * 100, markupPercent: (grossProfit / landedCost) * 100 };
}

export const topLineAnalytics = {
  netProfitEstimate: adminMetrics.grossProfit - sum(adminOrders.map((order) => order.paymentFees)) - 340,
  refunds: 0,
  discounts: 420,
  adSpend: 340,
};
