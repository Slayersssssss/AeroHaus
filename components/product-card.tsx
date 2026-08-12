"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Heart, ShoppingBag, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStorefront } from "@/components/providers";
import { evaluateFitment } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted, selectedVehicle } = useStorefront();
  const defaultVariant = product.variants[0];
  const fitment = evaluateFitment(product, selectedVehicle?.key);

  return (
    <article className="group flex h-full flex-col border border-white/10 bg-zinc-950/80 transition hover:border-white/20 hover:bg-zinc-950">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/4.4] overflow-hidden border-b border-white/10">
        <Image src={product.gallery[0]} alt={product.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">{product.badges.map((badge) => <Badge key={badge} tone={badge === "SALE" || badge === "NEW" ? "accent" : "default"}>{badge}</Badge>)}</div>
        <button type="button" aria-label={`Toggle wishlist for ${product.title}`} className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center border border-white/10 bg-black/50 text-white transition hover:border-lime-300 hover:text-lime-300" onClick={() => toggleWishlist(product.slug)}>
          <Heart className={`h-4 w-4 ${isWishlisted(product.slug) ? "fill-lime-300 text-lime-300" : ""}`} />
        </button>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {fitment === "exact" ? (
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-lime-300">
            <CheckCircle2 className="h-4 w-4" /> Fits Your Vehicle
          </div>
        ) : null}
        <p className="text-xs uppercase tracking-[0.26em] text-zinc-500">{product.compatibilitySummary}</p>
        <Link href={`/products/${product.slug}`} className="mt-3 text-lg font-semibold text-white transition group-hover:text-lime-300">{product.title}</Link>
        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400"><div className="flex items-center gap-1 text-lime-300"><Star className="h-4 w-4 fill-current" /><span>{product.rating.toFixed(1)}</span></div><span>({product.reviewCount})</span></div>
        <div className="mt-4 flex items-end gap-2"><span className="text-xl font-semibold text-white">{formatCurrency(product.price)}</span>{product.compareAtPrice ? <span className="text-sm text-zinc-500 line-through">{formatCurrency(product.compareAtPrice)}</span> : null}</div>
        <div className="mt-5 flex gap-3"><Button className="flex-1" onClick={() => addToCart({ productSlug: product.slug, variantId: defaultVariant.id, quantity: 1 })}><ShoppingBag className="h-4 w-4" /> Quick Add</Button></div>
      </div>
    </article>
  );
}
