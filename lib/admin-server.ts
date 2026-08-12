import "server-only";

import { adminMetrics, adminOrders } from "@/lib/private-data";
import { getGenerationBySlug } from "@/lib/store";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminOverviewData = {
  revenue: number;
  orders: number;
  grossProfit: number;
  averageOrderValue: number;
  grossMargin: number;
  ordersAwaitingSupplierPurchase: number;
  ordersAwaitingTracking: number;
  topProducts: { title: string; quantity: number }[];
  topPlatforms: string[];
  recentCustomers: { email: string; orderNumber: string; total: number }[];
  lowMarginProducts: { title: string; marginPercent: number }[];
  highlightedOrder:
    | {
        orderNumber: string;
        email: string;
        status: string;
        productTitle: string;
        grossProfit: number;
        marginPercent: number;
      }
    | null;
};

export async function getAdminOverviewData(): Promise<AdminOverviewData> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      revenue: adminMetrics.revenue,
      orders: adminMetrics.orders,
      grossProfit: adminMetrics.grossProfit,
      averageOrderValue: adminMetrics.averageOrderValue,
      grossMargin: adminMetrics.grossMargin,
      ordersAwaitingSupplierPurchase: 0,
      ordersAwaitingTracking: 1,
      topProducts: adminMetrics.topProducts.map((title) => ({ title, quantity: 1 })),
      topPlatforms: adminMetrics.topPlatforms,
      recentCustomers: adminOrders.map((order) => ({
        email: order.email,
        orderNumber: order.orderNumber,
        total: order.expectedProfit,
      })),
      lowMarginProducts: adminMetrics.lowMarginProducts.map((title) => ({
        title,
        marginPercent: 0,
      })),
      highlightedOrder: {
        orderNumber: adminOrders[0].orderNumber,
        email: adminOrders[0].email,
        status: adminOrders[0].status,
        productTitle: "BMW G20 M Performance Style Carbon Fiber Front Lip",
        grossProfit: adminOrders[0].expectedProfit,
        marginPercent: 0,
      },
    };
  }

  const [{ data: orders }, { data: supplierProducts }, { data: products }, { data: fitments }] =
    await Promise.all([
      supabase
        .from("orders")
        .select(
          "id, order_number, email, status, subtotal, discount_total, refund_total, payment_processing_fees, advertising_cost, created_at, order_items(product_id, product_variant_id, product_title, quantity, unit_price, supplier_cost, supplier_shipping_cost)"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("supplier_products")
        .select(
          "product_id, product_variant_id, supplier_cost, supplier_shipping_cost, customer_sale_price"
        ),
      supabase.from("products").select("id, title"),
      supabase
        .from("product_fitments")
        .select("product_id, generation_slug"),
    ]);

  if (!orders || orders.length === 0) {
    return {
      revenue: 0,
      orders: 0,
      grossProfit: 0,
      averageOrderValue: 0,
      grossMargin: 0,
      ordersAwaitingSupplierPurchase: 0,
      ordersAwaitingTracking: 0,
      topProducts: [],
      topPlatforms: [],
      recentCustomers: [],
      lowMarginProducts: [],
      highlightedOrder: null,
    };
  }

  const productTitleById = new Map((products ?? []).map((product) => [product.id, product.title]));
  const fitmentsByProductId = new Map<string, string[]>();
  for (const fitment of fitments ?? []) {
    const current = fitmentsByProductId.get(fitment.product_id) ?? [];
    fitmentsByProductId.set(fitment.product_id, [...current, fitment.generation_slug]);
  }

  const supplierByVariantId = new Map(
    (supplierProducts ?? []).map((record) => [record.product_variant_id, record])
  );

  let revenue = 0;
  let grossProfit = 0;
  const productQuantities = new Map<string, number>();
  const platformCounts = new Map<string, number>();

  for (const order of orders) {
    const subtotal = Number(order.subtotal ?? 0);
    const discounts = Number(order.discount_total ?? 0);
    const refunds = Number(order.refund_total ?? 0);
    const fees = Number(order.payment_processing_fees ?? 0);
    const adCost = Number(order.advertising_cost ?? 0);
    revenue += subtotal;

    let orderCost = 0;
    for (const item of order.order_items ?? []) {
      const quantity = Number(item.quantity ?? 0);
      const supplierRecord = supplierByVariantId.get(item.product_variant_id);
      const supplierCost = Number(
        item.supplier_cost ??
          supplierRecord?.supplier_cost ??
          0
      );
      const supplierShipping = Number(
        item.supplier_shipping_cost ??
          supplierRecord?.supplier_shipping_cost ??
          0
      );
      orderCost += (supplierCost + supplierShipping) * quantity;

      const title = item.product_title || productTitleById.get(item.product_id) || "Unknown Product";
      productQuantities.set(title, (productQuantities.get(title) ?? 0) + quantity);

      for (const generationSlug of fitmentsByProductId.get(item.product_id) ?? []) {
        const generation = getGenerationBySlug(generationSlug);
        const label = generation
          ? `${generation.makeSlug.toUpperCase()} ${generation.chassisLabel}`
          : generationSlug.toUpperCase();
        platformCounts.set(label, (platformCounts.get(label) ?? 0) + quantity);
      }
    }

    grossProfit += subtotal - orderCost - fees - refunds - discounts - adCost;
  }

  const averageOrderValue = revenue / orders.length;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  const topProducts = [...productQuantities.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([title, quantity]) => ({ title, quantity }));

  const topPlatforms = [...platformCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label]) => label);

  const recentCustomers = orders.slice(0, 5).map((order) => ({
    email: order.email,
    orderNumber: order.order_number,
    total: Number(order.subtotal ?? 0),
  }));

  const lowMarginProducts = (supplierProducts ?? [])
    .map((record) => {
      const salePrice = Number(record.customer_sale_price ?? 0);
      const landed = Number(record.supplier_cost ?? 0) + Number(record.supplier_shipping_cost ?? 0);
      const marginPercent = salePrice > 0 ? ((salePrice - landed) / salePrice) * 100 : 0;
      return {
        title: productTitleById.get(record.product_id) ?? "Unknown Product",
        marginPercent,
      };
    })
    .sort((a, b) => a.marginPercent - b.marginPercent)
    .slice(0, 5);

  const highlightedOrderRow = orders.find((order) =>
    ["Paid", "Processing", "Ordered From Supplier", "Supplier Processing", "Shipped"].includes(order.status)
  ) ?? orders[0];
  const highlightedItem = highlightedOrderRow.order_items?.[0];
  const highlightedSupplier = highlightedItem
    ? supplierByVariantId.get(highlightedItem.product_variant_id)
    : null;
  const highlightedLanded =
    Number(highlightedSupplier?.supplier_cost ?? highlightedItem?.supplier_cost ?? 0) +
    Number(highlightedSupplier?.supplier_shipping_cost ?? highlightedItem?.supplier_shipping_cost ?? 0);
  const highlightedQuantity = Number(highlightedItem?.quantity ?? 1);
  const highlightedSubtotal = Number(highlightedItem?.unit_price ?? 0) * highlightedQuantity;
  const highlightedGrossProfit = highlightedSubtotal - highlightedLanded * highlightedQuantity;
  const highlightedMarginPercent =
    highlightedSubtotal > 0 ? (highlightedGrossProfit / highlightedSubtotal) * 100 : 0;

  return {
    revenue,
    orders: orders.length,
    grossProfit,
    averageOrderValue,
    grossMargin,
    ordersAwaitingSupplierPurchase: orders.filter((order) =>
      ["Pending", "Paid", "Processing"].includes(order.status)
    ).length,
    ordersAwaitingTracking: orders.filter((order) =>
      ["Ordered From Supplier", "Supplier Processing", "Shipped"].includes(order.status)
    ).length,
    topProducts,
    topPlatforms,
    recentCustomers,
    lowMarginProducts,
    highlightedOrder: highlightedItem
      ? {
          orderNumber: highlightedOrderRow.order_number,
          email: highlightedOrderRow.email,
          status: highlightedOrderRow.status,
          productTitle:
            highlightedItem.product_title ||
            productTitleById.get(highlightedItem.product_id) ||
            "Unknown Product",
          grossProfit: highlightedGrossProfit,
          marginPercent: highlightedMarginPercent,
        }
      : null,
  };
}
