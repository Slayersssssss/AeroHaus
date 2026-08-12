import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { AdminLockedState } from "@/components/admin-dashboard";
import { getAuthContext } from "@/lib/supabase/auth";
import { adminOrders, calculateSupplierMargin, getSupplierRecord, supplierRecords } from "@/lib/private-data";
import { getOrderByNumber } from "@/lib/storefront-server";

export default async function AdminOrderPage(props: { params: Promise<{ orderNumber: string }> }) {
  const auth = await getAuthContext();
  if (!auth.user || auth.profile?.role !== 'admin') return <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><AdminLockedState /></div>;
  const { orderNumber } = await props.params;
  const liveOrder = await getOrderByNumber(orderNumber);
  const order = liveOrder ?? adminOrders.find((item) => item.orderNumber === orderNumber);
  if (!order) notFound();
  const firstItem = 'order_items' in order ? order.order_items?.[0] : order.items[0];
  const supplierMatch =
    firstItem && 'product_variant_id' in firstItem
      ? supplierRecords.find((record) => record.variantId === firstItem.product_variant_id)
      : firstItem
        ? getSupplierRecord(firstItem.productSlug, firstItem.variantId)
        : undefined;
  const margin =
    supplierMatch ? calculateSupplierMargin(supplierMatch.productSlug, supplierMatch.variantId) : null;
  const orderTitle = "order_number" in order ? order.order_number : order.orderNumber;
  return <div><PageHero eyebrow="Admin Orders" title={orderTitle} description="Supplier workflow including cost visibility, order number capture, tracking updates and estimated profit calculation." image="/assets/page-admin-orders.svg" /><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]"><section className="border border-white/10 bg-zinc-950/80 p-6"><h2 className="text-2xl font-black uppercase tracking-[0.12em] text-white">Customer Order</h2><div className="mt-6 grid gap-3 text-sm text-zinc-300"><div>Email: {order.email}</div><div>Status: {order.status}</div><div>Tracking: {'trackingNumber' in order ? order.trackingNumber ?? 'Pending' : 'Pending'}</div></div>{firstItem ? <div className="mt-6 border border-white/10 p-4"><div className="text-sm font-semibold text-white">{'product_title' in firstItem ? firstItem.product_title : firstItem.productSlug}</div><div className="mt-2 text-xs uppercase tracking-[0.22em] text-zinc-500">{'product_variant_id' in firstItem ? firstItem.product_variant_id : firstItem.variantId}</div></div> : null}</section><section className="border border-white/10 bg-zinc-950/80 p-6"><h2 className="text-2xl font-black uppercase tracking-[0.12em] text-white">Supplier Workflow</h2>{supplierMatch ? <div className="mt-6 grid gap-3 text-sm text-zinc-300"><div>Supplier: {supplierMatch.supplierName}</div><div>Supplier SKU: {supplierMatch.supplierSku}</div><div>Supplier URL: {supplierMatch.supplierProductUrl}</div><div>Supplier Cost: ${supplierMatch.supplierCost.toFixed(2)}</div><div>Supplier Shipping: ${supplierMatch.supplierShippingCost.toFixed(2)}</div><div>Processing Time: {supplierMatch.supplierProcessingTime}</div><div>Country: {supplierMatch.supplierCountry}</div>{margin ? <div className="text-lime-300">Expected gross profit ${margin.grossProfit.toFixed(2)} · {margin.marginPercent.toFixed(1)}% margin</div> : null}</div> : <div className="mt-6 text-sm text-zinc-400">No private supplier mapping found.</div>}<div className="mt-6 grid gap-3 md:grid-cols-2"><button className="h-12 border border-lime-300 bg-lime-300 text-sm font-semibold uppercase tracking-[0.22em] text-black">Mark Supplier Ordered</button><button className="h-12 border border-white/10 text-sm font-semibold uppercase tracking-[0.22em] text-white">Add Tracking Number</button></div></section></div></div></div>;
}
