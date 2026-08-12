import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, ChartNoAxesCombined, Lock, Package, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminMetrics, adminOrders, calculateSupplierMargin } from "@/lib/private-data";
import { getProductBySlug } from "@/lib/store";

export function AdminLockedState() {
  return (
    <div className="border border-white/10 bg-zinc-950/80 p-8 text-center"><Lock className="mx-auto h-10 w-10 text-lime-300" /><h1 className="mt-4 text-3xl font-black uppercase tracking-[0.12em] text-white">Admin Access Required</h1><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-400">Supabase auth is wired for admin-only access. Sign in with a profile whose role is set to <span className="text-white">admin</span> to unlock revenue, supplier workflow, and margin data.</p><Link href="/auth/sign-in?redirect=/admin"><Button className="mt-6">Admin Sign In</Button></Link></div>
  );
}

export function AdminOverview() {
  const highlightedOrder = adminOrders[0];
  const highlightedItem = highlightedOrder.items[0];
  const product = getProductBySlug(highlightedItem.productSlug);
  const margin = calculateSupplierMargin(highlightedItem.productSlug, highlightedItem.variantId);
  const orderHref = `/admin/orders/${highlightedOrder.orderNumber}` as Route;
  const quickLinks = [
    { href: "/admin/products", label: "Manage catalog & supplier data" },
    { href: "/admin/orders/AH-100241", label: "Open supplier order workflow" },
  ] as const;
  return (
    <div className="grid gap-6"><section className="grid gap-4 lg:grid-cols-5">{[{ label: "Revenue", value: `$${adminMetrics.revenue.toLocaleString()}`, icon: TrendingUp }, { label: "Orders", value: String(adminMetrics.orders), icon: Package }, { label: "Gross Profit", value: `$${adminMetrics.grossProfit.toLocaleString()}`, icon: ChartNoAxesCombined }, { label: "Average Order Value", value: `$${adminMetrics.averageOrderValue}`, icon: TrendingUp }, { label: "Gross Margin", value: `${adminMetrics.grossMargin}%`, icon: TrendingUp }].map((item) => <article key={item.label} className="border border-white/10 bg-zinc-950/80 p-5"><item.icon className="h-5 w-5 text-lime-300" /><div className="mt-4 text-2xl font-black uppercase tracking-[0.12em] text-white">{item.value}</div><div className="mt-2 text-xs uppercase tracking-[0.22em] text-zinc-500">{item.label}</div></article>)}</section><section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><article className="border border-white/10 bg-zinc-950/80 p-6"><div className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.28em] text-lime-300">Supplier Workflow</p><h2 className="mt-2 text-2xl font-black uppercase tracking-[0.12em] text-white">Orders Awaiting Tracking</h2></div><Link href={orderHref} className="text-sm font-semibold uppercase tracking-[0.22em] text-lime-300">Open Order</Link></div><div className="mt-6 border border-white/10 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-lg font-semibold text-white">{highlightedOrder.orderNumber}</div><div className="mt-1 text-sm text-zinc-400">{highlightedOrder.customerName} · {highlightedOrder.email}</div></div><span className="border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-amber-100">{highlightedOrder.supplierState}</span></div>{product && margin ? <div className="mt-5 grid gap-3 md:grid-cols-2"><div className="border border-white/10 bg-black/20 p-4 text-sm text-zinc-300"><div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Product</div><div className="mt-2 text-white">{product.title}</div></div><div className="border border-white/10 bg-black/20 p-4 text-sm text-zinc-300"><div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Expected Profit</div><div className="mt-2 text-white">${margin.grossProfit.toFixed(0)} · {margin.marginPercent.toFixed(1)}% margin</div></div></div> : null}</div></article><article className="border border-white/10 bg-zinc-950/80 p-6"><p className="text-xs uppercase tracking-[0.28em] text-lime-300">Management</p><h2 className="mt-2 text-2xl font-black uppercase tracking-[0.12em] text-white">Quick Access</h2><div className="mt-5 grid gap-3">{quickLinks.map((link) => <Link key={link.href} href={link.href} className="flex items-center justify-between border border-white/10 px-4 py-4 text-sm text-zinc-300 transition hover:border-lime-300/30 hover:text-white">{link.label}<ArrowRight className="h-4 w-4" /></Link>)}</div></article></section></div>
  );
}
