import { Filter } from "lucide-react";

type FilterValue = { label: string; value: string };

type CollectionToolbarProps = {
  count: number;
  currentPath: string;
  categoryOptions: FilterValue[];
  materialOptions: FilterValue[];
  yearOptions: FilterValue[];
  trimOptions: FilterValue[];
  selected: {
    category?: string;
    material?: string;
    year?: string;
    trim?: string;
    price?: string;
    sort?: string;
  };
};

function FilterControls({
  categoryOptions,
  materialOptions,
  yearOptions,
  trimOptions,
  selected,
}: Omit<CollectionToolbarProps, "count" | "currentPath">) {
  return (
    <>
      <select name="category" defaultValue={selected.category ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-sm text-white">
        <option value="">Category</option>
        {categoryOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select name="material" defaultValue={selected.material ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-sm text-white">
        <option value="">Material</option>
        {materialOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select name="year" defaultValue={selected.year ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-sm text-white">
        <option value="">Year</option>
        {yearOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select name="trim" defaultValue={selected.trim ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-sm text-white">
        <option value="">Trim</option>
        {trimOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select name="price" defaultValue={selected.price ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-sm text-white">
        <option value="">Price</option>
        <option value="0-500">Under $500</option>
        <option value="500-1000">$500 - $1,000</option>
        <option value="1000-2000">$1,000 - $2,000</option>
        <option value="2000+">$2,000+</option>
      </select>
      <select name="sort" defaultValue={selected.sort ?? "featured"} className="h-11 border border-white/10 bg-black/30 px-3 text-sm text-white">
        <option value="featured">Featured</option>
        <option value="newest">Newest</option>
        <option value="price-asc">Price Low to High</option>
        <option value="price-desc">Price High to Low</option>
        <option value="best-selling">Best Selling</option>
      </select>
      <button className="h-11 border border-lime-300 bg-lime-300 px-4 text-sm font-semibold uppercase tracking-[0.22em] text-black">
        Apply
      </button>
    </>
  );
}

export function CollectionToolbar(props: CollectionToolbarProps) {
  const { count, currentPath } = props;

  return (
    <div id="collection-filters" className="sticky top-[76px] z-20 border-y border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Collection</p>
              <div className="mt-1 text-sm text-zinc-300">{count} products</div>
            </div>
            <details className="lg:hidden">
              <summary className="inline-flex cursor-pointer items-center gap-2 border border-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white">
                <Filter className="h-4 w-4" /> Mobile Filters
              </summary>
              <form action={currentPath} className="mt-3 grid gap-3 border border-white/10 bg-zinc-950/90 p-4">
                <FilterControls {...props} />
              </form>
            </details>
          </div>
          <form action={currentPath} className="hidden grid-cols-7 gap-3 lg:grid">
            <FilterControls {...props} />
          </form>
        </div>
      </div>
    </div>
  );
}
