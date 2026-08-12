import Link from "next/link";
import { Camera, Music2, Play } from "lucide-react";
import { footerDisclaimer } from "@/lib/constants";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const columns = {
  Shop: [["BMW", "/bmw"], ["Mercedes-Benz", "/mercedes-benz"], ["Audi", "/audi"], ["Porsche", "/porsche"], ["New Arrivals", "/shop?badge=new"]],
  Company: [["About", "/about"], ["Contact", "/contact"], ["Wholesale", "/wholesale"]],
  Support: [["Shipping", "/shipping-policy"], ["Returns", "/returns"], ["Fitment Help", "/fitment-help"], ["Track Order", "/track-order"], ["FAQ", "/faq"]],
  Legal: [["Privacy", "/privacy-policy"], ["Terms", "/terms"], ["Refund Policy", "/refund-policy"]],
} as const;

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black"><div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_repeat(4,0.7fr)] lg:px-8"><div><Logo /><p className="mt-4 max-w-md text-sm leading-7 text-zinc-400">Premium aero, carbon fiber, lighting and chassis upgrades curated for European performance vehicles.</p><div className="mt-6 flex gap-3"><a href="https://instagram.com/aerohaus" className="inline-flex h-10 w-10 items-center justify-center border border-white/10 text-zinc-300 transition hover:border-lime-300 hover:text-lime-300" aria-label="Instagram"><Camera className="h-4 w-4" /></a><a href="https://tiktok.com/@aerohaus" className="inline-flex h-10 w-10 items-center justify-center border border-white/10 text-zinc-300 transition hover:border-lime-300 hover:text-lime-300" aria-label="TikTok"><Music2 className="h-4 w-4" /></a><a href="https://youtube.com/@aerohaus" className="inline-flex h-10 w-10 items-center justify-center border border-white/10 text-zinc-300 transition hover:border-lime-300 hover:text-lime-300" aria-label="YouTube"><Play className="h-4 w-4" /></a></div><div className="mt-8 flex max-w-md gap-3"><Input placeholder="Join the drop list" /><Button>Join</Button></div></div>{Object.entries(columns).map(([title, links]) => <div key={title}><h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-300">{title}</h3><div className="mt-5 grid gap-3 text-sm text-zinc-400">{links.map(([label, href]) => <Link key={href} href={href} className="transition hover:text-white">{label}</Link>)}</div></div>)}</div><div className="border-t border-white/10"><div className="mx-auto max-w-7xl px-4 py-6 text-xs leading-6 text-zinc-500 sm:px-6 lg:px-8">{footerDisclaimer}</div></div></footer>
  );
}
