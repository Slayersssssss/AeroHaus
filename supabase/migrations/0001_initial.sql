create extension if not exists pgcrypto;

create type public.app_role as enum ('customer', 'admin');
create type public.order_status as enum ('Pending', 'Paid', 'Processing', 'Ordered From Supplier', 'Supplier Processing', 'Shipped', 'In Transit', 'Delivered', 'Cancelled', 'Refunded');
create type public.product_status as enum ('Draft', 'Active', 'Out of Stock', 'Preorder', 'Archived');
create type public.return_status as enum ('Submitted', 'Approved', 'Rejected', 'More Information Requested', 'Refund Issued');

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role public.app_role not null default 'customer',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin(user_id uuid) returns boolean language sql stable as $$
  select exists(select 1 from public.profiles where id = user_id and role = 'admin');
$$;

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text,
  first_name text,
  last_name text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  postal_code text,
  country text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicle_makes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicle_models (
  id uuid primary key default gen_random_uuid(),
  make_id uuid references public.vehicle_makes(id) on delete cascade,
  make_slug text,
  slug text not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (make_slug, slug)
);

create table if not exists public.vehicle_generations (
  id uuid primary key default gen_random_uuid(),
  make_slug text not null,
  model_slug text not null,
  slug text unique not null,
  name text not null,
  chassis_label text not null,
  year_start integer not null,
  year_end integer not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicle_years (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid references public.vehicle_generations(id) on delete cascade,
  year integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  make_slug text not null,
  model_slug text not null,
  generation_slug text not null,
  year integer not null,
  trim text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  brand_slug text not null,
  category_slug text,
  slug text unique not null,
  title text not null,
  short_description text,
  description text,
  status public.product_status not null default 'Draft',
  price numeric(12,2) not null,
  compare_at_price numeric(12,2),
  compatibility_summary text,
  shipping_processing_window text,
  shipping_delivery_window text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id text primary key,
  product_id uuid references public.products(id) on delete cascade,
  product_slug text,
  sku text unique not null,
  material text,
  finish text,
  option_label text,
  price numeric(12,2) not null,
  compare_at_price numeric(12,2),
  inventory integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_fitments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  generation_slug text not null,
  year_start integer not null,
  year_end integer not null,
  trims text[] not null default '{}',
  exact_fit boolean not null default true,
  notes text,
  trim_exclusions text[] not null default '{}',
  restrictions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, category_id)
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  country text,
  contact_name text,
  contact_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.supplier_products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  product_variant_id text references public.product_variants(id) on delete cascade,
  supplier_product_url text,
  supplier_sku text,
  supplier_variant_id text,
  supplier_cost numeric(12,2),
  supplier_shipping_cost numeric(12,2),
  supplier_moq integer,
  supplier_processing_time text,
  supplier_country text,
  supplier_contact text,
  customer_sale_price numeric(12,2),
  profit_margin numeric(8,2),
  shipping_estimate text,
  tracking_number text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  order_number text unique not null,
  email text not null,
  phone text,
  status public.order_status not null default 'Pending',
  shipping_address_id uuid references public.addresses(id) on delete set null,
  billing_address_id uuid references public.addresses(id) on delete set null,
  subtotal numeric(12,2) not null default 0,
  shipping_total numeric(12,2) not null default 0,
  discount_total numeric(12,2) not null default 0,
  refund_total numeric(12,2) not null default 0,
  payment_processing_fees numeric(12,2) not null default 0,
  advertising_cost numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_variant_id text references public.product_variants(id) on delete set null,
  product_title text,
  sku text,
  quantity integer not null default 1,
  unit_price numeric(12,2) not null default 0,
  supplier_cost numeric(12,2),
  supplier_shipping_cost numeric(12,2),
  selected_vehicle_id uuid references public.vehicles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_payment_id text,
  amount numeric(12,2) not null,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  supplier_order_number text,
  tracking_number text,
  shipping_carrier text,
  date_ordered timestamptz,
  estimated_delivery date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  status text not null,
  event_time timestamptz,
  details text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  rating integer not null,
  title text,
  review text,
  vehicle_label text,
  verified_purchase boolean not null default false,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (wishlist_id, product_id)
);

create table if not exists public.returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.return_status not null default 'Submitted',
  reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.return_items (
  id uuid primary key default gen_random_uuid(),
  return_id uuid not null references public.returns(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete set null,
  quantity integer not null default 1,
  photo_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  category text,
  subject text,
  message text,
  attachment_urls text[] not null default '{}',
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text,
  discount_value numeric(12,2),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.builds (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  vehicle_label text,
  description text,
  hero_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.build_products (
  id uuid primary key default gen_random_uuid(),
  build_id uuid not null references public.builds(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (build_id, product_id)
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  event_name text not null,
  path text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.vehicles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.shipments enable row level security;
alter table public.tracking_events enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.returns enable row level security;
alter table public.return_items enable row level security;
alter table public.support_tickets enable row level security;
alter table public.suppliers enable row level security;
alter table public.supplier_products enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_fitments enable row level security;
alter table public.categories enable row level security;
alter table public.product_categories enable row level security;
alter table public.reviews enable row level security;
alter table public.builds enable row level security;
alter table public.build_products enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.discount_codes enable row level security;
alter table public.analytics_events enable row level security;

create policy "public read products" on public.products for select using (true);
create policy "public read product images" on public.product_images for select using (true);
create policy "public read product variants" on public.product_variants for select using (true);
create policy "public read fitments" on public.product_fitments for select using (true);
create policy "public read categories" on public.categories for select using (true);
create policy "public read product categories" on public.product_categories for select using (true);
create policy "public read reviews" on public.reviews for select using (approved = true);
create policy "public read builds" on public.builds for select using (true);
create policy "public read build products" on public.build_products for select using (true);

create policy "profiles own read" on public.profiles for select using (auth.uid() = id or public.is_admin(auth.uid()));
create policy "profiles own update" on public.profiles for update using (auth.uid() = id or public.is_admin(auth.uid()));
create policy "addresses own" on public.addresses for all using (auth.uid() = user_id or public.is_admin(auth.uid())) with check (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "vehicles own" on public.vehicles for all using (auth.uid() = user_id or public.is_admin(auth.uid())) with check (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "orders own" on public.orders for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "order items own" on public.order_items for select using (exists (select 1 from public.orders where orders.id = order_items.order_id and (orders.user_id = auth.uid() or public.is_admin(auth.uid()))));
create policy "payments own" on public.payments for select using (exists (select 1 from public.orders where orders.id = payments.order_id and (orders.user_id = auth.uid() or public.is_admin(auth.uid()))));
create policy "shipments own" on public.shipments for select using (exists (select 1 from public.orders where orders.id = shipments.order_id and (orders.user_id = auth.uid() or public.is_admin(auth.uid()))));
create policy "tracking own" on public.tracking_events for select using (exists (select 1 from public.shipments join public.orders on orders.id = shipments.order_id where shipments.id = tracking_events.shipment_id and (orders.user_id = auth.uid() or public.is_admin(auth.uid()))));
create policy "wishlists own" on public.wishlists for all using (auth.uid() = user_id or public.is_admin(auth.uid())) with check (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "wishlist items own" on public.wishlist_items for all using (exists (select 1 from public.wishlists where wishlists.id = wishlist_items.wishlist_id and (wishlists.user_id = auth.uid() or public.is_admin(auth.uid())))) with check (exists (select 1 from public.wishlists where wishlists.id = wishlist_items.wishlist_id and (wishlists.user_id = auth.uid() or public.is_admin(auth.uid()))));
create policy "returns own" on public.returns for all using (auth.uid() = user_id or public.is_admin(auth.uid())) with check (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "return items own" on public.return_items for all using (exists (select 1 from public.returns where returns.id = return_items.return_id and (returns.user_id = auth.uid() or public.is_admin(auth.uid())))) with check (exists (select 1 from public.returns where returns.id = return_items.return_id and (returns.user_id = auth.uid() or public.is_admin(auth.uid()))));
create policy "support tickets own" on public.support_tickets for all using (auth.uid() = user_id or public.is_admin(auth.uid())) with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "admins manage suppliers" on public.suppliers for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins manage supplier products" on public.supplier_products for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins manage products" on public.products for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins manage product images" on public.product_images for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins manage product variants" on public.product_variants for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins manage fitments" on public.product_fitments for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins manage categories" on public.categories for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins manage product categories" on public.product_categories for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins manage reviews" on public.reviews for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins manage builds" on public.builds for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins manage build products" on public.build_products for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins manage newsletter" on public.newsletter_subscribers for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins manage discounts" on public.discount_codes for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins manage analytics" on public.analytics_events for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger set_addresses_updated_at before update on public.addresses for each row execute procedure public.set_updated_at();
create trigger set_vehicles_updated_at before update on public.vehicles for each row execute procedure public.set_updated_at();
create trigger set_products_updated_at before update on public.products for each row execute procedure public.set_updated_at();
create trigger set_product_variants_updated_at before update on public.product_variants for each row execute procedure public.set_updated_at();
create trigger set_product_fitments_updated_at before update on public.product_fitments for each row execute procedure public.set_updated_at();
create trigger set_orders_updated_at before update on public.orders for each row execute procedure public.set_updated_at();
create trigger set_shipments_updated_at before update on public.shipments for each row execute procedure public.set_updated_at();
create trigger set_returns_updated_at before update on public.returns for each row execute procedure public.set_updated_at();
create trigger set_support_tickets_updated_at before update on public.support_tickets for each row execute procedure public.set_updated_at();
