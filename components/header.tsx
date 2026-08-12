"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { navigationLinks } from "@/lib/constants";
import { brands } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { CartDrawer } from "@/components/cart-drawer";
import { SearchOverlay } from "@/components/search-overlay";
import { useStorefront } from "@/components/providers";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const { cartItems, openCart } = useStorefront();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/85 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8"><div className="flex items-center gap-8"><button type="button" className="text-white lg:hidden" aria-label="Toggle menu" onClick={() => setMobileOpen((current) => !current)}>{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button><Logo /></div><nav className="hidden items-center gap-6 lg:flex">{navigationLinks.map((link) => { const matchingBrand = brands.find((brand) => brand.name === link.label); return <div key={link.href} className="relative" onMouseEnter={() => setActiveMegaMenu(matchingBrand?.slug ?? null)} onMouseLeave={() => setActiveMegaMenu(null)}><Link href={link.href} className="group relative inline-flex items-center text-sm font-semibold uppercase tracking-[0.22em] text-zinc-300 transition hover:text-white"><span>{link.label}</span><span className="absolute -bottom-2 left-0 h-px w-0 bg-lime-300 transition-all duration-200 group-hover:w-full" /></Link>{matchingBrand && activeMegaMenu === matchingBrand.slug ? <div className="absolute left-0 top-full pt-4"><div className="min-w-[780px] border border-white/10 bg-zinc-950 p-8 shadow-2xl"><div className="grid grid-cols-[220px_repeat(4,minmax(0,1fr))] gap-6"><div><p className="text-xs uppercase tracking-[0.28em] text-lime-300">{matchingBrand.name}</p><p className="mt-4 text-sm leading-7 text-zinc-400">{matchingBrand.description}</p><Link href={`/${matchingBrand.slug}`} className="mt-5 inline-flex text-sm font-semibold uppercase tracking-[0.22em] text-white hover:text-lime-300">Shop platform</Link></div>{matchingBrand.megaMenu.map((group) => <div key={group.label}><h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-white">{group.label}</h3><div className="mt-4 space-y-3">{group.items.map((item) => <Link key={item} href={`/shop?brand=${matchingBrand.slug}&search=${encodeURIComponent(item)}`} className="block text-sm text-zinc-400 transition hover:text-white">{item}</Link>)}</div></div>)}</div></div></div> : null}</div>; })}</nav><div className="flex items-center gap-2 sm:gap-3"><button type="button" aria-label="Search" className="p-2 text-zinc-300 transition hover:text-white" onClick={() => setSearchOpen(true)}><Search className="h-5 w-5" /></button><Link href="/account" className="p-2 text-zinc-300 transition hover:text-white" aria-label="Account"><User className="h-5 w-5" /></Link><Button variant="ghost" className="relative px-2" onClick={openCart}><ShoppingBag className="h-5 w-5" /><span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center bg-lime-300 px-1 text-[10px] font-black text-black">{cartItems.length}</span></Button></div></div>{mobileOpen ? <div className="border-t border-white/10 px-4 py-4 lg:hidden"><nav className="grid gap-2">{navigationLinks.map((link) => <Link key={link.href} href={link.href} className="border border-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-300" onClick={() => setMobileOpen(false)}>{link.label}</Link>)}</nav></div> : null}</header>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
    </>
  );
}
