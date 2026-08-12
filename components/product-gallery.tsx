"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(images[0]);
  return (
    <div className="grid gap-4 lg:grid-cols-[96px_minmax(0,1fr)]">
      <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">{images.map((image) => <button key={image} type="button" className={`relative h-24 min-w-24 border ${active === image ? "border-lime-300" : "border-white/10"}`} onClick={() => setActive(image)}><Image src={image} alt="" fill className="object-cover" sizes="96px" /></button>)}</div>
      <div className="order-1 overflow-hidden border border-white/10 bg-zinc-950 lg:order-2"><div className="group relative aspect-square"><Image src={active} alt={title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition duration-500 group-hover:scale-[1.04]" priority /></div></div>
    </div>
  );
}
