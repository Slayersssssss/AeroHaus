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

export type NormalizedImportRow = {
  rowIndex: number;
  include: boolean;
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
  status: "READY" | "REVIEW REQUIRED";
  issues: string[];
  duplicateStrategy: "skip" | "update" | "create";
  existingProductId?: string;
  existingSupplierProductId?: string;
  fitmentReviewRequired: boolean;
  imageReviewRequired: boolean;
};

const chassisPatterns = [
  "E90", "E92", "F30", "F32", "F80", "F82", "G20", "G22", "G26", "G30", "G42",
  "G80", "G82", "G87", "F90", "G90", "W204", "W205", "W206", "W212", "W213",
  "W214", "C217", "C257", "8V", "8Y", "B8", "B8.5", "B9", "C7", "C8", "981",
  "982", "991", "992", "9Y", "9YA", "9YB", "95B",
] as const;

const categoryMatchers: Record<string, string> = {
  diffuser: "Rear Diffusers",
  spoiler: "Spoilers",
  lip: "Front Lips",
  splitter: "Front Lips",
  skirt: "Side Skirts",
  grille: "Grilles",
  grill: "Grilles",
  bodykit: "Body Kits",
  body: "Body Kits",
  mirror: "Mirror Caps",
  wheel: "Wheels",
  suspension: "Suspension",
};

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

export function detectChassis(value: string) {
  const normalized = value.toUpperCase();
  return chassisPatterns.find((pattern) => normalized.includes(pattern)) ?? "";
}

export function detectVehicleFromText(value: string) {
  const upper = value.toUpperCase();
  const chassis = detectChassis(upper);
  const matchedGeneration = vehicleGenerations.find(
    (generation) =>
      generation.slug.toUpperCase() === chassis.toUpperCase() ||
      generation.chassisLabel.toUpperCase() === chassis.toUpperCase() ||
      generation.name.toUpperCase().includes(chassis)
  );

  if (!matchedGeneration) {
    return {
      make: "",
      model: "",
      chassis,
      fitmentReviewRequired: Boolean(chassis),
    };
  }

  return {
    make: matchedGeneration.makeSlug === "mercedes-benz" ? "Mercedes-Benz" : matchedGeneration.makeSlug.toUpperCase(),
    model: matchedGeneration.modelName,
    chassis: matchedGeneration.chassisLabel,
    fitmentReviewRequired: false,
  };
}

function inferCategory(value: string) {
  const lower = value.toLowerCase();
  const match = Object.entries(categoryMatchers).find(([needle]) => lower.includes(needle));
  return match?.[1] ?? "";
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
}) {
  // This is the current deterministic normalization layer.
  // An AI-assisted cleanup provider can be added later to improve the string output
  // without changing pricing, fitment, years, chassis, or SKU automatically.
  const pieces = [
    input.vehicleMake,
    input.vehicleModel,
    input.vehicleChassis,
    input.material,
    input.category.replace(/s$/, ""),
  ].filter(Boolean);

  if (pieces.length > 0) {
    return pieces.join(" ").replace(/\s+/g, " ").trim();
  }

  return input.supplierProductName
    .replace(/\bfor\b/gi, "")
    .replace(/\bup\b/gi, "")
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
    [supplierProductName, vehicleMakeInput, vehicleModelInput, chassisInput].join(" ")
  );
  const vehicleMake = vehicleMakeInput || detected.make;
  const vehicleModel = vehicleModelInput || detected.model;
  const vehicleChassis = chassisInput || detected.chassis;
  const startYear = Number(mappedRow["Start Year"]) || null;
  const endYear = Number(mappedRow["End Year"]) || null;
  const trim = normalizeText(mappedRow["Trim"]);
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
  if (detected.fitmentReviewRequired || !vehicleChassis) issues.push("Fitment Review Required");

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
    duplicateStrategy: "skip",
    fitmentReviewRequired: issues.includes("Fitment Review Required"),
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
