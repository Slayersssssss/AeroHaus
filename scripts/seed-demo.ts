import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { defaultPricingSettings } from "@/lib/importer";
import { builds, brands, products, vehicleGenerations } from "@/lib/store";
import { supplierRecords } from "@/lib/private-data";

async function main() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables for seeding.');
    process.exit(1);
  }

  const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  await supabase
    .from('vehicle_makes')
    .upsert(brands.map((brand) => ({ slug: brand.slug, name: brand.name })), { onConflict: 'slug' });

  await supabase
    .from('categories')
    .upsert(
      Array.from(
        new Map(
          products.map((product) => [
            product.categorySlug,
            { slug: product.categorySlug, name: product.categoryName },
          ])
        ).values()
      ),
      { onConflict: 'slug' }
    );

  await supabase
    .from('vehicle_generations')
    .upsert(
      vehicleGenerations.map((generation) => ({
        slug: generation.slug,
        make_slug: generation.makeSlug,
        model_slug: generation.modelSlug,
        name: generation.name,
        chassis_label: generation.chassisLabel,
        year_start: generation.years[0],
        year_end: generation.years[generation.years.length - 1],
        notes: generation.notes ?? null,
      })),
      { onConflict: 'slug' }
    );

  await supabase
    .from('products')
    .upsert(
      products.map((product) => ({
        slug: product.slug,
        brand_slug: product.brandSlug,
        title: product.title,
        category_slug: product.categorySlug,
        short_description: product.shortDescription,
        description: product.description,
        status: product.status,
        price: product.price,
        compare_at_price: product.compareAtPrice ?? null,
        compatibility_summary: product.compatibilitySummary,
        shipping_processing_window: product.shippingWindow.processingBusinessDays,
        shipping_delivery_window: product.shippingWindow.deliveryBusinessDays,
        seo_title: product.title,
        seo_description: product.shortDescription,
      })),
      { onConflict: 'slug' }
    );

  const { data: persistedProducts, error: productsError } = await supabase
    .from('products')
    .select('id, slug')
    .in('slug', products.map((product) => product.slug));

  if (productsError || !persistedProducts) {
    throw productsError ?? new Error('Could not load persisted products');
  }

  const productIdBySlug = new Map(persistedProducts.map((row) => [row.slug, row.id]));

  await supabase
    .from('product_variants')
    .upsert(
      products.flatMap((product) =>
        product.variants.map((variant) => ({
          id: variant.id,
          product_id: productIdBySlug.get(product.slug),
          product_slug: product.slug,
          sku: variant.sku,
          material: variant.material,
          finish: variant.finish,
          option_label: variant.optionLabel,
          price: variant.price,
          compare_at_price: variant.compareAtPrice ?? null,
          inventory: variant.inventory,
        }))
      ),
      { onConflict: 'id' }
    );

  await supabase
    .from('product_fitments')
    .delete()
    .in('product_id', persistedProducts.map((row) => row.id));

  await supabase.from('product_fitments').insert(
    products.flatMap((product) =>
      product.fitments.map((fitment) => ({
        product_id: productIdBySlug.get(product.slug),
        generation_slug: fitment.generationSlug,
        year_start: fitment.yearStart,
        year_end: fitment.yearEnd,
        trims: fitment.trims,
        exact_fit: fitment.exact,
        notes: fitment.notes,
        trim_exclusions: fitment.exclusions ?? [],
        restrictions: fitment.requires ?? [],
      }))
    )
  );

  await supabase
    .from('product_images')
    .delete()
    .in('product_id', persistedProducts.map((row) => row.id));

  await supabase.from('product_images').insert(
    products.flatMap((product) =>
      product.gallery.map((imageUrl, index) => ({
        product_id: productIdBySlug.get(product.slug),
        image_url: imageUrl,
        alt_text: product.title,
        position: index,
      }))
    )
  );

  await supabase
    .from('builds')
    .upsert(
      builds.map((build) => ({
        slug: build.slug,
        title: build.title,
        vehicle_label: build.vehicleLabel,
        description: build.description,
        hero_image: build.heroImage,
      })),
      { onConflict: 'slug' }
    );

  const { data: persistedBuilds } = await supabase
    .from('builds')
    .select('id, slug')
    .in('slug', builds.map((build) => build.slug));

  const buildIdBySlug = new Map((persistedBuilds ?? []).map((row) => [row.slug, row.id]));

  await supabase
    .from('build_products')
    .delete()
    .in('build_id', (persistedBuilds ?? []).map((row) => row.id));

  await supabase.from('build_products').insert(
    builds.flatMap((build) =>
      build.productSlugs.map((productSlug) => ({
        build_id: buildIdBySlug.get(build.slug),
        product_id: productIdBySlug.get(productSlug),
      }))
    )
  );

  await supabase
    .from('suppliers')
    .upsert(
      [
        ...Array.from(
          new Map(
            supplierRecords.map((record) => [
              record.supplierName,
              {
                name: record.supplierName,
                country: record.supplierCountry,
                contact_email: record.supplierContact,
              },
            ])
          ).values()
        ),
        {
          name: 'Guangzhou Carbon Factory',
          country: 'China',
          contact_name: 'Lina Chen',
          contact_email: 'sales@guangzhoucarbon.example',
          phone: '+86-20-5555-0199',
          whatsapp: '+86-13800000000',
          website: 'https://guangzhoucarbon.example',
          alibaba_store_url: 'https://supplier.example/guangzhou-carbon-factory',
          currency: 'USD',
          default_processing_days: 5,
          notes: 'Sample supplier for importer workflow demonstrations.',
        },
      ],
      { onConflict: 'name' }
    );

  const { data: existingPricingSetting } = await supabase
    .from('pricing_settings')
    .select('id')
    .eq('name', 'Default Pricing Rules')
    .maybeSingle();

  await supabase.from('pricing_settings').upsert({
    id: existingPricingSetting?.id,
    name: 'Default Pricing Rules',
    rules: defaultPricingSettings.rules,
    minimum_gross_margin: defaultPricingSettings.minimumGrossMargin,
    rounding_mode: defaultPricingSettings.roundingMode,
  });

  const { data: suppliers } = await supabase.from('suppliers').select('id, name');
  const supplierIdByName = new Map((suppliers ?? []).map((row) => [row.name, row.id]));

  await supabase
    .from('supplier_products')
    .delete()
    .in('product_id', persistedProducts.map((row) => row.id));

  await supabase.from('supplier_products').insert(
    supplierRecords.map((record) => ({
      supplier_id: supplierIdByName.get(record.supplierName),
      product_id: productIdBySlug.get(record.productSlug),
      product_variant_id: record.variantId,
      supplier_product_url: record.supplierProductUrl,
      supplier_sku: record.supplierSku,
      supplier_variant_id: record.supplierVariantId,
      supplier_cost: record.supplierCost,
      supplier_shipping_cost: record.supplierShippingCost,
      supplier_moq: record.supplierMOQ,
      supplier_processing_time: record.supplierProcessingTime,
      supplier_country: record.supplierCountry,
      supplier_contact: record.supplierContact,
      customer_sale_price: record.customerSalePrice,
      shipping_estimate: record.shippingEstimate,
      tracking_number: record.trackingNumber ?? null,
      internal_notes: record.internalNotes,
    }))
  );

  const { data: customerProfile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', 'customer.test@aerohaus.dev')
    .maybeSingle();

  if (customerProfile) {
    await supabase
      .from('orders')
      .upsert(
        [
          {
            user_id: customerProfile.id,
            order_number: 'AH-100310',
            email: customerProfile.email,
            status: 'Paid',
            subtotal: 678,
            shipping_total: 0,
            discount_total: 0,
            refund_total: 0,
            payment_processing_fees: 24,
            advertising_cost: 18,
            notes: 'Seeded sample customer order',
          },
        ],
        { onConflict: 'order_number' }
      );

    const { data: orderRow } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', 'AH-100310')
      .single();

    if (orderRow) {
      await supabase.from('order_items').delete().eq('order_id', orderRow.id);
      await supabase.from('order_items').insert([
        {
          order_id: orderRow.id,
          product_id: productIdBySlug.get('bmw-g80-g82-v-style-dry-carbon-front-lip'),
          product_variant_id: 'var_g8x_v_style_gloss',
          product_title: 'BMW G80 / G82 V Style Dry Carbon Front Lip',
          sku: 'AH-G8X-VLIP-DCF-GLS',
          quantity: 1,
          unit_price: 629,
          supplier_cost: 248,
          supplier_shipping_cost: 88,
        },
        {
          order_id: orderRow.id,
          product_id: productIdBySlug.get('g20-m340i-carbon-mirror-caps'),
          product_variant_id: 'var_g20_mirror_gloss',
          product_title: 'BMW G20 M340i Carbon Mirror Caps',
          sku: 'AH-G20-MCAP-CF-GLS',
          quantity: 1,
          unit_price: 229,
          supplier_cost: 0,
          supplier_shipping_cost: 0,
        },
      ]);
    }
  }

  console.log('Demo seed completed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
