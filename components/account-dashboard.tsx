"use client";

import Link from "next/link";
import { Heart, MapPin, Package, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStorefront } from "@/components/providers";
import { getProductBySlug } from "@/lib/store";

export function AccountDashboard() {
  const { savedVehicleKeys, selectedVehicle, wishlist, cartItems } = useStorefront();
  return (
    <div className="grid gap-6"><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[{ label: "Saved Vehicles", value: String(savedVehicleKeys.length), icon: ShieldCheck }, { label: "Wishlist Items", value: String(wishlist.length), icon: Heart }, { label: "Cart Items", value: String(cartItems.length), icon: Package }, { label: "Default Vehicle", value: selectedVehicle ? selectedVehicle.chassisLabel : "None", icon: MapPin }].map((item) => <article key={item.label} className="border border-white/10 bg-zinc-950/80 p-5"><item.icon className="h-5 w-5 text-lime-300" /><div className="mt-4 text-2xl font-black uppercase tracking-[0.12em] text-white">{item.value}</div><div className="mt-2 text-xs uppercase tracking-[0.24em] text-zinc-500">{item.label}</div></article>)}</section><section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"><article className="border border-white/10 bg-zinc-950/80 p-6"><div className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.28em] text-lime-300">My Garage</p><h2 className="mt-2 text-2xl font-black uppercase tracking-[0.12em] text-white">Saved Vehicles</h2></div><Link href="/shop"><Button variant="secondary">Shop Parts</Button></Link></div><div className="mt-5 space-y-3">{savedVehicleKeys.length > 0 ? savedVehicleKeys.map((vehicleKey) => <div key={vehicleKey} className="border border-white/10 px-4 py-4 text-sm text-zinc-300">{vehicleKey}</div>) : <div className="border border-white/10 px-4 py-4 text-sm text-zinc-400">Save vehicles through the homepage finder to personalize fitment.</div>}</div></article><article className="border border-white/10 bg-zinc-950/80 p-6"><p className="text-xs uppercase tracking-[0.28em] text-lime-300">Wishlist</p><h2 className="mt-2 text-2xl font-black uppercase tracking-[0.12em] text-white">Saved Parts</h2><div className="mt-5 space-y-3">{wishlist.length > 0 ? wishlist.map((slug) => { const product = getProductBySlug(slug); if (!product) return null; return <Link key={slug} href={`/products/${slug}`} className="block border border-white/10 px-4 py-4 text-sm text-zinc-300 transition hover:border-lime-300/30 hover:text-white">{product.title}</Link>; }) : <div className="border border-white/10 px-4 py-4 text-sm text-zinc-400">Use the heart icon on products to build a saved parts list.</div>}</div></article></section></div>
  );
}
