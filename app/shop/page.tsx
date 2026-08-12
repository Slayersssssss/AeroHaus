import { PageHero } from "@/components/page-hero";
import { ProductCard } from "@/components/product-card";
import { Select } from "@/components/ui/select";
import { brands, filterProductList, vehicleGenerations } from "@/lib/store";
import { getStorefrontProducts } from "@/lib/storefront-server";

export default async function ShopPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams;
  const liveProducts = await getStorefrontProducts();
  const params = {
    brand: typeof searchParams.brand === 'string' ? searchParams.brand : undefined,
    category: typeof searchParams.category === 'string' ? searchParams.category : undefined,
    generation: typeof searchParams.generation === 'string' ? searchParams.generation : undefined,
    badge: typeof searchParams.badge === 'string' ? searchParams.badge : undefined,
    material: typeof searchParams.material === 'string' ? searchParams.material : undefined,
    availability: typeof searchParams.availability === 'string' ? searchParams.availability : undefined,
    search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
    sort: typeof searchParams.sort === 'string' ? searchParams.sort : undefined,
  };
  const filtered = filterProductList(liveProducts, params);
  const materials = Array.from(new Set(liveProducts.flatMap((product) => product.materialOptions)));

  return (
    <div>
      <PageHero eyebrow="Catalog" title="Shop Aero & Styling" description="Filter by platform, category, material, merchandising badges and chassis generation to move quickly through the AeroHaus catalog." image="/assets/page-shop.svg" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[300px_1fr] lg:px-8">
        <aside className="border border-white/10 bg-zinc-950/80 p-6 h-fit lg:sticky lg:top-28">
          <form className="grid gap-4">
            <input name="search" defaultValue={params.search} placeholder="Search G80, M340i, carbon lip..." className="h-12 border border-white/10 bg-black/30 px-4 text-sm text-white" />
            <Select name="brand" defaultValue={params.brand}><option value="">Brand</option>{brands.map((brand) => <option key={brand.slug} value={brand.slug}>{brand.name}</option>)}</Select>
            <Select name="generation" defaultValue={params.generation}><option value="">Vehicle</option>{vehicleGenerations.map((generation) => <option key={generation.slug} value={generation.slug}>{generation.modelName} · {generation.name}</option>)}</Select>
            <Select name="category" defaultValue={params.category}><option value="">Category</option>{Array.from(new Set(liveProducts.map((product) => product.categorySlug))).map((category) => <option key={category} value={category}>{category}</option>)}</Select>
            <Select name="material" defaultValue={params.material}><option value="">Material</option>{materials.map((material) => <option key={material} value={material}>{material}</option>)}</Select>
            <Select name="availability" defaultValue={params.availability}><option value="">Availability</option><option value="in-stock">In Stock</option></Select>
            <Select name="badge" defaultValue={params.badge}><option value="">Badge</option><option value="best seller">Best Seller</option><option value="new">New</option><option value="sale">Sale</option><option value="preorder">Preorder</option></Select>
            <Select name="sort" defaultValue={params.sort}><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-asc">Price Low to High</option><option value="price-desc">Price High to Low</option><option value="best-selling">Best Selling</option></Select>
            <button className="h-12 border border-lime-300 bg-lime-300 text-sm font-semibold uppercase tracking-[0.22em] text-black">Apply Filters</button>
          </form>
        </aside>
        <section>
          <div className="mb-6 flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.28em] text-lime-300">Results</p><h2 className="mt-2 text-3xl font-black uppercase tracking-[0.12em] text-white">{filtered.length} Products</h2></div><div className="text-sm text-zinc-500">Grid view · Infinite loading ready</div></div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{filtered.map((product) => <ProductCard key={product.slug} product={product} />)}</div>
        </section>
      </div>
    </div>
  );
}
