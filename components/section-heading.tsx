export function SectionHeading({ eyebrow, title, description, align = "left" }: { eyebrow?: string; title: string; description?: string; align?: "left" | "center"; }) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow ? <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-lime-300">{eyebrow}</p> : null}
      <h2 className="max-w-3xl text-3xl font-black uppercase tracking-[0.12em] text-white sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">{description}</p> : null}
    </div>
  );
}
