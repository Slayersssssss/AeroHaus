"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStorefront } from "@/components/providers";
import { getProductBySlug, getVehicleRecordByKey, products } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const { cartOpen, closeCart, cartItems, updateQuantity, removeFromCart, subtotal } = useStorefront();
  if (!cartOpen) return null;
  const suggestions = products.slice(0, 3);
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-xl flex-col border-l border-white/10 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-300">Cart</p><h2 className="mt-1 text-xl font-black uppercase tracking-[0.12em] text-white">Build Summary</h2></div><button type="button" onClick={closeCart} className="text-zinc-400 transition hover:text-white" aria-label="Close cart"><X className="h-5 w-5" /></button></div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {cartItems.length === 0 ? <div className="border border-white/10 bg-black/20 p-6 text-sm text-zinc-400">Your cart is empty. Add premium aero and build out your garage.</div> : cartItems.map((line) => {
            const product = getProductBySlug(line.productSlug);
            const variant = product?.variants.find((item) => item.id === line.variantId);
            const vehicle = getVehicleRecordByKey(line.vehicleKey);
            if (!product || !variant) return null;
            return <article key={line.id} className="grid grid-cols-[96px_1fr] gap-4 border border-white/10 p-4"><div className="relative aspect-square overflow-hidden border border-white/10 bg-black/20"><Image src={product.gallery[0]} alt={product.title} fill className="object-cover" sizes="96px" /></div><div><div className="flex items-start justify-between gap-4"><div><Link href={`/products/${product.slug}`} className="text-sm font-semibold text-white">{product.title}</Link><div className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-500">{variant.optionLabel}</div>{vehicle ? <div className="mt-2 text-xs text-zinc-400">Vehicle: {vehicle.label}</div> : null}</div><button type="button" className="text-xs uppercase tracking-[0.22em] text-zinc-500 hover:text-white" onClick={() => removeFromCart(line.id)}>Remove</button></div><div className="mt-4 flex items-center justify-between gap-4"><div className="inline-flex items-center border border-white/10"><button type="button" className="px-3 py-2 text-zinc-300" onClick={() => updateQuantity(line.id, line.quantity - 1)}><Minus className="h-4 w-4" /></button><span className="min-w-10 text-center text-sm text-white">{line.quantity}</span><button type="button" className="px-3 py-2 text-zinc-300" onClick={() => updateQuantity(line.id, line.quantity + 1)}><Plus className="h-4 w-4" /></button></div><div className="text-sm font-semibold text-white">{formatCurrency(variant.price * line.quantity)}</div></div></div></article>;
          })}
          <div className="border border-white/10 bg-black/20 p-5"><div className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-lime-300">You may also like</div><div className="grid gap-4">{suggestions.map((product) => <Link key={product.slug} href={`/products/${product.slug}`} onClick={closeCart} className="flex items-center justify-between text-sm text-zinc-300 transition hover:text-white"><span>{product.title}</span><span>{formatCurrency(product.price)}</span></Link>)}</div></div>
        </div>
        <div className="border-t border-white/10 px-5 py-5"><div className="flex items-center justify-between text-sm text-zinc-400"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div><div className="mt-2 flex items-center justify-between text-sm text-zinc-400"><span>Estimated shipping</span><span>Calculated at checkout</span></div><Link href="/checkout" onClick={closeCart}><Button className="mt-4 w-full">Checkout</Button></Link></div>
      </div>
    </div>
  );
}
