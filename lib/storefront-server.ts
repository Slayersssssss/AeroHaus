import "server-only";

import { products as fallbackProducts } from "@/lib/public-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getBrandBySlug,
  getProductBySlug,
} from "@/lib/store";
import type { Product, ProductFitment, ProductVariant } from "@/lib/types";

type ProductRow = {
  id: string;
  brand_slug: string;
  category_slug: string | null;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  status: Product["status"];
  price: number;
  compare_at_price: number | null;
  compatibility_summary: string | null;
  shipping_processing_window: string | null;
  shipping_delivery_window: string | null;
};

type ProductVariantRow = {
  id: string;
  product_id: string | null;
  product_slug: string | null;
  sku: string;
  material: string | null;
  finish: string | null;
  option_label: string | null;
  price: number;
  compare_at_price: number | null;
  inventory: number;
};

type ProductFitmentRow = {
  product_id: string;
  generation_slug: string;
  year_start: number;
  year_end: number;
  trims: string[] | null;
  exact_fit: boolean;
  notes: string | null;
  trim_exclusions: string[] | null;
  restrictions: string[] | null;
};

type ProductImageRow = {
  product_id: string;
  image_url: string;
  position: number;
};

function categoryNameFromSlug(slug: string | null, fallback: Product | undefined) {
  if (fallback) {
    return fallback.categoryName;
  }

  return slug
    ? slug
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : "Parts";
}

function brandNameFromSlug(slug: string, fallback: Product | undefined) {
  return fallback?.brandName ?? getBrandBySlug(slug)?.name ?? slug;
}

function mapVariants(rows: ProductVariantRow[], fallback: Product | undefined): ProductVariant[] {
  if (rows.length === 0) {
    return fallback?.variants ?? [];
  }

  return rows.map((row) => ({
    id: row.id,
    sku: row.sku,
    material: row.material ?? fallback?.materialOptions[0] ?? "Standard",
    finish: row.finish ?? fallback?.finishOptions[0] ?? "Standard",
    optionLabel: row.option_label ?? `${row.material ?? "Standard"} / ${row.finish ?? "Standard"}`,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : undefined,
    inventory: row.inventory,
  }));
}

function mapFitments(rows: ProductFitmentRow[], fallback: Product | undefined): ProductFitment[] {
  if (rows.length === 0) {
    return fallback?.fitments ?? [];
  }

  return rows.map((row) => ({
    generationSlug: row.generation_slug,
    yearStart: row.year_start,
    yearEnd: row.year_end,
    trims: row.trims ?? [],
    exact: row.exact_fit,
    notes: row.notes ?? "",
    exclusions: row.trim_exclusions ?? [],
    requires: row.restrictions ?? [],
  }));
}

function hydrateProduct(
  row: ProductRow,
  variants: ProductVariantRow[],
  fitments: ProductFitmentRow[],
  images: ProductImageRow[]
): Product {
  const fallback = getProductBySlug(row.slug);
  const mergedVariants = mapVariants(variants, fallback);
  const mergedFitments = mapFitments(fitments, fallback);
  const gallery =
    images.length > 0
      ? images
          .sort((a, b) => a.position - b.position)
          .map((image) => image.image_url)
      : fallback?.gallery ?? ["/assets/page-generic.svg"];

  return {
    id: row.id,
    slug: row.slug,
    brandSlug: row.brand_slug as Product["brandSlug"],
    brandName: brandNameFromSlug(row.brand_slug, fallback),
    categorySlug: (row.category_slug ?? fallback?.categorySlug ?? "exterior-styling-accessories") as Product["categorySlug"],
    categoryName: categoryNameFromSlug(row.category_slug, fallback),
    title: row.title,
    shortDescription: row.short_description ?? fallback?.shortDescription ?? row.title,
    description: row.description ?? fallback?.description ?? row.title,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : fallback?.compareAtPrice,
    status: row.status ?? fallback?.status ?? "Active",
    badges: fallback?.badges ?? [],
    rating: fallback?.rating ?? 5,
    reviewCount: fallback?.reviewCount ?? 0,
    featured: fallback?.featured ?? false,
    bestSeller: fallback?.bestSeller ?? false,
    newArrival: fallback?.newArrival ?? false,
    materialOptions: [...new Set(mergedVariants.map((variant) => variant.material))],
    finishOptions: [...new Set(mergedVariants.map((variant) => variant.finish))],
    gallery,
    compatibilitySummary:
      row.compatibility_summary ?? fallback?.compatibilitySummary ?? row.title,
    fitments: mergedFitments,
    variants: mergedVariants,
    shippingWindow: {
      processingBusinessDays:
        row.shipping_processing_window ??
        fallback?.shippingWindow.processingBusinessDays ??
        "2-5 Business Days",
      deliveryBusinessDays:
        row.shipping_delivery_window ??
        fallback?.shippingWindow.deliveryBusinessDays ??
        "7-18 Business Days",
    },
    installation:
      fallback?.installation ?? "Professional installation recommended.",
    whatsIncluded: fallback?.whatsIncluded ?? ["Part(s) as listed"],
    faq: fallback?.faq ?? [],
    relatedSlugs: fallback?.relatedSlugs ?? [],
  };
}

async function fetchLiveProducts(): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return fallbackProducts;
  }

  const { data: productRows, error } = await supabase
    .from("products")
    .select(
      "id, brand_slug, category_slug, slug, title, short_description, description, status, price, compare_at_price, compatibility_summary, shipping_processing_window, shipping_delivery_window"
    )
    .order("title");

  if (error || !productRows || productRows.length === 0) {
    return fallbackProducts;
  }

  const productIds = productRows.map((row) => row.id);

  const [{ data: variantRows }, { data: fitmentRows }, { data: imageRows }] =
    await Promise.all([
      supabase
        .from("product_variants")
        .select(
          "id, product_id, product_slug, sku, material, finish, option_label, price, compare_at_price, inventory"
        )
        .in("product_id", productIds),
      supabase
        .from("product_fitments")
        .select(
          "product_id, generation_slug, year_start, year_end, trims, exact_fit, notes, trim_exclusions, restrictions"
        )
        .in("product_id", productIds),
      supabase
        .from("product_images")
        .select("product_id, image_url, position")
        .in("product_id", productIds),
    ]);

  return (productRows as ProductRow[]).map((row) =>
    hydrateProduct(
      row,
      ((variantRows as ProductVariantRow[] | null) ?? []).filter(
        (variant) => variant.product_id === row.id
      ),
      ((fitmentRows as ProductFitmentRow[] | null) ?? []).filter(
        (fitment) => fitment.product_id === row.id
      ),
      ((imageRows as ProductImageRow[] | null) ?? []).filter(
        (image) => image.product_id === row.id
      )
    )
  );
}

export async function getStorefrontProducts() {
  return fetchLiveProducts();
}

export async function getStorefrontProductBySlug(slug: string) {
  const items = await fetchLiveProducts();
  return items.find((item) => item.slug === slug);
}

export async function getStorefrontProductsForBrand(brandSlug: Product["brandSlug"]) {
  const items = await fetchLiveProducts();
  return items.filter((item) => item.brandSlug === brandSlug);
}

export async function getStorefrontProductsForGeneration(generationSlug: string) {
  const items = await fetchLiveProducts();
  return items.filter((item) =>
    item.fitments.some((fitment) => fitment.generationSlug === generationSlug)
  );
}

export async function getStorefrontRelatedProducts(product: Product) {
  const items = await fetchLiveProducts();
  return items.filter((item) => product.relatedSlugs.includes(item.slug));
}

export async function getAccountOrders(userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, subtotal, created_at, order_items(product_title, quantity, unit_price)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getOrderByNumber(orderNumber: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("orders")
    .select(
      "id, order_number, email, status, subtotal, payment_processing_fees, created_at, order_items(product_id, product_variant_id, product_title, sku, quantity, unit_price, supplier_cost, supplier_shipping_cost)"
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  return data;
}
