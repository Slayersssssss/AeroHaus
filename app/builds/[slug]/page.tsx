import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { getBuildBySlug, getProductBySlug } from "@/lib/store";

export default async function BuildPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const build = getBuildBySlug(slug);
  if (!build) notFound();
  const buildProducts = build.productSlugs.map((item) => getProductBySlug(item)).filter(Boolean);
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]"><div className="relative aspect-[5/4] overflow-hidden border border-white/10"><Image src={build.heroImage} alt={build.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" /></div><div className="flex flex-col justify-center"><p className="text-xs uppercase tracking-[0.28em] text-lime-300">{build.vehicleLabel}</p><h1 className="mt-3 text-5xl font-black uppercase tracking-[0.12em] text-white">{build.title}</h1><p className="mt-5 text-base leading-8 text-zinc-400">{build.description}</p><Button className="mt-8 w-fit">Add Featured Parts to Cart</Button></div></div>
      <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{buildProducts.map((product) => product ? <ProductCard key={product.slug} product={product} /> : null)}</div>
    </div>
  );
}
