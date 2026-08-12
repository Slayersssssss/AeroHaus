"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CarFront, Check, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useStorefront } from "@/components/providers";
import { brands, vehicleRecords } from "@/lib/store";

export function VehicleFinder() {
  const router = useRouter();
  const { selectedVehicle, setSelectedVehicle, savedVehicleKeys } = useStorefront();
  const [year, setYear] = useState("");
  const [makeSlug, setMakeSlug] = useState("");
  const [modelSlug, setModelSlug] = useState("");
  const [generationSlug, setGenerationSlug] = useState("");
  const [trim, setTrim] = useState("");

  const availableYears = useMemo(
    () =>
      Array.from(new Set(vehicleRecords.map((vehicle) => vehicle.year))).sort((a, b) => b - a),
    []
  );

  const matchingByYear = useMemo(
    () => vehicleRecords.filter((vehicle) => (!year ? true : vehicle.year === Number(year))),
    [year]
  );

  const availableMakes = useMemo(
    () =>
      brands.filter((brand) =>
        matchingByYear.some((vehicle) => vehicle.makeSlug === brand.slug)
      ),
    [matchingByYear]
  );

  const matchingByMake = useMemo(
    () => matchingByYear.filter((vehicle) => (!makeSlug ? true : vehicle.makeSlug === makeSlug)),
    [matchingByYear, makeSlug]
  );

  const availableModels = useMemo(
    () =>
      matchingByMake.reduce((accumulator, vehicle) => {
        if (!accumulator.some((model) => model.slug === vehicle.modelSlug)) {
          accumulator.push({ slug: vehicle.modelSlug, name: vehicle.modelName });
        }
        return accumulator;
      }, [] as { slug: string; name: string }[]),
    [matchingByMake]
  );

  const matchingByModel = useMemo(
    () =>
      matchingByMake.filter((vehicle) => (!modelSlug ? true : vehicle.modelSlug === modelSlug)),
    [matchingByMake, modelSlug]
  );

  const availableGenerations = useMemo(
    () =>
      matchingByModel.reduce((accumulator, vehicle) => {
        if (!accumulator.some((generation) => generation.slug === vehicle.generationSlug)) {
          accumulator.push({
            slug: vehicle.generationSlug,
            name: `${vehicle.generationName} · ${vehicle.chassisLabel}`,
          });
        }
        return accumulator;
      }, [] as { slug: string; name: string }[]),
    [matchingByModel]
  );

  const matchingByGeneration = useMemo(
    () =>
      matchingByModel.filter((vehicle) =>
        !generationSlug ? true : vehicle.generationSlug === generationSlug
      ),
    [matchingByModel, generationSlug]
  );

  const availableTrims = useMemo(
    () =>
      Array.from(new Set(matchingByGeneration.map((vehicle) => vehicle.trim))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [matchingByGeneration]
  );

  const exactVehicle = useMemo(
    () => (trim ? matchingByGeneration.find((vehicle) => vehicle.trim === trim) : undefined),
    [matchingByGeneration, trim]
  );

  const selectVehicle = () => {
    if (!exactVehicle) return;
    setSelectedVehicle(exactVehicle.key);
    router.push(
      `/${exactVehicle.makeSlug}/${exactVehicle.generationSlug}?year=${exactVehicle.year}&trim=${encodeURIComponent(exactVehicle.trim)}`
    );
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
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Select value={year} onChange={(event) => { setYear(event.target.value); setMakeSlug(""); setModelSlug(""); setGenerationSlug(""); setTrim(""); }}><option value="">Year</option>{availableYears.map((option) => <option key={option} value={option}>{option}</option>)}</Select>
        <Select value={makeSlug} onChange={(event) => { setMakeSlug(event.target.value); setModelSlug(""); setGenerationSlug(""); setTrim(""); }}><option value="">Make</option>{availableMakes.map((brand) => <option key={brand.slug} value={brand.slug}>{brand.name}</option>)}</Select>
        <Select value={modelSlug} onChange={(event) => { setModelSlug(event.target.value); setGenerationSlug(""); setTrim(""); }} disabled={!makeSlug}><option value="">Model</option>{availableModels.map((model) => <option key={model.slug} value={model.slug}>{model.name}</option>)}</Select>
        <Select value={generationSlug} onChange={(event) => { setGenerationSlug(event.target.value); setTrim(""); }} disabled={!modelSlug}><option value="">Chassis / Generation</option>{availableGenerations.map((generation) => <option key={generation.slug} value={generation.slug}>{generation.name}</option>)}</Select>
        <Select value={trim} onChange={(event) => setTrim(event.target.value)} disabled={!generationSlug}><option value="">Trim / Package</option>{availableTrims.map((option) => <option key={option} value={option}>{option}</option>)}</Select>
        <Button className="w-full" onClick={selectVehicle} disabled={!exactVehicle}><ChevronsRight className="h-4 w-4" /> View Compatible Parts</Button>
      </div>
      {exactVehicle ? (
        <div className="mt-4 border border-lime-300/20 bg-lime-300/8 px-4 py-3 text-sm text-zinc-200">
          Exact match: {exactVehicle.label}
        </div>
      ) : null}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="border border-white/10 bg-black/30 p-5 text-sm leading-7 text-zinc-300"><div className="mb-2 flex items-center gap-2 text-white"><CarFront className="h-4 w-4 text-lime-300" /><span className="font-semibold uppercase tracking-[0.22em]">Saved vehicle sync</span></div>Selected vehicles persist in local storage now and can be mirrored to the customer profile once Supabase auth is connected.</div>
        <div className="border border-white/10 bg-black/30 p-5 text-sm leading-7 text-zinc-300"><div className="mb-2 flex items-center gap-2 text-white"><Check className="h-4 w-4 text-lime-300" /><span className="font-semibold uppercase tracking-[0.22em]">Garage count</span></div>{savedVehicleKeys.length} vehicles stored for this browser session.</div>
      </div>
    </div>
  );
}
