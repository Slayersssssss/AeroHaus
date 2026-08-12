import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { brands, products, vehicleGenerations } from "@/lib/store";
import { supplierRecords } from "@/lib/private-data";

async function main() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables for seeding.');
    process.exit(1);
  }

  const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  await supabase.from('vehicle_makes').upsert(brands.map((brand) => ({ slug: brand.slug, name: brand.name })));
  await supabase.from('vehicle_generations').upsert(vehicleGenerations.map((generation) => ({ slug: generation.slug, make_slug: generation.makeSlug, model_slug: generation.modelSlug, name: generation.name, chassis_label: generation.chassisLabel, year_start: generation.years[0], year_end: generation.years[generation.years.length - 1], notes: generation.notes ?? null })));
  await supabase.from('products').upsert(products.map((product) => ({ slug: product.slug, brand_slug: product.brandSlug, title: product.title, category_slug: product.categorySlug, short_description: product.shortDescription, description: product.description, status: product.status, price: product.price, compare_at_price: product.compareAtPrice ?? null, compatibility_summary: product.compatibilitySummary, shipping_processing_window: product.shippingWindow.processingBusinessDays, shipping_delivery_window: product.shippingWindow.deliveryBusinessDays })));
  await supabase.from('product_variants').upsert(products.flatMap((product) => product.variants.map((variant) => ({ id: variant.id, product_slug: product.slug, sku: variant.sku, material: variant.material, finish: variant.finish, option_label: variant.optionLabel, price: variant.price, compare_at_price: variant.compareAtPrice ?? null, inventory: variant.inventory }))));
  await supabase.from('suppliers').upsert(Array.from(new Map(supplierRecords.map((record) => [record.supplierName, { name: record.supplierName, country: record.supplierCountry, contact_email: record.supplierContact }])).values()));
  console.log('Demo seed completed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
