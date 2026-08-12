"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  importerFieldOptions,
  mappingToSupplierColumns,
  type ImporterField,
  type NormalizedImportRow,
} from "@/lib/importer";

type SupplierOption = { id: string; name: string };
type TemplateOption = { id: string; name: string; supplier_id: string; mapping: Record<string, string> };
type PricingSettingsShape = {
  minimum_gross_margin: number;
  rounding_mode: string;
  rules: unknown;
};

export function SupplierImporter({
  suppliers,
  templates,
}: {
  suppliers: SupplierOption[];
  templates: TemplateOption[];
  pricingSettings: PricingSettingsShape | null;
}) {
  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [fileType, setFileType] = useState("");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, ImporterField>>({});
  const [supplierId, setSupplierId] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [normalizedRows, setNormalizedRows] = useState<NormalizedImportRow[]>([]);
  const [page, setPage] = useState(1);
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkMargin, setBulkMargin] = useState("");
  const [bulkVehicle, setBulkVehicle] = useState("");
  const [importResult, setImportResult] = useState<null | { importId: string; stats: Record<string, number> }>(null);

  const pagedRows = useMemo(
    () => normalizedRows.slice((page - 1) * 10, page * 10),
    [normalizedRows, page]
  );

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.SheetNames[0];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[firstSheet], {
      defval: "",
    });
    const detectedColumns = json.length > 0 ? Object.keys(json[0]) : [];
    setFileName(file.name);
    setFileSize(file.size);
    setFileType(file.name.split(".").pop()?.toLowerCase() ?? "csv");
    setRows(json);
    setColumns(detectedColumns);
    setMapping(
      Object.fromEntries(
        mappingToSupplierColumns(detectedColumns).map((item) => [
          item.column,
          item.mappedField as ImporterField,
        ])
      )
    );
    setStep(1);
  }

  async function previewRows() {
    const response = await fetch("/api/admin/import/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows, mapping, supplierId }),
    });
    const payload = await response.json();
    setNormalizedRows(payload.rows ?? []);
    setStep(3);
  }

  async function saveTemplate() {
    await fetch("/api/admin/import/template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplierId, name: templateName, mapping }),
    });
  }

  function updateRow(index: number, patch: Partial<NormalizedImportRow>) {
    setNormalizedRows((current) =>
      current.map((row) => (row.rowIndex === index ? { ...row, ...patch } : row))
    );
  }

  function applyBulkUpdates() {
    setNormalizedRows((current) =>
      current.map((row) => {
        if (!row.include) return row;
        return {
          ...row,
          category: bulkCategory || row.category,
          vehicleChassis: bulkVehicle || row.vehicleChassis,
          grossMarginPercent: bulkMargin ? Number(bulkMargin) : row.grossMarginPercent,
        };
      })
    );
  }

  async function commitImport() {
    const response = await fetch("/api/admin/import/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplierId,
        filename: fileName,
        fileType,
        rows: normalizedRows,
      }),
    });
    const payload = await response.json();
    setImportResult(payload);
    setStep(5);
  }

  return (
    <div className="grid gap-6">
      <section className="border border-white/10 bg-zinc-950/80 p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Upload</p>
        <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.12em] text-white">
          Supplier Catalog Importer
        </h2>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="mt-6 block w-full text-sm text-zinc-300"
        />
        {fileName ? (
          <div className="mt-6 grid gap-2 text-sm text-zinc-300">
            <div>File name: {fileName}</div>
            <div>File size: {(fileSize / 1024).toFixed(1)} KB</div>
            <div>Rows detected: {rows.length}</div>
            <div>Columns: {columns.join(", ")}</div>
            <Button className="mt-3 w-fit" onClick={() => setStep(2)}>
              Continue to Field Mapping
            </Button>
          </div>
        ) : null}
      </section>

      {step >= 2 ? (
        <section className="border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Map</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-zinc-300">
              Supplier
              <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)} className="h-11 border border-white/10 bg-black/30 px-3 text-white">
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm text-zinc-300">
              Mapping Template Name
              <input value={templateName} onChange={(event) => setTemplateName(event.target.value)} className="h-11 border border-white/10 bg-black/30 px-3 text-white" />
            </label>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {columns.map((column) => (
              <div key={column} className="grid gap-2 border border-white/10 p-4">
                <div className="text-sm font-medium text-white">{column}</div>
                <select value={mapping[column] ?? "Ignore Column"} onChange={(event) => setMapping((current) => ({ ...current, [column]: event.target.value as ImporterField }))} className="h-11 border border-white/10 bg-black/30 px-3 text-white">
                  {importerFieldOptions.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={previewRows}>Preview Normalized Rows</Button>
            <Button variant="secondary" onClick={saveTemplate}>Save Mapping Template</Button>
            {templates.filter((template) => template.supplier_id === supplierId).map((template) => (
              <Button key={template.id} variant="outline" onClick={() => setMapping(template.mapping as Record<string, ImporterField>)}>
                Load {template.name}
              </Button>
            ))}
          </div>
        </section>
      ) : null}

      {step >= 3 ? (
        <section className="border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Review</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <input value={bulkCategory} onChange={(event) => setBulkCategory(event.target.value)} placeholder="Bulk Category Change" className="h-11 border border-white/10 bg-black/30 px-3 text-white" />
            <input value={bulkMargin} onChange={(event) => setBulkMargin(event.target.value)} placeholder="Bulk Margin Change" className="h-11 border border-white/10 bg-black/30 px-3 text-white" />
            <input value={bulkVehicle} onChange={(event) => setBulkVehicle(event.target.value)} placeholder="Bulk Vehicle Change" className="h-11 border border-white/10 bg-black/30 px-3 text-white" />
          </div>
          <div className="mt-4 flex gap-3">
            <Button variant="secondary" onClick={applyBulkUpdates}>Apply Bulk Changes</Button>
            <Button variant="outline" onClick={() => setNormalizedRows((current) => current.map((row) => ({ ...row, include: true })))}>Select All</Button>
            <Button variant="outline" onClick={() => setNormalizedRows((current) => current.map((row) => ({ ...row, include: false })))}>Deselect All</Button>
          </div>
          <div className="mt-6 overflow-x-auto border border-white/10">
            <table className="min-w-full text-left text-sm text-zinc-300">
              <thead className="border-b border-white/10 text-xs uppercase tracking-[0.22em] text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Import</th>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Suggested Product Name</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Chassis</th>
                  <th className="px-4 py-3">Years</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Material</th>
                  <th className="px-4 py-3">Supplier Cost</th>
                  <th className="px-4 py-3">Shipping</th>
                  <th className="px-4 py-3">Landed Cost</th>
                  <th className="px-4 py-3">Recommended Retail</th>
                  <th className="px-4 py-3">Margin</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Issues</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => (
                  <tr key={row.rowIndex} className="border-b border-white/10 align-top">
                    <td className="px-4 py-3"><input type="checkbox" checked={row.include} onChange={(event) => updateRow(row.rowIndex, { include: event.target.checked })} /></td>
                    <td className="px-4 py-3">{row.supplierImageUrl ? "Preview Ready" : "IMAGE REVIEW REQUIRED"}</td>
                    <td className="px-4 py-3"><input value={row.normalizedTitle} onChange={(event) => updateRow(row.rowIndex, { normalizedTitle: event.target.value })} className="w-64 border border-white/10 bg-black/30 px-3 py-2 text-white" /></td>
                    <td className="px-4 py-3">{row.vehicleMake} {row.vehicleModel}</td>
                    <td className="px-4 py-3"><input value={row.vehicleChassis} onChange={(event) => updateRow(row.rowIndex, { vehicleChassis: event.target.value })} className="w-24 border border-white/10 bg-black/30 px-3 py-2 text-white" /></td>
                    <td className="px-4 py-3">{row.startYear} - {row.endYear}</td>
                    <td className="px-4 py-3"><input value={row.category} onChange={(event) => updateRow(row.rowIndex, { category: event.target.value })} className="w-32 border border-white/10 bg-black/30 px-3 py-2 text-white" /></td>
                    <td className="px-4 py-3"><input value={row.material} onChange={(event) => updateRow(row.rowIndex, { material: event.target.value })} className="w-32 border border-white/10 bg-black/30 px-3 py-2 text-white" /></td>
                    <td className="px-4 py-3">{row.supplierPrice}</td>
                    <td className="px-4 py-3">{row.supplierShippingCost}</td>
                    <td className="px-4 py-3">{row.landedCost}</td>
                    <td className="px-4 py-3"><input value={row.recommendedRetailPrice} onChange={(event) => updateRow(row.rowIndex, { recommendedRetailPrice: Number(event.target.value) })} className="w-24 border border-white/10 bg-black/30 px-3 py-2 text-white" /></td>
                    <td className="px-4 py-3">{row.grossMarginPercent.toFixed(1)}%</td>
                    <td className="px-4 py-3">
                      <select value={row.duplicateStrategy} onChange={(event) => updateRow(row.rowIndex, { duplicateStrategy: event.target.value as NormalizedImportRow["duplicateStrategy"] })} className="border border-white/10 bg-black/30 px-2 py-2 text-white">
                        <option value="skip">Skip</option>
                        <option value="update">Update Existing</option>
                        <option value="create">Create New</option>
                      </select>
                      <div className="mt-2">{row.status}</div>
                    </td>
                    <td className="px-4 py-3">{row.issues.join(", ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-zinc-400">Page {page}</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPage((current) => Math.max(1, current - 1))}>Prev</Button>
              <Button variant="outline" onClick={() => setPage((current) => (current * 10 < normalizedRows.length ? current + 1 : current))}>Next</Button>
            </div>
          </div>
          <div className="mt-6">
            <Button onClick={commitImport}>Import Selected Draft Products</Button>
          </div>
        </section>
      ) : null}

      {step === 5 && importResult ? (
        <section className="border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Import Complete</p>
          <div className="mt-4 text-sm text-zinc-300">
            Created: {importResult.stats.productsCreated} · Updated: {importResult.stats.productsUpdated} · Skipped: {importResult.stats.productsSkipped} · Review Required: {importResult.stats.productsRequiringReview}
          </div>
          <a href={`/admin/import/history/${importResult.importId}`} className="mt-4 inline-flex text-sm font-semibold uppercase tracking-[0.22em] text-lime-300">
            View Import Detail
          </a>
        </section>
      ) : null}
    </div>
  );
}
