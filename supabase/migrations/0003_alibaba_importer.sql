alter table public.catalog_imports
  add column if not exists provider text,
  add column if not exists source_url text,
  add column if not exists fetch_started_at timestamptz,
  add column if not exists fetch_completed_at timestamptz,
  add column if not exists pages_fetched integer not null default 0,
  add column if not exists products_found integer not null default 0,
  add column if not exists failed_products integer not null default 0,
  add column if not exists error_message text;

alter table public.catalog_import_rows
  add column if not exists supplier_product_id text,
  add column if not exists supplier_variant_id text,
  add column if not exists raw_provider_response jsonb;

alter table public.supplier_products
  add column if not exists supplier_product_id text,
  add column if not exists last_supplier_sync_at timestamptz,
  add column if not exists supplier_last_price numeric(12,2),
  add column if not exists supplier_current_price numeric(12,2),
  add column if not exists supplier_availability text;
