import { notFound } from "next/navigation";
import { CollectionCategoryTiles } from "@/components/collection-category-tiles";
import { CollectionGarageBar } from "@/components/collection-garage-bar";
import { CollectionHero } from "@/components/collection-hero";
import { CollectionToolbar } from "@/components/collection-toolbar";
import { ProductCard } from "@/components/product-card";
import { getBrandBySlug, getGenerationBySlug, trimMatches } from "@/lib/store";
import { getStorefrontProductsForGeneration } from "@/lib/storefront-server";

function filterCollectionProducts(
  products: Awaited<ReturnType<typeof getStorefrontProductsForGeneration>>,
  filters: {
    category?: string;
    material?: string;
    year?: string;
    trim?: string;
    price?: string;
    sort?: string;
  }
) {
  const filtered = products.filter((product) => {
    if (filters.category && product.categorySlug !== filters.category) return false;
    if (filters.material && !product.materialOptions.includes(filters.material)) return false;
    if (
      filters.year &&
      !product.fitments.some(
        (fitment) =>
          Number(filters.year) >= fitment.yearStart && Number(filters.year) <= fitment.yearEnd
      )
    )
      return false;
    if (
      filters.trim &&
      !product.fitments.some((fitment) =>
        fitment.trims.some((trim) => trimMatches(filters.trim!, trim))
      )
    )
      return false;
    if (filters.price) {
      if (filters.price === "0-500" && product.price >= 500) return false;
      if (filters.price === "500-1000" && (product.price < 500 || product.price > 1000)) return false;
      if (filters.price === "1000-2000" && (product.price < 1000 || product.price > 2000)) return false;
      if (filters.price === "2000+" && product.price < 2000) return false;
    }
    return true;
  });

  switch (filters.sort) {
    case "newest":
      return filtered.sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
    case "price-asc":
      return filtered.sort((a, b) => a.price - b.price);
    case "price-desc":
      return filtered.sort((a, b) => b.price - a.price);
    case "best-selling":
      return filtered.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller));
    default:
      return filtered.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

export default async function GenerationPage(props: { params: Promise<{ makeSlug: string; generationSlug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { makeSlug, generationSlug } = await props.params;
  const searchParams = await props.searchParams;
  const brand = getBrandBySlug(makeSlug);
  const generation = getGenerationBySlug(generationSlug);
  if (!brand || !generation || generation.makeSlug !== brand.slug) notFound();
  const generationProducts = await getStorefrontProductsForGeneration(generation.slug);
  const filters = {
    category: typeof searchParams.category === "string" ? searchParams.category : undefined,
    material: typeof searchParams.material === "string" ? searchParams.material : undefined,
    year: typeof searchParams.year === "string" ? searchParams.year : undefined,
    trim: typeof searchParams.trim === "string" ? searchParams.trim : undefined,
    price: typeof searchParams.price === "string" ? searchParams.price : undefined,
    sort: typeof searchParams.sort === "string" ? searchParams.sort : undefined,
  };
  const filteredProducts = filterCollectionProducts(generationProducts, filters);
  const categoryOptions = Array.from(
    new Map(
      generationProducts.map((product) => [
        product.categorySlug,
        { slug: product.categorySlug, name: product.categoryName },
      ])
    ).values()
  );
  const materialOptions = Array.from(
    new Set(generationProducts.flatMap((product) => product.materialOptions))
  ).map((material) => ({ label: material, value: material }));
  const yearOptions = generation.years.map((year) => ({ label: String(year), value: String(year) }));
  const trimOptions = generation.trims.map((trim) => ({ label: trim, value: trim }));
  const heroImage = generationProducts[0]?.gallery[0] ?? brand.heroImage;
  const yearsLabel = `${generation.years[0]}-${generation.years[generation.years.length - 1]}`;
  const currentPath = `/${brand.slug}/${generation.slug}`;

  return (
    <div>
      <CollectionHero
        manufacturer={brand.name}
        title={`${generation.modelName} ${generation.name}`}
        years={yearsLabel}
        description={`Premium aero, carbon fiber and chassis-specific styling parts for ${generation.modelName} ${generation.name}. Browse by category, refine by material or trim, and verify fitment against your saved garage.`}
        image={heroImage}
      />

      <CollectionToolbar
        count={filteredProducts.length}
        currentPath={currentPath}
        categoryOptions={categoryOptions.map((category) => ({ label: category.name, value: category.slug }))}
        materialOptions={materialOptions}
        yearOptions={yearOptions}
        trimOptions={trimOptions}
        selected={filters}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <CollectionGarageBar collectionGenerationSlug={generation.slug} />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <CollectionCategoryTiles basePath={currentPath} categories={categoryOptions} />
        </div>

        <div className="mb-8 border border-white/10 bg-zinc-950/80 p-6 text-sm leading-7 text-zinc-400">
          Chassis: {generation.chassisLabel} · Supported years: {yearsLabel} · Trims:{" "}
          {generation.trims.join(", ")}.
        </div>

        <div id="collection-products" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
