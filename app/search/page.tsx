import { ProductCard } from "@/components/product-card";
import { PageHero } from "@/components/page-hero";
import { searchProducts } from "@/lib/store";

export default async function SearchPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  const results = searchProducts(query);
  return <div><PageHero eyebrow="Search" title="Site Search" description="Search G80, M340i, BMW, carbon lip, diffuser, spoiler and more." image="/assets/page-search.svg" /><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><form className="mb-8"><input name="q" defaultValue={query} className="h-12 w-full border border-white/10 bg-zinc-950 px-4 text-sm text-white" placeholder="Search products" /></form><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{results.map((product) => <ProductCard key={product.slug} product={product} />)}</div></div></div>;
}
