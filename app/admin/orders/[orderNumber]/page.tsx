import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { AdminLockedState } from "@/components/admin-dashboard";
import { getAuthContext } from "@/lib/supabase/auth";
import { adminOrders, calculateSupplierMargin, getSupplierRecord } from "@/lib/private-data";
import { getProductBySlug } from "@/lib/store";

export default async function AdminOrderPage(props: { params: Promise<{ orderNumber: string }> }) {
  const auth = await getAuthContext();
  if (!auth.user || auth.profile?.role !== 'admin') return <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><AdminLockedState /></div>;
  const { orderNumber } = await props.params;
  const order = adminOrders.find((item) => item.orderNumber === orderNumber);
  if (!order) notFound();
  const firstItem = order.items[0];
  const product = getProductBySlug(firstItem.productSlug);
  const supplier = getSupplierRecord(firstItem.productSlug, firstItem.variantId);
  const margin = calculateSupplierMargin(firstItem.productSlug, firstItem.variantId);
  return <div><PageHero eyebrow="Admin Orders" title={order.orderNumber} description="Supplier workflow including cost visibility, order number capture, tracking updates and estimated profit calculation." image="/assets/page-admin-orders.svg" /><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]"><section className="border border-white/10 bg-zinc-950/80 p-6"><h2 className="text-2xl font-black uppercase tracking-[0.12em] text-white">Customer Order</h2><div className="mt-6 grid gap-3 text-sm text-zinc-300"><div>Customer: {order.customerName}</div><div>Email: {order.email}</div><div>Status: {order.status}</div><div>Supplier State: {order.supplierState}</div><div>Tracking: {order.trackingNumber ?? 'Pending'}</div></div>{product ? <div className="mt-6 border border-white/10 p-4"><div className="text-sm font-semibold text-white">{product.title}</div><div className="mt-2 text-xs uppercase tracking-[0.22em] text-zinc-500">{firstItem.variantId}</div></div> : null}</section><section className="border border-white/10 bg-zinc-950/80 p-6"><h2 className="text-2xl font-black uppercase tracking-[0.12em] text-white">Supplier Workflow</h2>{supplier ? <div className="mt-6 grid gap-3 text-sm text-zinc-300"><div>Supplier: {supplier.supplierName}</div><div>Supplier SKU: {supplier.supplierSku}</div><div>Supplier URL: {supplier.supplierProductUrl}</div><div>Supplier Cost: ${supplier.supplierCost.toFixed(2)}</div><div>Supplier Shipping: ${supplier.supplierShippingCost.toFixed(2)}</div><div>Processing Time: {supplier.supplierProcessingTime}</div><div>Country: {supplier.supplierCountry}</div>{margin ? <div className="text-lime-300">Expected gross profit ${margin.grossProfit.toFixed(2)} · {margin.marginPercent.toFixed(1)}% margin</div> : null}</div> : <div className="mt-6 text-sm text-zinc-400">No private supplier mapping found.</div>}<div className="mt-6 grid gap-3 md:grid-cols-2"><button className="h-12 border border-lime-300 bg-lime-300 text-sm font-semibold uppercase tracking-[0.22em] text-black">Mark Supplier Ordered</button><button className="h-12 border border-white/10 text-sm font-semibold uppercase tracking-[0.22em] text-white">Add Tracking Number</button></div></section></div></div></div>;
}
