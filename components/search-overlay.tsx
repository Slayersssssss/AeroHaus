"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { searchProducts } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const results = searchProducts("").slice(0, 6);
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm">
      <div className="mx-auto mt-10 max-w-3xl border border-white/10 bg-zinc-950 p-5 shadow-2xl sm:mt-20 sm:p-8">
        <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.3em] text-lime-300">Search</p><h2 className="mt-2 text-2xl font-black uppercase tracking-[0.12em] text-white">Find by chassis, model or part</h2></div><button type="button" onClick={onClose} className="text-zinc-400 transition hover:text-white" aria-label="Close search"><X className="h-5 w-5" /></button></div>
        <div className="relative mt-6"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" /><Input placeholder="Search G80, M340i, carbon lip, W206 spoiler..." className="pl-11" /></div>
        <div className="mt-6 grid gap-3">{results.map((product) => <Link key={product.slug} href={`/products/${product.slug}`} onClick={onClose} className="flex items-center justify-between border border-white/10 px-4 py-4 transition hover:border-lime-300/40 hover:bg-white/5"><div><div className="text-sm font-semibold text-white">{product.title}</div><div className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-500">{product.compatibilitySummary}</div></div><div className="text-sm font-semibold text-lime-300">{formatCurrency(product.price)}</div></Link>)}</div>
      </div>
    </div>
  );
}
