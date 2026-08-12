import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { ReviewList } from "@/components/review-list";
import { SectionHeading } from "@/components/section-heading";
import { VehicleFinder } from "@/components/vehicle-finder";
import { builds, brands, featuredReviews, products } from "@/lib/store";

const categories = ["Carbon Fiber", "Front Lips", "Diffusers", "Spoilers", "Side Skirts", "Grilles", "Lighting", "Interior", "Wheels", "Suspension"];

export default function Home() {
  const bestSellers = products.filter((product) => product.bestSeller).slice(0, 4);
  const featuredBuild = builds[0];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image src="/assets/hero-home.svg" alt="AeroHaus hero backdrop" fill priority className="object-cover opacity-60" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/50" />
        </div>
        <div className="relative mx-auto grid min-h-[78vh] max-w-7xl items-end gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8 lg:py-24">
          <div>
            <Badge tone="accent">European Automotive Styling</Badge>
            <h1 className="mt-6 text-6xl font-black uppercase leading-[0.88] tracking-[0.12em] text-white sm:text-7xl xl:text-[7rem]">BUILT TO<br />STAND APART.</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">Premium aero, carbon fiber and styling upgrades for European performance vehicles.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/shop"><Button>Shop Aero</Button></Link><Link href="#vehicle-finder"><Button variant="secondary">Shop by Vehicle</Button></Link></div>
          </div>
          <aside className="border border-white/10 bg-black/50 p-6 backdrop-blur"><p className="text-xs uppercase tracking-[0.28em] text-lime-300">Featured Drop</p><h2 className="mt-3 text-3xl font-black uppercase tracking-[0.12em] text-white">G8X Carbon Aero Collection</h2><p className="mt-4 text-sm leading-7 text-zinc-400">Purposeful exterior components curated for the latest M3 and M4 chassis.</p><Link href="/shop?brand=bmw&search=G8X" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-white transition hover:text-lime-300">Explore <ArrowRight className="h-4 w-4" /></Link></aside>
        </div>
      </section>

      <section id="vehicle-finder" className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8"><VehicleFinder /></section>

      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Platforms" title="Shop by Brand" description="Large-format platform entry points built around the initial BMW, Mercedes-Benz, Audi, and Porsche catalog." />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{brands.map((brand) => <Link key={brand.slug} href={`/${brand.slug}`} className="group relative min-h-[320px] overflow-hidden border border-white/10"><Image src={brand.heroImage} alt={brand.name} fill className="object-cover transition duration-500 group-hover:scale-[1.04]" sizes="(max-width: 1280px) 50vw, 25vw" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6"><p className="text-xs uppercase tracking-[0.28em] text-lime-300">{brand.tagline}</p><h3 className="mt-3 text-4xl font-black uppercase tracking-[0.12em] text-white">{brand.name}</h3></div></Link>)}</div>
      </section>

      <section className="border-y border-white/10 bg-zinc-950/60"><div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8"><SectionHeading eyebrow="Categories" title="Shop by Category" description="A modular catalog designed for styling-heavy browsing, fitment-led discovery, and quick adds." /><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{categories.map((category) => <Link key={category} href={`/shop?search=${encodeURIComponent(category)}`} className="group border border-white/10 bg-black/30 px-5 py-7 transition hover:border-lime-300/30 hover:bg-black/50"><div className="text-lg font-semibold uppercase tracking-[0.1em] text-white group-hover:text-lime-300">{category}</div></Link>)}</div></div></section>

      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8"><SectionHeading eyebrow="Best Sellers" title="High-Conversion Aero & Chassis Picks" description="Product cards include compatibility, merchandising badges, price anchors, ratings, wishlist and quick-add behavior." /><div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">{bestSellers.map((product) => <ProductCard key={product.slug} product={product} />)}</div></section>

      <section className="border-y border-white/10 bg-zinc-950/60"><div className="mx-auto grid max-w-7xl gap-8 px-4 py-18 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8"><div className="relative min-h-[420px] overflow-hidden border border-white/10"><Image src={featuredBuild.heroImage} alt={featuredBuild.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" /></div><div className="flex flex-col justify-center"><Badge tone="accent">Featured Build</Badge><h2 className="mt-6 text-5xl font-black uppercase tracking-[0.12em] text-white">{featuredBuild.title}</h2><p className="mt-5 text-sm uppercase tracking-[0.24em] text-zinc-500">{featuredBuild.vehicleLabel}</p><p className="mt-5 max-w-xl text-base leading-8 text-zinc-400">{featuredBuild.description}</p><Link href={`/builds/${featuredBuild.slug}`} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-white transition hover:text-lime-300">Shop the Build <ArrowRight className="h-4 w-4" /></Link></div></div></section>

      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8"><SectionHeading eyebrow="Why AeroHaus" title="Built for Trust, Not Template Energy" /><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[{ icon: ShieldCheck, title: 'Fitment Support', copy: 'We help confirm compatibility before your order.' }, { icon: Truck, title: 'Tracked Shipping', copy: 'Track your order from dispatch to delivery.' }, { icon: Check, title: 'Curated Parts', copy: 'Products selected for styling, quality and fitment.' }, { icon: Star, title: 'Secure Checkout', copy: 'Protected payments and encrypted checkout.' }].map((item) => <article key={item.title} className="border border-white/10 bg-zinc-950/80 p-6"><item.icon className="h-5 w-5 text-lime-300" /><h3 className="mt-5 text-xl font-semibold uppercase tracking-[0.1em] text-white">{item.title}</h3><p className="mt-3 text-sm leading-7 text-zinc-400">{item.copy}</p></article>)}</div></section>

      <section className="border-y border-white/10 bg-zinc-950/60"><div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8"><SectionHeading eyebrow="Customer Reviews" title="Development Placeholder Reviews" description="The review system is wired for real approved reviews later. These samples are clearly marked as demo data during development." /><div className="mt-8"><ReviewList reviews={featuredReviews} /></div></div></section>

      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8"><SectionHeading eyebrow="@AEROHAUS" title="Social & Build Inspiration" /><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{['social-feed-1.svg','social-feed-2.svg','social-feed-3.svg','social-feed-4.svg'].map((asset) => <div key={asset} className="relative aspect-square overflow-hidden border border-white/10"><Image src={`/assets/${asset}`} alt="AeroHaus social placeholder" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" /></div>)}</div></section>

      <section className="border-t border-white/10"><div className="mx-auto max-w-7xl px-4 py-18 text-center sm:px-6 lg:px-8"><Badge tone="accent">Join the Drop List</Badge><h2 className="mt-6 text-4xl font-black uppercase tracking-[0.12em] text-white">New releases. Exclusive drops. Build inspiration.</h2><div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"><input className="h-12 flex-1 border border-white/10 bg-zinc-950 px-4 text-sm text-white" placeholder="Email address" /><Button className="sm:min-w-44">Join</Button></div></div></section>
    </div>
  );
}
