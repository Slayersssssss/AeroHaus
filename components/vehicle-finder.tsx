"use client";

import { useMemo, useState } from "react";
import { CarFront, Check, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useStorefront } from "@/components/providers";
import { brands, vehicleGenerations, vehicleRecords } from "@/lib/store";

export function VehicleFinder() {
  const { selectedVehicle, setSelectedVehicle, savedVehicleKeys } = useStorefront();
  const [year, setYear] = useState("");
  const [makeSlug, setMakeSlug] = useState("");
  const [modelSlug, setModelSlug] = useState("");
  const [generationSlug, setGenerationSlug] = useState("");

  const availableModels = useMemo(() => vehicleGenerations.filter((generation) => generation.makeSlug === makeSlug).reduce((accumulator, generation) => {
    if (!accumulator.some((model) => model.slug === generation.modelSlug)) accumulator.push({ slug: generation.modelSlug, name: generation.modelName });
    return accumulator;
  }, [] as { slug: string; name: string }[]), [makeSlug]);

  const availableGenerations = useMemo(() => vehicleGenerations.filter((generation) => generation.makeSlug === makeSlug && (!modelSlug || generation.modelSlug === modelSlug)), [makeSlug, modelSlug]);
  const availableYears = useMemo(() => generationSlug ? vehicleGenerations.find((generation) => generation.slug === generationSlug)?.years ?? [] : Array.from(new Set(vehicleGenerations.flatMap((generation) => generation.years))).sort((a, b) => b - a), [generationSlug]);
  const selectedGeneration = vehicleGenerations.find((generation) => generation.slug === generationSlug);

  const selectVehicle = () => {
    if (!year || !makeSlug || !modelSlug || !generationSlug || !selectedGeneration) return;
    const fallbackTrim = selectedGeneration.trims[0];
    const record = vehicleRecords.find((vehicle) => vehicle.year === Number(year) && vehicle.makeSlug === makeSlug && vehicle.modelSlug === modelSlug && vehicle.generationSlug === generationSlug && vehicle.trim === fallbackTrim);
    if (record) setSelectedVehicle(record.key);
  };

  return (
    <div className="border border-white/10 bg-zinc-950/80 p-6 sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-lime-300">Vehicle Finder</p>
          <h2 className="mt-4 text-3xl font-black uppercase tracking-[0.12em] text-white sm:text-4xl">FIND PARTS FOR YOUR CAR</h2>
        </div>
        {selectedVehicle ? <div className="border border-lime-300/20 bg-lime-300/8 px-4 py-3 text-sm text-zinc-200"><div className="mb-1 text-xs uppercase tracking-[0.28em] text-lime-300">Your Garage</div><div>{selectedVehicle.label}</div></div> : null}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Select value={year} onChange={(event) => setYear(event.target.value)}><option value="">Year</option>{availableYears.map((option) => <option key={option} value={option}>{option}</option>)}</Select>
        <Select value={makeSlug} onChange={(event) => { setMakeSlug(event.target.value); setModelSlug(""); setGenerationSlug(""); }}><option value="">Make</option>{brands.map((brand) => <option key={brand.slug} value={brand.slug}>{brand.name}</option>)}</Select>
        <Select value={modelSlug} onChange={(event) => { setModelSlug(event.target.value); setGenerationSlug(""); }} disabled={!makeSlug}><option value="">Model</option>{availableModels.map((model) => <option key={model.slug} value={model.slug}>{model.name}</option>)}</Select>
        <Select value={generationSlug} onChange={(event) => setGenerationSlug(event.target.value)} disabled={!modelSlug}><option value="">Chassis / Generation</option>{availableGenerations.map((generation) => <option key={generation.slug} value={generation.slug}>{generation.name}</option>)}</Select>
        <Button className="w-full" onClick={selectVehicle}><ChevronsRight className="h-4 w-4" /> View Compatible Parts</Button>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="border border-white/10 bg-black/30 p-5 text-sm leading-7 text-zinc-300"><div className="mb-2 flex items-center gap-2 text-white"><CarFront className="h-4 w-4 text-lime-300" /><span className="font-semibold uppercase tracking-[0.22em]">Saved vehicle sync</span></div>Selected vehicles persist in local storage now and can be mirrored to the customer profile once Supabase auth is connected.</div>
        <div className="border border-white/10 bg-black/30 p-5 text-sm leading-7 text-zinc-300"><div className="mb-2 flex items-center gap-2 text-white"><Check className="h-4 w-4 text-lime-300" /><span className="font-semibold uppercase tracking-[0.22em]">Garage count</span></div>{savedVehicleKeys.length} vehicles stored for this browser session.</div>
      </div>
    </div>
  );
}
