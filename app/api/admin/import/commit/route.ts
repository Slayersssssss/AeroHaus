import { NextResponse } from "next/server";
import { ensureProductImageBucket, importSourceImage } from "@/lib/alibaba-import/images";
import { vehicleGenerations } from "@/lib/store";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthContext } from "@/lib/supabase/auth";
import { slugify } from "@/lib/utils";
import type { NormalizedImportRow } from "@/lib/importer";

function brandSlugFromMake(make: string) {
  const slug = slugify(make || "unassigned");
  if (slug === "mercedes" || slug === "mercedesbenz") return "mercedes-benz";
  return slug;
}

function matchGenerations(make: string, chassisCodes: string[]) {
  const makeSlug = brandSlugFromMake(make);
  return vehicleGenerations.filter((generation) => {
    if (make && generation.makeSlug !== makeSlug && makeSlug !== "unassigned") {
      return false;
    }
    return chassisCodes.some((chassis) => {
      const value = chassis.toUpperCase();
      return (
        generation.slug.toUpperCase() === value ||
        generation.chassisLabel.toUpperCase() === value ||
        generation.name.toUpperCase().includes(value)
      );
    });
  });
}

async function uniqueProductSlug(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  title: string,
  excludeId?: string
) {
  const base = slugify(title) || `imported-product-${Date.now()}`;
  let slug = base;
  let suffix = 2;
  while (true) {
    const { data } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle();
    if (!data || data.id === excludeId) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

async function uniqueSku(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  sku: string,
  excludeId?: string
) {
  const base = slugify(sku).toUpperCase() || `AH-${Date.now()}`;
  let candidate = base;
  let suffix = 2;
  while (true) {
    const { data } = await supabase.from("product_variants").select("id").eq("sku", candidate).maybeSingle();
    if (!data || data.id === excludeId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth.user || auth.profile?.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const rows = (Array.isArray(body.rows) ? body.rows : []) as NormalizedImportRow[];
  const supplierId = typeof body.supplierId === "string" ? body.supplierId : "";
  const filename = typeof body.filename === "string" ? body.filename : "import.csv";
  const fileType = typeof body.fileType === "string" ? body.fileType : "csv";
  const existingImportId = typeof body.importId === "string" ? body.importId : "";
  const supabase = createSupabaseAdminClient();

  if (!supplierId) {
    return NextResponse.json({ error: "Supplier is required." }, { status: 400 });
  }

  await ensureProductImageBucket();

  const importRun = existingImportId
    ? { id: existingImportId }
    : (
        await supabase
          .from("catalog_imports")
          .insert({
            supplier_id: supplierId,
            filename,
            file_type: fileType,
            row_count: rows.length,
            imported_by: auth.user.id,
          })
          .select("id")
          .single()
      ).data;

  if (!importRun) {
    return NextResponse.json({ error: "Could not create import." }, { status: 500 });
  }

  if (existingImportId) {
    await supabase
      .from("catalog_imports")
      .update({ supplier_id: supplierId })
      .eq("id", existingImportId);
  }

  let productsCreated = 0;
  let productsUpdated = 0;
  let productsSkipped = 0;
  let productsRequiringReview = 0;

  for (const row of rows) {
    const issues = Array.isArray(row.issues) ? [...row.issues] : [];
    const strategy = row.duplicateStrategy || "create";
    const shouldImport = Boolean(row.include) && strategy !== "skip";

    if (!shouldImport) {
      productsSkipped += 1;
    } else {
      const isUpdate = strategy === "update" && Boolean(row.existingProductId);
      const existingProduct = isUpdate
        ? (
            await supabase
              .from("products")
              .select("id, slug, price")
              .eq("id", row.existingProductId)
              .maybeSingle()
          ).data
        : null;

      const slug = await uniqueProductSlug(
        supabase,
        row.normalizedTitle,
        existingProduct?.id
      );

      const productPayload = {
        id: existingProduct?.id,
        slug: existingProduct?.slug || slug,
        brand_slug: brandSlugFromMake(row.vehicleMake),
        category_slug: slugify(row.category || "parts"),
        title: row.normalizedTitle,
        short_description: row.description || row.normalizedTitle,
        description: row.description || row.supplierProductName,
        status: "Draft",
        price: isUpdate ? Number(existingProduct?.price ?? row.recommendedRetailPrice) : row.recommendedRetailPrice,
        compare_at_price: null,
        compatibility_summary: `${row.startYear || ""}-${row.endYear || ""} ${row.vehicleMake} ${row.vehicleModel} ${[row.vehicleChassis, ...(row.additionalChassis || [])].filter(Boolean).join(" / ")}`.trim(),
        shipping_processing_window: row.supplierProcessingTime || "2-5 Business Days",
        shipping_delivery_window: "7-18 Business Days",
        seo_title: row.normalizedTitle,
        seo_description: row.description || row.supplierProductName,
      };

      const { data: productRow, error: productError } = existingProduct
        ? await supabase
            .from("products")
            .update(productPayload)
            .eq("id", existingProduct.id)
            .select("id, slug")
            .single()
        : await supabase.from("products").insert(productPayload).select("id, slug").single();

      if (productError || !productRow) {
        issues.push(productError?.message ?? "Product import failed");
        productsRequiringReview += 1;
      } else {
        if (isUpdate) productsUpdated += 1;
        else productsCreated += 1;
        if (issues.length > 0) productsRequiringReview += 1;

        const generations = matchGenerations(row.vehicleMake, [
          row.vehicleChassis,
          ...(row.additionalChassis || []),
        ]);
        await supabase.from("product_fitments").delete().eq("product_id", productRow.id);
        if (generations.length > 0) {
          await supabase.from("product_fitments").insert(
            generations.map((generation) => ({
              product_id: productRow.id,
              generation_slug: generation.slug,
              year_start: row.startYear || generation.years[0] || 0,
              year_end: row.endYear || generation.years.at(-1) || row.startYear || 0,
              trims: row.trim ? [row.trim] : [],
              exact_fit: !row.fitmentReviewRequired,
              notes: row.supplierNotes || row.description || "",
              trim_exclusions: [],
              restrictions: row.fitmentReviewRequired ? ["FITMENT REVIEW REQUIRED"] : [],
            }))
          );
        } else if (!issues.includes("FITMENT REVIEW REQUIRED")) {
          issues.push("FITMENT REVIEW REQUIRED");
        }

        await supabase.from("product_variants").delete().eq("product_id", productRow.id);
        const providerVariants = Array.isArray(row.variants) ? row.variants : [];
        const variantSources =
          providerVariants.length > 0
            ? providerVariants.map((variant, index) => ({
                idHint: `${productRow.slug}-${index + 1}-${slugify(variant.optionValue || variant.optionName || "option")}`,
                skuHint: variant.supplierSku || `${row.supplierSku || productRow.slug}-${index + 1}`,
                material: row.material,
                finish: row.finish || variant.optionValue || "Standard",
                optionLabel: `${variant.optionName || "Option"}: ${variant.optionValue || row.finish || "Standard"}`,
                price:
                  isUpdate
                    ? Number(existingProduct?.price ?? row.recommendedRetailPrice)
                    : variant.recommendedRetailPrice || row.recommendedRetailPrice,
                supplierVariantId: variant.supplierVariantId,
                supplierSku: variant.supplierSku,
                supplierCost: variant.supplierCost,
              }))
            : [
                {
                  idHint: `${productRow.slug}-standard`,
                  skuHint: row.supplierSku || productRow.slug,
                  material: row.material,
                  finish: row.finish,
                  optionLabel: `${row.material || "Standard"} / ${row.finish || "Standard"}`,
                  price: isUpdate
                    ? Number(existingProduct?.price ?? row.recommendedRetailPrice)
                    : row.recommendedRetailPrice,
                  supplierVariantId: row.supplierSku,
                  supplierSku: row.supplierSku,
                  supplierCost: row.supplierPrice,
                },
              ];

        const usedSkus = new Set<string>();
        const variantRows: Array<{
          id: string;
          product_id: string;
          product_slug: string;
          sku: string;
          material: string;
          finish: string;
          option_label: string;
          price: number;
          compare_at_price: null;
          inventory: number;
          supplierVariantId?: string;
          supplierSku?: string;
          supplierCost?: number;
        }> = [];

        for (const source of variantSources) {
          let sku = await uniqueSku(supabase, source.skuHint);
          while (usedSkus.has(sku)) {
            sku = `${sku}-${usedSkus.size + 1}`;
          }
          usedSkus.add(sku);
          variantRows.push({
            id: source.idHint,
            product_id: productRow.id,
            product_slug: productRow.slug,
            sku,
            material: source.material,
            finish: source.finish,
            option_label: source.optionLabel,
            price: source.price,
            compare_at_price: null,
            inventory: 0,
            supplierVariantId: source.supplierVariantId,
            supplierSku: source.supplierSku,
            supplierCost: source.supplierCost,
          });
        }

        await supabase.from("product_variants").insert(
          variantRows.map((variant) => ({
            id: variant.id,
            product_id: variant.product_id,
            product_slug: variant.product_slug,
            sku: variant.sku,
            material: variant.material,
            finish: variant.finish,
            option_label: variant.option_label,
            price: variant.price,
            compare_at_price: variant.compare_at_price,
            inventory: variant.inventory,
          }))
        );

        const existingSupplier = row.existingSupplierProductId
          ? (
              await supabase
                .from("supplier_products")
                .select("id, supplier_current_price, supplier_cost")
                .eq("id", row.existingSupplierProductId)
                .maybeSingle()
            ).data
          : null;

        for (const variant of variantRows) {
          const currentCost = Number(variant.supplierCost ?? row.supplierPrice ?? 0);
          const previousCost = Number(
            existingSupplier?.supplier_current_price ?? existingSupplier?.supplier_cost ?? currentCost
          );
          await supabase.from("supplier_products").upsert(
            {
              id: variantRows.length === 1 ? row.existingSupplierProductId || undefined : undefined,
              supplier_id: supplierId,
              product_id: productRow.id,
              product_variant_id: variant.id,
              supplier_product_id: row.supplierProductId || null,
              supplier_product_url: row.supplierProductUrl || null,
              supplier_sku: variant.supplierSku || row.supplierSku || null,
              supplier_variant_id: variant.supplierVariantId || null,
              supplier_cost: currentCost,
              supplier_shipping_cost: row.supplierShippingCost || 0,
              supplier_moq: row.moq || null,
              supplier_processing_time: row.supplierProcessingTime || null,
              supplier_country: null,
              supplier_contact: null,
              customer_sale_price: Number(variant.price || row.recommendedRetailPrice || 0),
              profit_margin: row.grossMarginPercent || 0,
              shipping_estimate: "7-18 Business Days",
              internal_notes: [
                row.supplierNotes,
                ...issues,
                row.costChangeWarning,
              ]
                .filter(Boolean)
                .join("\n"),
              supplier_last_price: previousCost,
              supplier_current_price: currentCost,
              supplier_availability: "unknown",
              last_supplier_sync_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
        }

        await supabase.from("product_images").delete().eq("product_id", productRow.id);
        const imageUrls = [row.supplierImageUrl, ...(row.additionalImageUrls || [])].filter(Boolean);
        let importedImageCount = 0;
        for (let index = 0; index < imageUrls.length; index += 1) {
          try {
            const publicUrl = await importSourceImage(
              imageUrls[index],
              `${productRow.slug}/${Date.now()}-${index}`
            );
            if (publicUrl) {
              await supabase.from("product_images").insert({
                product_id: productRow.id,
                image_url: publicUrl,
                alt_text: row.normalizedTitle,
                position: index,
              });
              importedImageCount += 1;
            }
          } catch {
            // Continue importing the draft even if a source image cannot be copied.
          }
        }

        if (imageUrls.length > 0 && importedImageCount === 0) {
          issues.push("IMAGE IMPORT FAILED");
          row.imageReviewRequired = true;
        } else if (importedImageCount < imageUrls.length) {
          issues.push("IMAGE IMPORT FAILED");
          row.imageReviewRequired = true;
        }
      }
    }

    const rowPayload = {
      supplier_product_id: row.supplierProductId || null,
      supplier_product_name: row.supplierProductName,
      supplier_sku: row.supplierSku,
      supplier_price: row.supplierPrice,
      supplier_shipping_cost: row.supplierShippingCost,
      supplier_product_url: row.supplierProductUrl,
      supplier_image_url: row.supplierImageUrl,
      additional_image_urls: row.additionalImageUrls || [],
      vehicle_make: row.vehicleMake,
      vehicle_model: row.vehicleModel,
      vehicle_chassis: row.vehicleChassis,
      start_year: row.startYear,
      end_year: row.endYear,
      trim: row.trim,
      category: row.category,
      material: row.material,
      finish: row.finish,
      description: row.description,
      moq: row.moq,
      supplier_processing_time: row.supplierProcessingTime,
      supplier_notes: row.supplierNotes,
      landed_cost: row.landedCost,
      recommended_retail_price: row.recommendedRetailPrice,
      gross_profit: row.grossProfit,
      gross_margin_percent: row.grossMarginPercent,
      markup_percent: row.markupPercent,
      normalized_title: row.normalizedTitle,
      status: row.status,
      issues,
      duplicate_strategy: row.duplicateStrategy,
      existing_product_id: row.existingProductId || null,
      existing_supplier_product_id: row.existingSupplierProductId || null,
      supplier_variant_id: row.variants?.[0]?.supplierVariantId || null,
      fitment_review_required: row.fitmentReviewRequired,
      image_review_required: row.imageReviewRequired,
      imported: shouldImport && !issues.includes("Product import failed"),
    };

    if (row.catalogImportRowId) {
      await supabase.from("catalog_import_rows").update(rowPayload).eq("id", row.catalogImportRowId);
    } else {
      await supabase.from("catalog_import_rows").insert({
        import_id: importRun.id,
        ...rowPayload,
      });
    }
  }

  await supabase
    .from("catalog_imports")
    .update({
      products_created: productsCreated,
      products_updated: productsUpdated,
      products_skipped: productsSkipped,
      products_requiring_review: productsRequiringReview,
    })
    .eq("id", importRun.id);

  return NextResponse.json({
    importId: importRun.id,
    stats: {
      productsCreated,
      productsUpdated,
      productsSkipped,
      productsRequiringReview,
    },
  });
}
