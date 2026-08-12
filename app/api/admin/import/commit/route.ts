import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthContext } from "@/lib/supabase/auth";
import { slugify } from "@/lib/utils";

async function ensureProductImageBucket() {
  const supabase = createSupabaseAdminClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((bucket) => bucket.name === "product-images")) {
    await supabase.storage.createBucket("product-images", { public: true });
  }
}

async function importImage(url: string, pathPrefix: string) {
  if (!url) return null;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not download image: ${url}`);
  }
  const contentType = response.headers.get("content-type") || "image/jpeg";
  const extension =
    contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const arrayBuffer = await response.arrayBuffer();
  const filePath = `${pathPrefix}.${extension}`;
  const supabase = createSupabaseAdminClient();
  const upload = await supabase.storage
    .from("product-images")
    .upload(filePath, arrayBuffer, { contentType, upsert: true });
  if (upload.error) {
    throw upload.error;
  }
  return supabase.storage.from("product-images").getPublicUrl(filePath).data.publicUrl;
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth.user || auth.profile?.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const rows = Array.isArray(body.rows) ? body.rows : [];
  const supplierId = typeof body.supplierId === "string" ? body.supplierId : "";
  const filename = typeof body.filename === "string" ? body.filename : "import.csv";
  const fileType = typeof body.fileType === "string" ? body.fileType : "csv";
  const supabase = createSupabaseAdminClient();

  await ensureProductImageBucket();

  const { data: importRun, error: importError } = await supabase
    .from("catalog_imports")
    .insert({
      supplier_id: supplierId,
      filename,
      file_type: fileType,
      row_count: rows.length,
      imported_by: auth.user.id,
    })
    .select("id")
    .single();

  if (importError || !importRun) {
    return NextResponse.json({ error: importError?.message ?? "Could not create import." }, { status: 500 });
  }

  let productsCreated = 0;
  let productsUpdated = 0;
  let productsSkipped = 0;
  let productsRequiringReview = 0;

  for (const row of rows) {
    const issues = Array.isArray(row.issues) ? row.issues : [];
    const shouldImport = Boolean(row.include);
    if (!shouldImport) {
      productsSkipped += 1;
    } else if (issues.length > 0) {
      productsRequiringReview += 1;
    } else {
      const strategy = row.duplicateStrategy || "create";
      const productPayload = {
        id: strategy === "update" ? row.existingProductId || undefined : undefined,
        slug: slugify(row.normalizedTitle),
        brand_slug: slugify(row.vehicleMake).replace(/^mercedes-benz$/, "mercedes-benz"),
        category_slug: slugify(row.category),
        title: row.normalizedTitle,
        short_description: row.description || row.normalizedTitle,
        description: row.description || row.supplierProductName,
        status: "Draft",
        price: row.recommendedRetailPrice,
        compare_at_price: null,
        compatibility_summary: `${row.startYear || ""}-${row.endYear || ""} ${row.vehicleMake} ${row.vehicleModel} ${row.vehicleChassis}`.trim(),
        shipping_processing_window: row.supplierProcessingTime || "2-5 Business Days",
        shipping_delivery_window: "7-18 Business Days",
        seo_title: row.normalizedTitle,
        seo_description: row.description || row.supplierProductName,
      };

      const { data: productRow, error: productError } = await supabase
        .from("products")
        .upsert(productPayload, { onConflict: "slug" })
        .select("id, slug")
        .single();

      if (productError || !productRow) {
        issues.push(productError?.message ?? "Product import failed");
        productsRequiringReview += 1;
      } else {
        if (strategy === "update") productsUpdated += 1;
        else productsCreated += 1;

        const generationMatch = row.vehicleChassis
          ? await supabase
              .from("vehicle_generations")
              .select("slug")
              .ilike("chassis_label", row.vehicleChassis)
              .limit(1)
              .maybeSingle()
          : { data: null };

        await supabase.from("product_fitments").delete().eq("product_id", productRow.id);
        await supabase.from("product_fitments").insert({
          product_id: productRow.id,
          generation_slug: generationMatch.data?.slug ?? row.vehicleChassis.toLowerCase(),
          year_start: row.startYear || 0,
          year_end: row.endYear || row.startYear || 0,
          trims: row.trim ? [row.trim] : [],
          exact_fit: !row.fitmentReviewRequired,
          notes: row.supplierNotes || row.description || "",
          trim_exclusions: [],
          restrictions: row.fitmentReviewRequired ? ["Fitment Review Required"] : [],
        });

        const variantId = `${productRow.slug}-${slugify(row.supplierSku || row.normalizedTitle)}`;
        await supabase.from("product_variants").delete().eq("product_id", productRow.id);
        await supabase.from("product_variants").insert({
          id: variantId,
          product_id: productRow.id,
          product_slug: productRow.slug,
          sku: row.supplierSku,
          material: row.material,
          finish: row.finish,
          option_label: `${row.material || "Standard"} / ${row.finish || "Standard"}`,
          price: row.recommendedRetailPrice,
          compare_at_price: null,
          inventory: 0,
        });

        await supabase.from("supplier_products").upsert(
          {
            id: row.existingSupplierProductId || undefined,
            supplier_id: supplierId,
            product_id: productRow.id,
            product_variant_id: variantId,
            supplier_product_url: row.supplierProductUrl || null,
            supplier_sku: row.supplierSku || null,
            supplier_variant_id: row.supplierSku || null,
            supplier_cost: row.supplierPrice || 0,
            supplier_shipping_cost: row.supplierShippingCost || 0,
            supplier_moq: row.moq || null,
            supplier_processing_time: row.supplierProcessingTime || null,
            supplier_country: null,
            supplier_contact: null,
            customer_sale_price: row.recommendedRetailPrice || 0,
            profit_margin: row.grossMarginPercent || 0,
            shipping_estimate: "7-18 Business Days",
            internal_notes: row.supplierNotes || null,
          },
          { onConflict: "id" }
        );

        await supabase.from("product_images").delete().eq("product_id", productRow.id);
        const imageUrls = [row.supplierImageUrl, ...(row.additionalImageUrls || [])].filter(Boolean);
        let imageReviewRequired = false;
        for (let index = 0; index < imageUrls.length; index += 1) {
          try {
            const publicUrl = await importImage(
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
            }
          } catch {
            imageReviewRequired = true;
          }
        }

        row.imageReviewRequired = imageReviewRequired;
      }
    }

    await supabase.from("catalog_import_rows").insert({
      import_id: importRun.id,
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
      issues: issues,
      duplicate_strategy: row.duplicateStrategy,
      existing_product_id: row.existingProductId || null,
      existing_supplier_product_id: row.existingSupplierProductId || null,
      fitment_review_required: row.fitmentReviewRequired,
      image_review_required: row.imageReviewRequired,
      imported: shouldImport && issues.length === 0,
    });
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
