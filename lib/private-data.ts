import { products } from "@/lib/public-data";
import { sum } from "@/lib/utils";
import type { DemoOrder, SupplierRecord } from "@/lib/types";

export const supplierRecords: SupplierRecord[] = [
  { productSlug: "g20-m-performance-carbon-front-lip", variantId: "var_g20_front_lip_gloss", supplierName: "Composite Line Europe", supplierProductUrl: "https://supplier.example/g20-front-lip", supplierSku: "SUP-G20-LIP-01", supplierVariantId: "SUPVAR-GLS", supplierCost: 126, supplierShippingCost: 62, supplierMOQ: 1, supplierProcessingTime: "2-5 Business Days", supplierCountry: "Taiwan", supplierContact: "ops@compositeline.example", customerSalePrice: 449, shippingEstimate: "7-18 Business Days", internalNotes: "Inspect weave consistency before dispatch approval." },
  { productSlug: "w206-carbon-trunk-spoiler", variantId: "var_w206_spoiler_gloss", supplierName: "Euro Aero Works", supplierProductUrl: "https://supplier.example/w206-spoiler", supplierSku: "SUP-W206-SPR-02", supplierVariantId: "SUPVAR-W206-GLS", supplierCost: 74, supplierShippingCost: 28, supplierMOQ: 2, supplierProcessingTime: "2-4 Business Days", supplierCountry: "South Korea", supplierContact: "sales@euroaero.example", customerSalePrice: 269, shippingEstimate: "7-15 Business Days", internalNotes: "MOQ waived for existing monthly volume." },
  { productSlug: "audi-b9-rs-style-front-lip", variantId: "var_b9_lip_gloss", supplierName: "Street Composite Studio", supplierProductUrl: "https://supplier.example/b9-lip", supplierSku: "SUP-B9-LIP-05", supplierVariantId: "SUPVAR-B9-CF", supplierCost: 112, supplierShippingCost: 38, supplierMOQ: 1, supplierProcessingTime: "2-5 Business Days", supplierCountry: "China", supplierContact: "pm@streetcomposite.example", customerSalePrice: 379, shippingEstimate: "7-16 Business Days", internalNotes: "Confirm non-Allroad orders before release." },
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
