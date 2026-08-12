import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { ProductCard } from "@/components/product-card";
import { PageHero } from "@/components/page-hero";
import { breadcrumbsJsonLd, createMetadata, productJsonLd } from "@/lib/seo";
import { getProductBySlug, getRelatedProducts } from "@/lib/store";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);
  if (!product) return createMetadata({ title: 'Product Not Found' });
  return createMetadata({ title: product.title, description: product.shortDescription });
}

export default async function ProductPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const related = getRelatedProducts(product);

  return (
    <div>
      <PageHero eyebrow={product.brandName} title={product.title} description={product.compatibilitySummary} image={product.gallery[0]} />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <ProductGallery images={product.gallery} title={product.title} />
        <ProductPurchasePanel product={product} />
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {[{ title: 'Description', body: product.description }, { title: 'Fitment', body: product.fitments.map((fitment) => fitment.notes).join(' ') }, { title: "What's Included", body: product.whatsIncluded.join(', ') }, { title: 'Installation', body: product.installation }, { title: 'Shipping', body: `Ships from one of our fulfillment facilities. Processing time: ${product.shippingWindow.processingBusinessDays}. Estimated delivery: ${product.shippingWindow.deliveryBusinessDays}.` }, { title: 'Returns', body: 'Returns are subject to approval based on condition, order status, and product type. Custom-order and installed items may be non-returnable.' }, { title: 'FAQ', body: product.faq.map((item) => `${item.question} ${item.answer}`).join(' ') }].map((section) => <details key={section.title} className="border border-white/10 bg-zinc-950/80 p-6" open={section.title === 'Description'}><summary className="cursor-pointer text-xl font-semibold uppercase tracking-[0.1em] text-white">{section.title}</summary><p className="mt-4 text-sm leading-7 text-zinc-400">{section.body}</p></details>)}
        </div>
        <div className="mt-16"><div className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.28em] text-lime-300">Related Products</p><h2 className="mt-2 text-3xl font-black uppercase tracking-[0.12em] text-white">Pair It With</h2></div><Badge tone="muted">Complete the Build</Badge></div><div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{related.map((item) => <ProductCard key={item.slug} product={item} />)}</div></div>
      </div>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }} />
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd([{ name: 'Home', item: '/' }, { name: 'Shop', item: '/shop' }, { name: product.title, item: `/products/${product.slug}` }])) }} />
    </div>
  );
}
