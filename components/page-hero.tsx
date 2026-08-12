import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export function PageHero({ eyebrow, title, description, image }: { eyebrow: string; title: string; description: string; image: string; }) {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0">
        <Image src={image} alt="" fill className="object-cover opacity-50" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black" />
      </div>
      <div className="relative mx-auto flex min-h-[340px] max-w-7xl items-end px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Badge tone="accent">{eyebrow}</Badge>
          <h1 className="mt-6 text-4xl font-black uppercase tracking-[0.14em] text-white sm:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">{description}</p>
        </div>
      </div>
    </section>
  );
}
