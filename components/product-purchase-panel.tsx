"use client";

import { useMemo, useState } from "react";
import { Check, Heart, ShieldCheck, TriangleAlert, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useStorefront } from "@/components/providers";
import { evaluateFitment, vehicleRecords } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted, selectedVehicle, setSelectedVehicle } = useStorefront();
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const activeVariant = useMemo(() => product.variants.find((variant) => variant.id === variantId) ?? product.variants[0], [product.variants, variantId]);
  const fitment = evaluateFitment(product, selectedVehicle?.key);

  return (
    <div className="lg:sticky lg:top-28">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">{product.brandName}</p>
      <h1 className="mt-3 text-3xl font-black uppercase tracking-[0.1em] text-white sm:text-4xl">{product.title}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-400"><span>{product.rating.toFixed(1)} / 5 rating</span><span>{product.reviewCount} reviews</span><span>{activeVariant.inventory > 0 ? "In stock" : "Preorder"}</span></div>
      <div className="mt-5 flex items-end gap-3"><span className="text-3xl font-semibold text-white">{formatCurrency(activeVariant.price)}</span>{activeVariant.compareAtPrice ? <span className="text-base text-zinc-500 line-through">{formatCurrency(activeVariant.compareAtPrice)}</span> : null}</div>
      <p className="mt-4 text-sm leading-7 text-zinc-400">{product.shortDescription}</p>
      <div className="mt-8 grid gap-5">
        <div><label className="mb-2 block text-xs font-semibold uppercase tracking-[0.26em] text-zinc-500">Variant</label><Select value={variantId} onChange={(event) => setVariantId(event.target.value)}>{product.variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.optionLabel}</option>)}</Select></div>
        <div><label className="mb-2 block text-xs font-semibold uppercase tracking-[0.26em] text-zinc-500">Verify Fitment</label><Select value={selectedVehicle?.key ?? ""} onChange={(event) => setSelectedVehicle(event.target.value)}><option value="">Select your saved vehicle</option>{vehicleRecords.map((vehicle) => <option key={vehicle.key} value={vehicle.key}>{vehicle.label}</option>)}</Select><div className={`mt-3 border px-4 py-3 text-sm ${fitment === "exact" ? "border-lime-300/30 bg-lime-300/10 text-lime-100" : fitment === "partial" ? "border-amber-400/30 bg-amber-400/10 text-amber-100" : "border-white/10 bg-black/30 text-zinc-300"}`}>{fitment === "exact" ? <span className="flex items-center gap-2"><Check className="h-4 w-4" /> This product fits your vehicle.</span> : fitment === "partial" ? <span className="flex items-center gap-2"><TriangleAlert className="h-4 w-4" /> Fitment could not be fully automated. Contact AeroHaus Fitment Support.</span> : <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Choose a vehicle to verify compatibility before checkout.</span>}</div></div>
        <div><label className="mb-2 block text-xs font-semibold uppercase tracking-[0.26em] text-zinc-500">Quantity</label><Select value={String(quantity)} onChange={(event) => setQuantity(Number(event.target.value))}>{[1,2,3,4].map((value) => <option key={value} value={value}>{value}</option>)}</Select></div>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]"><Button className="w-full" onClick={() => addToCart({ productSlug: product.slug, variantId: activeVariant.id, quantity, vehicleKey: selectedVehicle?.key })}>Add to Cart</Button><Button variant="secondary" className="w-full" onClick={() => toggleWishlist(product.slug)}><Heart className={`h-4 w-4 ${isWishlisted(product.slug) ? "fill-lime-300 text-lime-300" : ""}`} />Wishlist</Button></div>
      <Button variant="outline" className="mt-3 w-full" onClick={() => addToCart({ productSlug: product.slug, variantId: activeVariant.id, quantity, vehicleKey: selectedVehicle?.key, openDrawer: true })}>Buy Now</Button>
      <div className="mt-8 grid gap-3 border border-white/10 bg-black/30 p-5 text-sm text-zinc-300"><div className="flex items-center gap-2"><Truck className="h-4 w-4 text-lime-300" /> Processing {product.shippingWindow.processingBusinessDays}</div><div className="flex items-center gap-2"><Truck className="h-4 w-4 text-lime-300" /> Delivery {product.shippingWindow.deliveryBusinessDays}</div><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-lime-300" /> Secure checkout via Stripe-ready architecture</div></div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/95 p-4 lg:hidden"><Button className="w-full" onClick={() => addToCart({ productSlug: product.slug, variantId: activeVariant.id, quantity, vehicleKey: selectedVehicle?.key, openDrawer: true })}>Add to Cart · {formatCurrency(activeVariant.price)}</Button></div>
    </div>
  );
}
