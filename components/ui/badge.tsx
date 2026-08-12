import { cn } from "@/lib/utils";

export function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "accent" | "muted"; }) {
  return (
    <span className={cn(
      "inline-flex items-center border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]",
      tone === "accent" && "border-lime-300/60 bg-lime-300/15 text-lime-200",
      tone === "muted" && "border-white/10 bg-white/5 text-zinc-300",
      tone === "default" && "border-white/10 bg-black/50 text-white"
    )}>
      {children}
    </span>
  );
}
