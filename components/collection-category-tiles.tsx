import type { Route } from "next";
import Link from "next/link";

const preferredCategoryOrder = [
  "front-lips",
  "rear-diffusers",
  "spoilers",
  "side-skirts",
  "carbon-fiber",
  "grilles",
];

export function CollectionCategoryTiles({
  basePath,
  categories,
}: {
  basePath: string;
  categories: { slug: string; name: string }[];
}) {
  const sorted = [...categories].sort(
    (a, b) =>
      preferredCategoryOrder.indexOf(a.slug) - preferredCategoryOrder.indexOf(b.slug)
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {sorted.map((category) => (
        <Link
          key={category.slug}
          href={`${basePath}?category=${category.slug}` as Route}
          className="group border border-white/10 bg-zinc-950/70 px-5 py-6 transition hover:border-lime-300/30 hover:bg-zinc-950"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Category</p>
          <h3 className="mt-3 text-lg font-semibold uppercase tracking-[0.1em] text-white group-hover:text-lime-300">
            {category.name}
          </h3>
        </Link>
      ))}
    </div>
  );
}
