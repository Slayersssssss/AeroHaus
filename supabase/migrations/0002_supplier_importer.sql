alter table public.suppliers
  add column if not exists phone text,
  add column if not exists whatsapp text,
  add column if not exists website text,
  add column if not exists alibaba_store_url text,
  add column if not exists currency text default 'USD',
  add column if not exists default_processing_days integer,
  add column if not exists notes text;

create table if not exists public.supplier_mapping_templates (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  name text not null,
  mapping jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pricing_settings (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Default Pricing Rules',
  rules jsonb not null default '[]'::jsonb,
  minimum_gross_margin numeric(8,2) not null default 55,
  rounding_mode text not null default 'nearest-9',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_imports (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references public.suppliers(id) on delete set null,
  filename text not null,
  file_type text,
  row_count integer not null default 0,
  products_created integer not null default 0,
  products_updated integer not null default 0,
  products_skipped integer not null default 0,
  products_requiring_review integer not null default 0,
  imported_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_import_rows (
  id uuid primary key default gen_random_uuid(),
  import_id uuid not null references public.catalog_imports(id) on delete cascade,
  supplier_product_name text,
  supplier_sku text,
  supplier_price numeric(12,2),
  supplier_shipping_cost numeric(12,2),
  supplier_product_url text,
  supplier_image_url text,
  additional_image_urls text[] not null default '{}',
  vehicle_make text,
  vehicle_model text,
  vehicle_chassis text,
  start_year integer,
  end_year integer,
  trim text,
  category text,
  material text,
  finish text,
  description text,
  moq integer,
  supplier_processing_time text,
  supplier_notes text,
  landed_cost numeric(12,2),
  recommended_retail_price numeric(12,2),
  gross_profit numeric(12,2),
  gross_margin_percent numeric(8,2),
  markup_percent numeric(8,2),
  normalized_title text,
  status text not null default 'review',
  issues text[] not null default '{}',
  duplicate_strategy text default 'skip',
  existing_product_id uuid references public.products(id) on delete set null,
  existing_supplier_product_id uuid references public.supplier_products(id) on delete set null,
  fitment_review_required boolean not null default false,
  image_review_required boolean not null default false,
  imported boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.supplier_mapping_templates enable row level security;
alter table public.pricing_settings enable row level security;
alter table public.catalog_imports enable row level security;
alter table public.catalog_import_rows enable row level security;

create policy "admins manage mapping templates" on public.supplier_mapping_templates
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "admins manage pricing settings" on public.pricing_settings
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "admins manage catalog imports" on public.catalog_imports
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "admins manage catalog import rows" on public.catalog_import_rows
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create trigger set_supplier_mapping_templates_updated_at
before update on public.supplier_mapping_templates
for each row execute procedure public.set_updated_at();

create trigger set_pricing_settings_updated_at
before update on public.pricing_settings
for each row execute procedure public.set_updated_at();

create trigger set_catalog_imports_updated_at
before update on public.catalog_imports
for each row execute procedure public.set_updated_at();

create trigger set_catalog_import_rows_updated_at
before update on public.catalog_import_rows
for each row execute procedure public.set_updated_at();
