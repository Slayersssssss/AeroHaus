import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { ProductCard } from "@/components/product-card";
import { getBrandBySlug, getGenerationBySlug, getProductsForGeneration } from "@/lib/store";

export default async function GenerationPage(props: { params: Promise<{ makeSlug: string; generationSlug: string }> }) {
  const { makeSlug, generationSlug } = await props.params;
  const brand = getBrandBySlug(makeSlug);
  const generation = getGenerationBySlug(generationSlug);
  if (!brand || !generation || generation.makeSlug !== brand.slug) notFound();
  const generationProducts = getProductsForGeneration(generation.slug);
  return <div><PageHero eyebrow={brand.name} title={`${generation.modelName} ${generation.name}`} description={`Platform-specific AeroHaus catalog for ${generation.years[0]}-${generation.years[generation.years.length - 1]} ${brand.name} ${generation.modelName}.`} image={brand.heroImage} /><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="mb-8 border border-white/10 bg-zinc-950/80 p-6 text-sm leading-7 text-zinc-400">Chassis: {generation.chassisLabel} · Supported years: {generation.years[0]}-{generation.years[generation.years.length - 1]} · Trims: {generation.trims.join(', ')}.</div><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{generationProducts.map((product) => <ProductCard key={product.slug} product={product} />)}</div></div></div>;
}
