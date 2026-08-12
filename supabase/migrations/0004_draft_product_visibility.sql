drop policy if exists "public read products" on public.products;
create policy "public read published products" on public.products
  for select using (status in ('Active', 'Out of Stock', 'Preorder'));

drop policy if exists "public read product images" on public.product_images;
create policy "public read published product images" on public.product_images
  for select using (
    exists (
      select 1
      from public.products
      where products.id = product_images.product_id
        and products.status in ('Active', 'Out of Stock', 'Preorder')
    )
  );

drop policy if exists "public read product variants" on public.product_variants;
create policy "public read published product variants" on public.product_variants
  for select using (
    exists (
      select 1
      from public.products
      where products.id = product_variants.product_id
        and products.status in ('Active', 'Out of Stock', 'Preorder')
    )
  );

drop policy if exists "public read fitments" on public.product_fitments;
create policy "public read published fitments" on public.product_fitments
  for select using (
    exists (
      select 1
      from public.products
      where products.id = product_fitments.product_id
        and products.status in ('Active', 'Out of Stock', 'Preorder')
    )
  );
