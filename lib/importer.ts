import { vehicleGenerations } from "@/lib/store";
import { slugify } from "@/lib/utils";

export const importerFieldOptions = [
  "Supplier Product Name",
  "Supplier SKU",
  "Supplier Price",
  "Supplier Shipping Cost",
  "Supplier Product URL",
  "Supplier Image URL",
  "Additional Image URLs",
  "Vehicle Make",
  "Vehicle Model",
  "Vehicle Chassis",
  "Start Year",
  "End Year",
  "Trim",
  "Category",
  "Material",
  "Finish",
  "Description",
  "MOQ",
  "Supplier Processing Time",
  "Supplier Notes",
  "Ignore Column",
] as const;

export type ImporterField = (typeof importerFieldOptions)[number];

export type PricingRule = {
  min: number;
  max: number | null;
  markup: number;
};

export type PricingSettings = {
  rules: PricingRule[];
  minimumGrossMargin: number;
  roundingMode: "nearest-9" | "nearest-99";
};

export type ImportVariantPreview = {
  supplierVariantId?: string;
  supplierSku?: string;
  optionName: string;
  optionValue: string;
  supplierCost?: number;
  recommendedRetailPrice?: number;
};

export type NormalizedImportRow = {
  rowIndex: number;
  include: boolean;
  supplierProductId?: string;
  supplierProductName: string;
  supplierSku: string;
  supplierPrice: number;
  supplierShippingCost: number;
  supplierProductUrl: string;
  supplierImageUrl: string;
  additionalImageUrls: string[];
  vehicleMake: string;
  vehicleModel: string;
  vehicleChassis: string;
  additionalChassis: string[];
  startYear: number | null;
  endYear: number | null;
  trim: string;
  category: string;
  material: string;
  finish: string;
  description: string;
  moq: number | null;
  supplierProcessingTime: string;
  supplierNotes: string;
  normalizedTitle: string;
  landedCost: number;
  recommendedRetailPrice: number;
  grossProfit: number;
  grossMarginPercent: number;
  markupPercent: number;
  status: "READY" | "REVIEW REQUIRED" | "ALREADY IMPORTED";
  issues: string[];
  duplicateStrategy: "skip" | "update" | "create";
  existingProductId?: string;
  existingSupplierProductId?: string;
  fitmentReviewRequired: boolean;
  imageReviewRequired: boolean;
  variants?: ImportVariantPreview[];
  catalogImportRowId?: string;
  alreadyImported?: boolean;
  costChangeWarning?: string;
  fetchFailed?: boolean;
};

const chassisPatterns = [
  "E90", "E92", "F30", "F32", "F80", "F82", "F90", "G20", "G21", "G22", "G23",
  "G26", "G28", "G30", "G42", "G80", "G82", "G83", "G87", "G90", "W204", "W205",
  "W206", "W212", "W213", "W214", "C217", "C257", "8V", "8Y", "B8.5", "B8", "B9",
  "C7", "C8", "981", "982", "991", "992", "9YA", "9YB", "9Y", "95B",
] as const;

const chassisPatternsByLength = [...chassisPatterns].sort((a, b) => b.length - a.length);

const makeKeywords = [
  { keyword: "BMW", make: "BMW" },
  { keyword: "MERCEDES", make: "Mercedes-Benz" },
  { keyword: "AMG", make: "Mercedes-Benz" },
  { keyword: "AUDI", make: "Audi" },
  { keyword: "PORSCHE", make: "Porsche" },
] as const;

const blockedMakeKeywords = ["TESLA", "MCLAREN", "FERRARI", "LOTUS", "LAMBORGHINI"];

function normalizedMakeFromSlug(slug: string) {
  return slug === "mercedes-benz" ? "Mercedes-Benz" : slug.toUpperCase();
}

const categoryMatchers: Array<[string, string]> = [
  ["front bumper lip", "Front Lips"],
  ["rear diffuser", "Rear Diffusers"],
  ["side skirt", "Side Skirts"],
  ["mirror cap", "Mirror Caps"],
  ["interior trim", "Interior Trim"],
  ["body kit", "Body Kits"],
  ["bodykit", "Body Kits"],
  ["ducktail", "Spoilers"],
  ["diffuser", "Rear Diffusers"],
  ["splitter", "Front Lips"],
  ["lip", "Front Lips"],
  ["skirt", "Side Skirts"],
  ["spoiler", "Spoilers"],
  ["grille", "Grilles"],
  ["grill", "Grilles"],
  ["mirror", "Mirror Caps"],
  ["wheel", "Wheels"],
  ["suspension", "Suspension"],
  ["interior", "Interior Trim"],
  ["hud", "Interior Trim"],
];

const materialMatchers: Record<string, string> = {
  carbon: "Carbon Fiber",
  dry: "Dry Carbon Fiber",
  prepreg: "Dry Carbon Fiber",
  forged: "Forged Carbon",
  abs: "ABS",
  frp: "FRP",
};

const finishMatchers: Record<string, string> = {
  gloss: "Gloss",
  matte: "Matte",
  unpainted: "Unpainted",
  forged: "Forged",
};

export const defaultPricingSettings: PricingSettings = {
  rules: [
    { min: 0, max: 100, markup: 2.5 },
    { min: 101, max: 250, markup: 2.2 },
    { min: 251, max: 500, markup: 1.9 },
    { min: 500, max: null, markup: 1.7 },
  ],
  minimumGrossMargin: 55,
  roundingMode: "nearest-9",
};

export function parseNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;
  const normalized = value.replace(/[$,\s]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function detectAllChassis(value: string) {
  const normalized = value.toUpperCase();
  return chassisPatternsByLength.filter((pattern) =>
    new RegExp(`\\b${pattern.replace(".", "\\.")}\\b`, "i").test(normalized)
  );
}

export function detectChassis(value: string) {
  return detectAllChassis(value)[0] ?? "";
}

export function detectTrimPackage(value: string) {
  const upper = value.toUpperCase();
  if (/\bM\s*SPORT\b/.test(upper)) return "M Sport";
  if (/\bAMG\s*LINE\b/.test(upper)) return "AMG Line";
  if (/\bS\s*LINE\b/.test(upper)) return "S Line";
  if (/\bPRE[-\s]?LCI\b/.test(upper)) return "Pre-LCI";
  if (/\bLCI\b/.test(upper)) return "LCI";
  return "";
}

function generationMatchesChassis(
  generation: (typeof vehicleGenerations)[number],
  chassis: string,
  detectedMake: string
) {
  if (
    detectedMake &&
    normalizedMakeFromSlug(generation.makeSlug).toUpperCase() !== detectedMake.toUpperCase()
  ) {
    return false;
  }

  const chassisUpper = chassis.toUpperCase();
  return (
    generation.slug.toUpperCase() === chassisUpper ||
    generation.chassisLabel.toUpperCase() === chassisUpper ||
    generation.name.toUpperCase().includes(chassisUpper)
  );
}

export function detectVehicleFromText(value: string) {
  const upper = value.toUpperCase();
  if (blockedMakeKeywords.some((keyword) => upper.includes(keyword))) {
    return {
      make: "",
      model: "",
      chassis: "",
      additionalChassis: [] as string[],
      years: [] as number[],
      generationSlug: "",
      fitmentReviewRequired: true,
    };
  }

  const detectedMake =
    makeKeywords.find(({ keyword }) => upper.includes(keyword))?.make ?? "";
  const allChassis = detectAllChassis(upper);
  const matchedGeneration = allChassis
    .map((chassis) =>
      vehicleGenerations.find((generation) =>
        generationMatchesChassis(generation, chassis, detectedMake)
      )
    )
    .find(Boolean);

  if (!matchedGeneration) {
    return {
      make: detectedMake,
      model: "",
      chassis: allChassis[0] ?? "",
      additionalChassis: allChassis.slice(1),
      years: [] as number[],
      generationSlug: "",
      fitmentReviewRequired: Boolean(allChassis[0] || detectedMake),
    };
  }

  const unmatchedChassis = allChassis.filter(
    (chassis) => !generationMatchesChassis(matchedGeneration, chassis, detectedMake)
  );

  return {
    make:
      matchedGeneration.makeSlug === "mercedes-benz"
        ? "Mercedes-Benz"
        : matchedGeneration.makeSlug.toUpperCase(),
    model: matchedGeneration.modelName,
    chassis: matchedGeneration.chassisLabel,
    additionalChassis: unmatchedChassis,
    years: matchedGeneration.years,
    generationSlug: matchedGeneration.slug,
    fitmentReviewRequired: unmatchedChassis.length > 0,
  };
}

function inferCategory(value: string) {
  const lower = value.toLowerCase();
  const match = categoryMatchers.find(([needle]) => lower.includes(needle));
  return match?.[1] ?? "";
}

function singularCategory(value: string) {
  if (value.endsWith("ies")) return `${value.slice(0, -3)}y`;
  if (value.endsWith("s")) return value.slice(0, -1);
  return value;
}

function inferMaterial(value: string) {
  const lower = value.toLowerCase();
  const match = Object.entries(materialMatchers).find(([needle]) => lower.includes(needle));
  return match?.[1] ?? "";
}

function inferFinish(value: string) {
  const lower = value.toLowerCase();
  const match = Object.entries(finishMatchers).find(([needle]) => lower.includes(needle));
  return match?.[1] ?? "";
}

function findPricingRule(landedCost: number, rules: PricingRule[]) {
  return (
    rules.find(
      (rule) => landedCost >= rule.min && (rule.max === null || landedCost <= rule.max)
    ) ?? rules[rules.length - 1]
  );
}

export function roundRetailPrice(value: number, mode: PricingSettings["roundingMode"]) {
  if (value <= 0) return 0;
  const roundedBase = Math.round(value);
  return mode === "nearest-99" ? Math.floor(roundedBase) + 0.99 : Math.floor(roundedBase / 10) * 10 + 9;
}

export function calculatePricing(
  supplierCost: number,
  supplierShippingCost: number,
  settings: PricingSettings
) {
  const landedCost = supplierCost + supplierShippingCost;
  const rule = findPricingRule(landedCost, settings.rules);
  const markupPrice = landedCost * rule.markup;
  const minMarginPrice = settings.minimumGrossMargin >= 100
    ? markupPrice
    : landedCost / (1 - settings.minimumGrossMargin / 100);
  const recommendedRetailPrice = roundRetailPrice(
    Math.max(markupPrice, minMarginPrice),
    settings.roundingMode
  );
  const grossProfit = recommendedRetailPrice - landedCost;
  const grossMarginPercent =
    recommendedRetailPrice > 0 ? (grossProfit / recommendedRetailPrice) * 100 : 0;
  const markupPercent = landedCost > 0 ? (grossProfit / landedCost) * 100 : 0;
  return {
    landedCost,
    recommendedRetailPrice,
    grossProfit,
    grossMarginPercent,
    markupPercent,
  };
}

export function suggestProductTitle(input: {
  supplierProductName: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleChassis: string;
  material: string;
  category: string;
  additionalChassis?: string[];
}) {
  // Deterministic suggestion only. Never invent fitment, years, or SKUs.
  const chassis = Array.from(
    new Set(
      [input.vehicleChassis, ...(input.additionalChassis ?? [])]
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
  const trimPackage = detectTrimPackage(input.supplierProductName);
  const pieces = [
    input.vehicleMake,
    chassis.join(" / "),
    trimPackage,
    input.material,
    singularCategory(input.category || "Part"),
  ].filter(Boolean);

  if (pieces.length > 1) {
    return pieces.join(" ").replace(/\s+/g, " ").trim();
  }

  return input.supplierProductName
    .replace(/\bfor\b/gi, "")
    .replace(/\bup\b/gi, "")
    .replace(/\b(19|20)\d{2}\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeSupplierRow(
  rowIndex: number,
  mappedRow: Record<string, unknown>,
  settings: PricingSettings
): NormalizedImportRow {
  const supplierProductName = normalizeText(mappedRow["Supplier Product Name"]);
  const supplierSku = normalizeText(mappedRow["Supplier SKU"]);
  const supplierPrice = parseNumber(mappedRow["Supplier Price"]);
  const supplierShippingCost = parseNumber(mappedRow["Supplier Shipping Cost"]);
  const supplierProductUrl = normalizeText(mappedRow["Supplier Product URL"]);
  const supplierImageUrl = normalizeText(mappedRow["Supplier Image URL"]);
  const additionalImageUrls = normalizeText(mappedRow["Additional Image URLs"])
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  const vehicleMakeInput = normalizeText(mappedRow["Vehicle Make"]);
  const vehicleModelInput = normalizeText(mappedRow["Vehicle Model"]);
  const chassisInput = normalizeText(mappedRow["Vehicle Chassis"]);
  const detected = detectVehicleFromText(
    [
      supplierProductName,
      vehicleMakeInput,
      vehicleModelInput,
      chassisInput,
      normalizeText(mappedRow["Supplier Notes"]),
    ].join(" ")
  );
  const vehicleMake = vehicleMakeInput || detected.make;
  const vehicleModel = vehicleModelInput || detected.model;
  const vehicleChassis = chassisInput || detected.chassis;
  const additionalChassis = detected.additionalChassis.filter(
    (chassis) => chassis.toUpperCase() !== vehicleChassis.toUpperCase()
  );
  const yearsInTitle = [...supplierProductName.matchAll(/\b((?:19|20)\d{2})\b/g)].map((match) =>
    Number(match[1])
  );
  const startYear =
    Number(mappedRow["Start Year"]) ||
    (yearsInTitle.length ? Math.min(...yearsInTitle) : detected.years[0] ?? null);
  const endYear =
    Number(mappedRow["End Year"]) ||
    (yearsInTitle.length ? Math.max(...yearsInTitle) : detected.years.at(-1) ?? null);
  const trim = normalizeText(mappedRow["Trim"]) || detectTrimPackage(supplierProductName);
  const category = normalizeText(mappedRow["Category"]) || inferCategory(supplierProductName);
  const material = normalizeText(mappedRow["Material"]) || inferMaterial(supplierProductName);
  const finish = normalizeText(mappedRow["Finish"]) || inferFinish(supplierProductName);
  const description = normalizeText(mappedRow["Description"]);
  const moq = Number(mappedRow["MOQ"]) || null;
  const supplierProcessingTime = normalizeText(mappedRow["Supplier Processing Time"]);
  const supplierNotes = normalizeText(mappedRow["Supplier Notes"]);

  const pricing = calculatePricing(supplierPrice, supplierShippingCost, settings);
  const normalizedTitle = suggestProductTitle({
    supplierProductName,
    vehicleMake,
    vehicleModel,
    vehicleChassis,
    additionalChassis,
    material: material || "Carbon Fiber",
    category: category || "Part",
  });

  const issues: string[] = [];
  if (!supplierPrice) issues.push("Missing Supplier Price");
  if (!supplierSku) issues.push("Missing SKU");
  if (!vehicleMake) issues.push("Unknown Vehicle");
  if (!vehicleChassis) issues.push("Unknown Chassis");
  if (!supplierImageUrl) issues.push("Missing Product Image");
  if (startYear && endYear && startYear > endYear) issues.push("Invalid Year Range");
  if (pricing.grossMarginPercent < settings.minimumGrossMargin) issues.push("Low Margin");
  if (pricing.grossMarginPercent < 0) issues.push("Negative Margin");
  if (detected.fitmentReviewRequired || !vehicleChassis || !detected.generationSlug) {
    issues.push("FITMENT REVIEW REQUIRED");
  }

  return {
    rowIndex,
    include: true,
    supplierProductName,
    supplierSku,
    supplierPrice,
    supplierShippingCost,
    supplierProductUrl,
    supplierImageUrl,
    additionalImageUrls,
    vehicleMake,
    vehicleModel,
    vehicleChassis,
    additionalChassis,
    startYear,
    endYear,
    trim,
    category,
    material,
    finish,
    description,
    moq,
    supplierProcessingTime,
    supplierNotes,
    normalizedTitle,
    landedCost: pricing.landedCost,
    recommendedRetailPrice: pricing.recommendedRetailPrice,
    grossProfit: pricing.grossProfit,
    grossMarginPercent: pricing.grossMarginPercent,
    markupPercent: pricing.markupPercent,
    status: issues.length > 0 ? "REVIEW REQUIRED" : "READY",
    issues,
    duplicateStrategy: "create",
    fitmentReviewRequired: issues.includes("FITMENT REVIEW REQUIRED"),
    imageReviewRequired: issues.includes("Missing Product Image"),
  };
}

export function mappingToSupplierColumns(
  columns: string[],
  template?: Record<string, string>
) {
  return columns.map((column) => ({
    column,
    mappedField: template?.[column] ?? "Ignore Column",
  }));
}

export function buildMappedRow(
  row: Record<string, unknown>,
  mapping: Record<string, ImporterField>
) {
  const mapped: Record<string, unknown> = {};
  for (const [columnName, field] of Object.entries(mapping)) {
    if (!field || field === "Ignore Column") continue;
    mapped[field] = row[columnName];
  }
  return mapped;
}

export function normalizeTemplateName(supplierName: string) {
  return `${supplierName} ${slugify(supplierName)} template`;
}
