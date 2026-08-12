"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

type VariantInput = {
  id?: string;
  sku: string;
  material: string;
  finish: string;
  optionLabel: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
};

type FitmentInput = {
  generationSlug: string;
  yearStart: number;
  yearEnd: number;
  trims: string[];
  exact: boolean;
  notes: string;
  exclusions?: string[];
  requires?: string[];
};

function parseJsonField<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }
  return JSON.parse(value) as T;
}

function revalidateAdminAndStorefront(productSlug?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  if (productSlug) {
    revalidatePath(`/products/${productSlug}`);
  }
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const existingId = String(formData.get("id") ?? "").trim() || null;
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || title);
  const brandSlug = String(formData.get("brandSlug") ?? "").trim();
  const categorySlug = String(formData.get("categorySlug") ?? "").trim();
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "Draft").trim();
  const price = Number(formData.get("price") ?? 0);
  const compareAtPriceRaw = String(formData.get("compareAtPrice") ?? "").trim();
  const compatibilitySummary = String(formData.get("compatibilitySummary") ?? "").trim();
  const processingWindow = String(formData.get("processingWindow") ?? "").trim();
  const deliveryWindow = String(formData.get("deliveryWindow") ?? "").trim();
  const galleryUrls = String(formData.get("galleryUrls") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const variants = parseJsonField<VariantInput[]>(formData.get("variantsJson"), []);
  const fitments = parseJsonField<FitmentInput[]>(formData.get("fitmentsJson"), []);

  const upsertPayload = {
    ...(existingId ? { id: existingId } : {}),
    slug,
    brand_slug: brandSlug,
    category_slug: categorySlug,
    title,
    short_description: shortDescription,
    description,
    status,
    price,
    compare_at_price: compareAtPriceRaw ? Number(compareAtPriceRaw) : null,
    compatibility_summary: compatibilitySummary,
    shipping_processing_window: processingWindow,
    shipping_delivery_window: deliveryWindow,
    seo_title: title,
    seo_description: shortDescription,
  };

  const { data: savedProduct, error: productError } = await supabase
    .from("products")
    .upsert(upsertPayload, { onConflict: "slug" })
    .select("id, slug")
    .single();

  if (productError || !savedProduct) {
    throw productError ?? new Error("Could not save product.");
  }

  const productId = savedProduct.id;

  await supabase.from("product_images").delete().eq("product_id", productId);
  if (galleryUrls.length > 0) {
    await supabase.from("product_images").insert(
      galleryUrls.map((imageUrl, index) => ({
        product_id: productId,
        image_url: imageUrl,
        alt_text: title,
        position: index,
      }))
    );
  }

  await supabase.from("product_fitments").delete().eq("product_id", productId);
  if (fitments.length > 0) {
    await supabase.from("product_fitments").insert(
      fitments.map((fitment) => ({
        product_id: productId,
        generation_slug: fitment.generationSlug,
        year_start: fitment.yearStart,
        year_end: fitment.yearEnd,
        trims: fitment.trims,
        exact_fit: fitment.exact,
        notes: fitment.notes,
        trim_exclusions: fitment.exclusions ?? [],
        restrictions: fitment.requires ?? [],
      }))
    );
  }

  await supabase.from("product_variants").delete().eq("product_id", productId);
  if (variants.length > 0) {
    await supabase.from("product_variants").insert(
      variants.map((variant) => ({
        id: variant.id || `${slug}-${slugify(variant.optionLabel || variant.sku)}`,
        product_id: productId,
        product_slug: slug,
        sku: variant.sku,
        material: variant.material,
        finish: variant.finish,
        option_label: variant.optionLabel,
        price: Number(variant.price),
        compare_at_price: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
        inventory: Number(variant.inventory ?? 0),
      }))
    );
  }

  revalidateAdminAndStorefront(slug);
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const productId = String(formData.get("id") ?? "").trim();
  const productSlug = String(formData.get("slug") ?? "").trim();

  if (!productId) {
    throw new Error("Missing product id.");
  }

  await supabase.from("product_images").delete().eq("product_id", productId);
  await supabase.from("product_fitments").delete().eq("product_id", productId);
  await supabase.from("product_variants").delete().eq("product_id", productId);
  await supabase.from("supplier_products").delete().eq("product_id", productId);
  await supabase.from("build_products").delete().eq("product_id", productId);
  await supabase.from("products").delete().eq("id", productId);

  revalidateAdminAndStorefront(productSlug);
}
