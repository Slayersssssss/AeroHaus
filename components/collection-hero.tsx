import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CollectionHero({
  manufacturer,
  title,
  years,
  description,
  image,
}: {
  manufacturer: string;
  title: string;
  years: string;
  description: string;
  image: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0">
        <Image src={image} alt="" fill className="object-cover opacity-60" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/55" />
      </div>
      <div className="relative mx-auto flex min-h-[420px] max-w-7xl items-end px-4 py-16 sm:min-h-[520px] sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Badge tone="accent">{manufacturer}</Badge>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.32em] text-zinc-400">
            {years}
          </p>
          <h1 className="mt-3 text-5xl font-black uppercase tracking-[0.12em] text-white sm:text-7xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#collection-products">
              <Button>Browse Products</Button>
            </Link>
            <Link href="#collection-filters">
              <Button variant="secondary">Refine Collection</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
