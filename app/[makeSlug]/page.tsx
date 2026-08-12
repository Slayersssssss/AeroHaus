import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { ProductCard } from "@/components/product-card";
import { getBrandBySlug, vehicleGenerations } from "@/lib/store";
import { getStorefrontProductsForBrand } from "@/lib/storefront-server";

const staticSlugs = new Set(['about','contact','shipping-policy','returns','refund-policy','privacy-policy','terms','fitment-help','faq','order-tracking','track-order','wholesale','search','account','admin','shop','products','builds','checkout','auth']);

export default async function BrandPage(props: { params: Promise<{ makeSlug: string }> }) {
  const { makeSlug } = await props.params;
  if (staticSlugs.has(makeSlug)) notFound();
  const brand = getBrandBySlug(makeSlug);
  if (!brand) notFound();
  const brandProducts = await getStorefrontProductsForBrand(brand.slug);
  const generations = vehicleGenerations.filter((generation) => generation.makeSlug === brand.slug);
  return <div><PageHero eyebrow={brand.name} title={`${brand.name} Platforms`} description={brand.description} image={brand.heroImage} /><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="mb-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{generations.map((generation) => <a key={generation.slug} href={`/${brand.slug}/${generation.slug}`} className="border border-white/10 bg-zinc-950/80 px-5 py-6 text-white transition hover:border-lime-300/30"><div className="text-xs uppercase tracking-[0.22em] text-lime-300">{generation.modelName}</div><div className="mt-2 text-2xl font-black uppercase tracking-[0.12em]">{generation.name}</div></a>)}</div><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{brandProducts.map((product) => <ProductCard key={product.slug} product={product} />)}</div></div></div>;
}
