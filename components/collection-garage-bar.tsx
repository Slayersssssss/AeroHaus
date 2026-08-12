"use client";

import { Badge } from "@/components/ui/badge";
import { useStorefront } from "@/components/providers";

export function CollectionGarageBar({
  collectionGenerationSlug,
}: {
  collectionGenerationSlug: string;
}) {
  const { selectedVehicle } = useStorefront();

  if (!selectedVehicle) {
    return (
      <div className="border border-white/10 bg-zinc-950/80 px-5 py-4 text-sm text-zinc-300">
        <span className="font-semibold uppercase tracking-[0.22em] text-lime-300">
          Your Garage
        </span>
        <div className="mt-2">Select your vehicle to verify fitment.</div>
      </div>
    );
  }

  const matchesCollection = selectedVehicle.generationSlug === collectionGenerationSlug;

  return (
    <div className="flex flex-col gap-3 border border-white/10 bg-zinc-950/80 px-5 py-4 text-sm text-zinc-300 md:flex-row md:items-center md:justify-between">
      <div>
        <span className="font-semibold uppercase tracking-[0.22em] text-lime-300">
          Your Garage
        </span>
        <div className="mt-2">
          {selectedVehicle.year} {selectedVehicle.makeName} {selectedVehicle.modelName}{" "}
          {selectedVehicle.chassisLabel} · {selectedVehicle.trim}
        </div>
      </div>
      <Badge tone={matchesCollection ? "accent" : "muted"}>
        {matchesCollection ? "Compatibility Verified" : "Selected Vehicle Differs"}
      </Badge>
    </div>
  );
}
