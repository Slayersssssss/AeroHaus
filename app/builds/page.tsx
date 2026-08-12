import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { builds } from "@/lib/store";

export default function BuildsPage() {
  return (
    <div>
      <PageHero eyebrow="Builds" title="Shop the Build" description="Editorial landing pages that merchandise complete packages and make multi-part orders feel premium, intentional, and easy to buy." image="/assets/page-builds.svg" />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">{builds.map((build) => <Link key={build.slug} href={`/builds/${build.slug}`} className="group overflow-hidden border border-white/10 bg-zinc-950/80"><div className="relative aspect-[16/9]"><Image src={build.heroImage} alt={build.title} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" sizes="(max-width: 1024px) 100vw, 50vw" /></div><div className="p-6"><p className="text-xs uppercase tracking-[0.28em] text-lime-300">{build.vehicleLabel}</p><h2 className="mt-3 text-3xl font-black uppercase tracking-[0.12em] text-white">{build.title}</h2><p className="mt-4 text-sm leading-7 text-zinc-400">{build.description}</p></div></Link>)}</div>
    </div>
  );
}
