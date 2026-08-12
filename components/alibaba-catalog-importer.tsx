"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CatalogFetchEvent } from "@/lib/alibaba-import/types";
import type { NormalizedImportRow } from "@/lib/importer";
import { formatCurrency } from "@/lib/utils";

type SupplierOption = { id: string; name: string };

type WizardStep = "source" | "fetch" | "results" | "review" | "complete";

async function readSse(response: Response, onEvent: (event: CatalogFetchEvent) => void) {
  if (!response.body) {
    throw new Error("Unable to retrieve this supplier catalog using the configured provider.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";
    for (const chunk of chunks) {
      const line = chunk.split("\n").find((item) => item.startsWith("data: "));
      if (!line) continue;
      onEvent(JSON.parse(line.slice(6)) as CatalogFetchEvent);
    }
  }
}

export function AlibabaCatalogImporter({ suppliers }: { suppliers: SupplierOption[] }) {
  const [step, setStep] = useState<WizardStep>("source");
  const [url, setUrl] = useState("");
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [supplierOptions, setSupplierOptions] = useState(suppliers);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [rows, setRows] = useState<NormalizedImportRow[]>([]);
  const [importId, setImportId] = useState("");
  const [progressMessage, setProgressMessage] = useState("Fetching products...");
  const [pageLabel, setPageLabel] = useState("");
  const [productsFound, setProductsFound] = useState(0);
  const [failedProducts, setFailedProducts] = useState(0);
  const [error, setError] = useState("");
  const [jsonPaste, setJsonPaste] = useState("");
  const [importResult, setImportResult] = useState<null | {
    importId: string;
    stats: Record<string, number>;
  }>(null);
  const [page, setPage] = useState(1);

  const pagedRows = useMemo(() => rows.slice((page - 1) * 10, page * 10), [rows, page]);
  const selectedCount = rows.filter((row) => row.include && row.duplicateStrategy !== "skip").length;

  function updateRow(index: number, patch: Partial<NormalizedImportRow>) {
    setRows((current) => current.map((row) => (row.rowIndex === index ? { ...row, ...patch } : row)));
  }

  async function createSupplier() {
    if (!newSupplierName.trim()) return;
    const response = await fetch("/api/admin/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newSupplierName.trim(),
        alibabaStoreUrl: url,
      }),
    });
    const payload = await response.json();
    if (payload.supplier) {
      setSupplierOptions((current) => [...current, payload.supplier]);
      setSupplierId(payload.supplier.id);
      setNewSupplierName("");
    }
  }

  async function fetchCatalog() {
    setError("");
    setStep("fetch");
    setProgressMessage("Fetching products...");
    setPageLabel("");
    setProductsFound(0);
    setFailedProducts(0);
    setRows([]);

    const response = await fetch("/api/admin/import/alibaba/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, supplierId }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(
        typeof payload.error === "string"
          ? payload.error
          : "Unable to retrieve this supplier catalog using the configured provider."
      );
      setStep("source");
      return;
    }

    let completed = false;
    let failed = false;
    await readSse(response, (event) => {
      if (event.type === "status") {
        setProgressMessage(event.message);
      }
      if (event.type === "page") {
        setPageLabel(event.message);
        setProductsFound(event.productsFound);
        setProgressMessage("Fetching products...");
      }
      if (event.type === "complete") {
        completed = true;
        setImportId(event.importId);
        setRows(event.rows);
        setProductsFound(event.productsFound);
        setFailedProducts(event.failedProducts);
        setPage(1);
        setStep("results");
      }
      if (event.type === "error") {
        failed = true;
        setError(event.message);
        setStep("source");
      }
    });

    if (!completed && !failed) {
      setError("Unable to retrieve this supplier catalog using the configured provider.");
      setStep("source");
    }
  }

  async function uploadManualFile(file: File) {
    setError("");
    const form = new FormData();
    form.set("file", file);
    form.set("supplierId", supplierId);
    const response = await fetch("/api/admin/import/alibaba/manual", {
      method: "POST",
      body: form,
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Unable to parse the uploaded catalog.");
      return;
    }
    setImportId(payload.importId);
    setRows(payload.rows ?? []);
    setProductsFound(payload.productsFound ?? 0);
    setFailedProducts(0);
    setPage(1);
    setStep("results");
  }

  async function pasteJsonCatalog() {
    setError("");
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonPaste);
    } catch {
      setError("Paste valid JSON product data to continue.");
      return;
    }
    const response = await fetch("/api/admin/import/alibaba/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplierId, products: parsed, filename: "pasted-json" }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Unable to parse the pasted catalog.");
      return;
    }
    setImportId(payload.importId);
    setRows(payload.rows ?? []);
    setProductsFound(payload.productsFound ?? 0);
    setFailedProducts(0);
    setPage(1);
    setStep("results");
  }

  async function commitImport() {
    const response = await fetch("/api/admin/import/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplierId,
        importId,
        filename: url || "alibaba-catalog",
        fileType: "alibaba-url",
        rows,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Import failed.");
      return;
    }
    setImportResult(payload);
    setStep("complete");
  }

  const table = (
    <div className="mt-6 overflow-x-auto border border-white/10">
      <table className="min-w-full text-left text-sm text-zinc-300">
        <thead className="border-b border-white/10 text-xs uppercase tracking-[0.22em] text-zinc-500">
          <tr>
            <th className="px-4 py-3">Select</th>
            <th className="px-4 py-3">Image</th>
            <th className="px-4 py-3">Supplier Product</th>
            <th className="px-4 py-3">Supplier SKU</th>
            <th className="px-4 py-3">Supplier Price</th>
            <th className="px-4 py-3">MOQ</th>
            <th className="px-4 py-3">Detected Vehicle</th>
            <th className="px-4 py-3">Detected Chassis</th>
            <th className="px-4 py-3">Detected Category</th>
            <th className="px-4 py-3">Suggested AeroHaus Product Title</th>
            <th className="px-4 py-3">Suggested Retail</th>
            <th className="px-4 py-3">Margin</th>
            <th className="px-4 py-3">Issues</th>
          </tr>
        </thead>
        <tbody>
          {pagedRows.map((row) => (
            <tr key={row.rowIndex} className="border-b border-white/10 align-top">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={row.include}
                  onChange={(event) => updateRow(row.rowIndex, { include: event.target.checked })}
                />
              </td>
              <td className="px-4 py-3">
                {row.supplierImageUrl ? (
                  // Source thumbnails are admin-only review aids; import copies them into AeroHaus storage.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.supplierImageUrl} alt="" className="h-14 w-14 object-cover" />
                ) : (
                  <span className="text-amber-200">IMAGE IMPORT FAILED</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="max-w-xs text-white">{row.supplierProductName}</div>
                {row.alreadyImported ? (
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-amber-200">Already Imported</div>
                ) : null}
              </td>
              <td className="px-4 py-3">{row.supplierSku || "—"}</td>
              <td className="px-4 py-3">{formatCurrency(row.supplierPrice)}</td>
              <td className="px-4 py-3">{row.moq ?? "—"}</td>
              <td className="px-4 py-3">
                {row.vehicleMake} {row.vehicleModel}
              </td>
              <td className="px-4 py-3">
                {[row.vehicleChassis, ...(row.additionalChassis || [])].filter(Boolean).join(" / ") || "—"}
              </td>
              <td className="px-4 py-3">{row.category || "—"}</td>
              <td className="px-4 py-3">
                {step === "review" ? (
                  <input
                    value={row.normalizedTitle}
                    onChange={(event) => updateRow(row.rowIndex, { normalizedTitle: event.target.value })}
                    className="w-72 border border-white/10 bg-black/30 px-3 py-2 text-white"
                  />
                ) : (
                  <div className="max-w-xs text-white">{row.normalizedTitle}</div>
                )}
              </td>
              <td className="px-4 py-3">
                {step === "review" ? (
                  <input
                    value={row.recommendedRetailPrice}
                    onChange={(event) =>
                      updateRow(row.rowIndex, { recommendedRetailPrice: Number(event.target.value) })
                    }
                    className="w-24 border border-white/10 bg-black/30 px-3 py-2 text-white"
                  />
                ) : (
                  formatCurrency(row.recommendedRetailPrice)
                )}
              </td>
              <td className="px-4 py-3">{row.grossMarginPercent.toFixed(1)}%</td>
              <td className="px-4 py-3">
                <div>{row.issues.join(", ") || "—"}</div>
                {row.alreadyImported ? (
                  <select
                    value={row.duplicateStrategy}
                    onChange={(event) =>
                      updateRow(row.rowIndex, {
                        duplicateStrategy: event.target.value as NormalizedImportRow["duplicateStrategy"],
                      })
                    }
                    className="mt-2 border border-white/10 bg-black/30 px-2 py-2 text-white"
                  >
                    <option value="skip">Skip</option>
                    <option value="update">Update Existing</option>
                    <option value="create">Create Separate Product</option>
                  </select>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="grid gap-6">
      <section className="border border-white/10 bg-zinc-950/80 p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Supplier Catalog Import</p>
        <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.12em] text-white">
          Import Alibaba Supplier Catalog
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
          Paste a supplier storefront or catalog URL. AeroHaus retrieves products server-side, suggests titles and
          fitment, then imports selected items as drafts. Nothing is published automatically.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-zinc-300 md:col-span-2">
            Alibaba Supplier / Catalog URL
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://supplier-name.en.alibaba.com/productlist.html"
              className="h-11 border border-white/10 bg-black/30 px-3 text-white"
            />
          </label>
          <label className="grid gap-2 text-sm text-zinc-300">
            Existing AeroHaus Supplier
            <select
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
              className="h-11 border border-white/10 bg-black/30 px-3 text-white"
            >
              <option value="">Select Supplier</option>
              {supplierOptions.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-zinc-300">
            Or Create A New Supplier
            <div className="flex gap-3">
              <input
                value={newSupplierName}
                onChange={(event) => setNewSupplierName(event.target.value)}
                placeholder="Supplier name"
                className="h-11 flex-1 border border-white/10 bg-black/30 px-3 text-white"
              />
              <Button type="button" variant="secondary" onClick={createSupplier}>
                Create
              </Button>
            </div>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={fetchCatalog} disabled={!url || !supplierId || step === "fetch"}>
            Fetch Catalog
          </Button>
          <Link
            href="/admin/import"
            className="inline-flex items-center border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white hover:border-lime-300 hover:text-lime-300"
          >
            CSV / Excel Importer
          </Link>
        </div>
      </section>

      {step === "fetch" ? (
        <section className="border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Progress</p>
          <div className="mt-4 text-2xl font-black uppercase tracking-[0.12em] text-white">{progressMessage}</div>
          {pageLabel ? <div className="mt-3 text-sm text-zinc-300">{pageLabel}</div> : null}
          <div className="mt-2 text-sm text-zinc-400">{productsFound} products found</div>
        </section>
      ) : null}

      {error ? (
        <section className="border border-amber-300/20 bg-amber-300/5 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-amber-200">Fetch Failed</p>
          <p className="mt-3 text-sm leading-6 text-zinc-300">{error}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={fetchCatalog} disabled={!url || !supplierId}>
              Try Again
            </Button>
            <label className="inline-flex cursor-pointer items-center border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white hover:border-lime-300 hover:text-lime-300">
              Upload CSV
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadManualFile(file);
                }}
              />
            </label>
            <label className="inline-flex cursor-pointer items-center border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white hover:border-lime-300 hover:text-lime-300">
              Upload Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadManualFile(file);
                }}
              />
            </label>
          </div>
          <label className="mt-6 grid gap-2 text-sm text-zinc-300">
            Paste Product JSON
            <textarea
              value={jsonPaste}
              onChange={(event) => setJsonPaste(event.target.value)}
              placeholder='[{"originalTitle":"...","supplierUrl":"https://...","supplierSku":"...","supplierPriceMin":125}]'
              className="min-h-32 border border-white/10 bg-black/30 px-3 py-3 text-white"
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={pasteJsonCatalog}>
              Paste Product URL
            </Button>
          </div>
        </section>
      ) : null}

      {step === "results" || step === "review" ? (
        <section className="border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-lime-300">
            {step === "results" ? "Fetch Results" : "Review Products"}
          </p>
          <div className="mt-3 text-sm text-zinc-400">
            {productsFound} products found
            {failedProducts ? ` · ${failedProducts} failed` : ""} · {selectedCount} selected for draft import
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRows((current) => current.map((row) => ({ ...row, include: true })))}
            >
              Select All
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRows((current) => current.map((row) => ({ ...row, include: false })))}
            >
              Deselect All
            </Button>
            <Button type="button" variant="secondary" onClick={fetchCatalog} disabled={!url}>
              Retry Failed
            </Button>
            {step === "results" ? (
              <Button type="button" onClick={() => setStep("review")}>
                Continue To Review
              </Button>
            ) : (
              <Button type="button" onClick={commitImport} disabled={!supplierId || selectedCount === 0}>
                Import Selected As Drafts
              </Button>
            )}
          </div>
          {table}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-zinc-400">Page {page}</div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setPage((current) => Math.max(1, current - 1))}>
                Prev
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPage((current) => (current * 10 < rows.length ? current + 1 : current))}
              >
                Next
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {step === "complete" && importResult ? (
        <section className="border border-white/10 bg-zinc-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Import Complete</p>
          <h3 className="mt-2 text-2xl font-black uppercase tracking-[0.12em] text-white">Drafts Created</h3>
          <div className="mt-4 text-sm text-zinc-300">
            Created: {importResult.stats.productsCreated} · Updated: {importResult.stats.productsUpdated} · Skipped:{" "}
            {importResult.stats.productsSkipped} · Review Required: {importResult.stats.productsRequiringReview}
          </div>
          <p className="mt-3 text-sm text-zinc-400">
            Imported products remain Draft until an admin publishes them. They are not publicly purchasable.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/products"
              className="inline-flex items-center border border-lime-300 bg-lime-300 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-black hover:bg-lime-200"
            >
              Open Product Catalog
            </Link>
            <Link
              href={`/admin/import/history/${importResult.importId}`}
              className="inline-flex items-center border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white hover:border-lime-300 hover:text-lime-300"
            >
              View Import Detail
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
