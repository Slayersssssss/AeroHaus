import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-baseline gap-1 text-xl font-black uppercase tracking-[0.34em] sm:text-2xl", className)} aria-label="AeroHaus home">
      <span className="text-white">AERO</span>
      <span className="text-lime-300">HAUS</span>
    </Link>
  );
}
