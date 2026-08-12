import { PageHero } from "@/components/page-hero";
import { getAuthContext } from "@/lib/supabase/auth";
import { AdminLockedState } from "@/components/admin-dashboard";
import { calculateSupplierMargin } from "@/lib/private-data";
import { AdminProductEditor } from "@/components/admin-product-editor";
import { getStorefrontProducts } from "@/lib/storefront-server";

export default async function AdminProductsPage() {
  const auth = await getAuthContext();
  if (!auth.user || auth.profile?.role !== 'admin') return <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><AdminLockedState /></div>;
  const products = await getStorefrontProducts();
  return <div><PageHero eyebrow="Admin Products" title="Catalog & Supplier Data" description="Manage retail pricing, fitment, media, variants, SEO-facing copy, and shipping windows directly against Supabase store data." image="/assets/page-admin-products.svg" /><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="mb-8 grid gap-4 md:grid-cols-3">{products.slice(0, 3).map((product) => { const margin = calculateSupplierMargin(product.slug, product.variants[0]?.id ?? ''); return <article key={product.slug} className="border border-white/10 bg-zinc-950/80 p-5"><div className="text-lg font-semibold text-white">{product.title}</div><div className="mt-2 text-sm text-zinc-400">Status: {product.status}</div><div className="mt-3 text-sm text-zinc-300">Retail {product.price.toFixed(2)}{margin ? ` · Landed ${margin.landedCost.toFixed(2)}` : ''}</div><div className="mt-2 text-sm text-lime-300">{margin ? `${margin.marginPercent.toFixed(1)}% margin` : 'No supplier record'}</div></article>; })}</div><AdminProductEditor products={products} /></div></div>;
}
