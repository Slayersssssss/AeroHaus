import { PageHero } from "@/components/page-hero";
import { getAuthContext } from "@/lib/supabase/auth";
import { AdminLockedState } from "@/components/admin-dashboard";
import { products } from "@/lib/store";
import { calculateSupplierMargin } from "@/lib/private-data";

export default async function AdminProductsPage() {
  const auth = await getAuthContext();
  if (!auth.user || auth.profile?.role !== 'admin') return <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><AdminLockedState /></div>;
  return <div><PageHero eyebrow="Admin Products" title="Catalog & Supplier Data" description="Manage retail pricing, sale pricing, fitment, media, SEO, supplier landed costs and private margin logic without exposing internal data publicly." image="/assets/page-admin-products.svg" /><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="grid gap-4">{products.map((product) => { const margin = calculateSupplierMargin(product.slug, product.variants[0]?.id ?? ''); return <article key={product.slug} className="grid gap-4 border border-white/10 bg-zinc-950/80 p-5 lg:grid-cols-[1.3fr_0.7fr_0.6fr]"><div><div className="text-lg font-semibold text-white">{product.title}</div><div className="mt-2 text-sm text-zinc-400">Status: {product.status} · Shipping {product.shippingWindow.processingBusinessDays}</div></div><div className="text-sm text-zinc-300">Retail {product.price.toFixed(2)}{margin ? ` · Landed ${margin.landedCost.toFixed(2)}` : ''}</div><div className="text-sm text-lime-300">{margin ? `${margin.marginPercent.toFixed(1)}% margin` : 'No supplier record'}</div></article>; })}</div></div></div>;
}
