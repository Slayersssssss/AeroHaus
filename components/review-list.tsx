import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProductReview } from "@/lib/types";

export function ReviewList({ reviews }: { reviews: ProductReview[] }) {
  return <div className="grid gap-5 lg:grid-cols-3">{reviews.map((review) => <article key={review.id} className="border border-white/10 bg-zinc-950/80 p-6"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-1 text-lime-300">{Array.from({ length: review.rating }, (_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}</div><Badge tone="muted">Demo Data</Badge></div><h3 className="mt-4 text-lg font-semibold text-white">{review.title}</h3><p className="mt-3 text-sm leading-7 text-zinc-400">{review.review}</p><div className="mt-5 text-xs uppercase tracking-[0.22em] text-zinc-500">{review.customer} · {review.vehicle} · {review.date}</div></article>)}</div>;
}
