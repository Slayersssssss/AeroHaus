import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, ChartNoAxesCombined, Lock, Package, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminOverviewData } from "@/lib/admin-server";
import { formatCurrency } from "@/lib/utils";

export function AdminLockedState() {
  return (
    <div className="border border-white/10 bg-zinc-950/80 p-8 text-center"><Lock className="mx-auto h-10 w-10 text-lime-300" /><h1 className="mt-4 text-3xl font-black uppercase tracking-[0.12em] text-white">Admin Access Required</h1><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-400">Supabase auth is wired for admin-only access. Sign in with a profile whose role is set to <span className="text-white">admin</span> to unlock revenue, supplier workflow, and margin data.</p><Link href="/auth/sign-in?redirect=/admin"><Button className="mt-6">Admin Sign In</Button></Link></div>
  );
}

export function AdminOverview({ data }: { data: AdminOverviewData }) {
  const orderHref = (data.highlightedOrder
    ? `/admin/orders/${data.highlightedOrder.orderNumber}`
    : "/admin/orders/AH-100310") as Route;
  const quickLinks = [
    { href: "/admin/import/alibaba", label: "Supplier Catalog Import" },
    { href: "/admin/import", label: "CSV / Excel catalog importer" },
    { href: "/admin/products", label: "Manage catalog & supplier data" },
    { href: "/admin/suppliers", label: "Manage suppliers" },
    { href: "/admin/settings/pricing", label: "Pricing engine settings" },
    { href: "/admin/orders/AH-100310", label: "Open supplier order workflow" },
  ] as const;
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 lg:grid-cols-5">
        {[
          { label: "Revenue", value: formatCurrency(data.revenue), icon: TrendingUp },
          { label: "Orders", value: String(data.orders), icon: Package },
          { label: "Gross Profit", value: formatCurrency(data.grossProfit), icon: ChartNoAxesCombined },
          { label: "Average Order Value", value: formatCurrency(data.averageOrderValue), icon: TrendingUp },
          { label: "Gross Margin", value: `${data.grossMargin.toFixed(1)}%`, icon: TrendingUp },
        ].map((item) => (
          <article key={item.label} className="border border-white/10 bg-zinc-950/80 p-5">
            <item.icon className="h-5 w-5 text-lime-300" />
            <div className="mt-4 text-2xl font-black uppercase tracking-[0.12em] text-white">
              {item.value}
            </div>
            <div className="mt-2 text-xs uppercase tracking-[0.22em] text-zinc-500">
              {item.label}
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="border border-white/10 bg-zinc-950/80 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-lime-300">
                Supplier Workflow
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.12em] text-white">
                Operational Queue
              </h2>
            </div>
            <Link href={orderHref} className="text-sm font-semibold uppercase tracking-[0.22em] text-lime-300">
              Open Order
            </Link>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                Awaiting Supplier Purchase
              </div>
              <div className="mt-2 text-2xl font-black uppercase tracking-[0.1em] text-white">
                {data.ordersAwaitingSupplierPurchase}
              </div>
            </div>
            <div className="border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                Awaiting Tracking
              </div>
              <div className="mt-2 text-2xl font-black uppercase tracking-[0.1em] text-white">
                {data.ordersAwaitingTracking}
              </div>
            </div>
          </div>
          {data.highlightedOrder ? (
            <div className="mt-6 border border-white/10 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-white">
                    {data.highlightedOrder.orderNumber}
                  </div>
                  <div className="mt-1 text-sm text-zinc-400">
                    {data.highlightedOrder.email}
                  </div>
                </div>
                <span className="border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-amber-100">
                  {data.highlightedOrder.status}
                </span>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
                  <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Product</div>
                  <div className="mt-2 text-white">{data.highlightedOrder.productTitle}</div>
                </div>
                <div className="border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
                  <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Expected Profit</div>
                  <div className="mt-2 text-white">
                    {formatCurrency(data.highlightedOrder.grossProfit)} ·{" "}
                    {data.highlightedOrder.marginPercent.toFixed(1)}% margin
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </article>

        <article className="border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Management</p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.12em] text-white">
            Quick Access
          </h2>
          <div className="mt-5 grid gap-3">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="flex items-center justify-between border border-white/10 px-4 py-4 text-sm text-zinc-300 transition hover:border-lime-300/30 hover:text-white">
                {link.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
        <article className="border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Top Products</p>
          <div className="mt-5 space-y-3">
            {data.topProducts.map((product) => (
              <div key={product.title} className="flex items-center justify-between border border-white/10 px-4 py-3 text-sm text-zinc-300">
                <span>{product.title}</span>
                <span className="text-lime-300">{product.quantity}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Top Vehicle Platforms</p>
          <div className="mt-5 space-y-3">
            {data.topPlatforms.map((platform) => (
              <div key={platform} className="border border-white/10 px-4 py-3 text-sm text-zinc-300">
                {platform}
              </div>
            ))}
          </div>
        </article>
        <article className="border border-white/10 bg-zinc-950/80 p-6">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-lime-300" />
            <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Recent Customers</p>
          </div>
          <div className="mt-5 space-y-3">
            {data.recentCustomers.map((customer) => (
              <div key={customer.orderNumber} className="border border-white/10 px-4 py-3 text-sm text-zinc-300">
                <div className="font-medium text-white">{customer.email}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-500">
                  {customer.orderNumber} · {formatCurrency(customer.total)}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="border border-white/10 bg-zinc-950/80 p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Margin Watch</p>
        <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.12em] text-white">
          Low Margin Products
        </h2>
        <div className="mt-5 grid gap-3">
          {data.lowMarginProducts.map((product) => (
            <div key={product.title} className="flex items-center justify-between border border-white/10 px-4 py-4 text-sm text-zinc-300">
              <span>{product.title}</span>
              <span className="text-amber-200">{product.marginPercent.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
