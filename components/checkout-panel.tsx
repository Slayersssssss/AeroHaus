"use client";

import { useState } from "react";
import { ArrowRight, CreditCard, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStorefront } from "@/components/providers";
import { getProductBySlug } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export function CheckoutPanel() {
  const { cartItems, subtotal } = useStorefront();
  const [loading, setLoading] = useState(false);

  const beginCheckout = async () => {
    setLoading(true);
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItems }),
    });
    const payload = await response.json();
    setLoading(false);
    if (payload.url) {
      window.location.href = payload.url;
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="border border-white/10 bg-zinc-950/80 p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Checkout</p>
        <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.12em] text-white">Secure Stripe Checkout</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">Collect shipping, billing, phone and payment details through Stripe Checkout or extend this panel to Stripe Elements later. Orders are designed to be created in Supabase after payment confirmation.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[{ icon: ShieldCheck, label: 'Encrypted payments' }, { icon: Truck, label: 'Shipping options captured' }, { icon: CreditCard, label: 'Stripe-ready session flow' }].map((item) => <article key={item.label} className="border border-white/10 bg-black/20 p-5"><item.icon className="h-5 w-5 text-lime-300" /><div className="mt-3 text-sm font-semibold text-white">{item.label}</div></article>)}
        </div>
      </section>
      <aside className="border border-white/10 bg-zinc-950/80 p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Order Summary</p>
        <div className="mt-6 space-y-4">
          {cartItems.length > 0 ? cartItems.map((line) => {
            const product = getProductBySlug(line.productSlug);
            const variant = product?.variants.find((item) => item.id === line.variantId);
            if (!product || !variant) return null;
            return <div key={line.id} className="border border-white/10 p-4"><div className="text-sm font-semibold text-white">{product.title}</div><div className="mt-2 text-xs uppercase tracking-[0.22em] text-zinc-500">{variant.optionLabel} · Qty {line.quantity}</div><div className="mt-3 text-sm text-zinc-300">{formatCurrency(variant.price * line.quantity)}</div></div>;
          }) : <div className="border border-white/10 p-4 text-sm text-zinc-400">Add parts to your cart before starting checkout.</div>}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-zinc-300"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
        <Button className="mt-6 w-full" onClick={beginCheckout} disabled={loading || cartItems.length === 0}>{loading ? 'Redirecting...' : 'Proceed to Checkout'} <ArrowRight className="h-4 w-4" /></Button>
      </aside>
    </div>
  );
}
