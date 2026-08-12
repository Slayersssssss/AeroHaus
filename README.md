# AeroHaus

AeroHaus is a premium Next.js ecommerce experience for European aftermarket automotive styling. The project is designed around storefront conversion, fitment-aware shopping, customer accounts, Stripe checkout, Supabase-backed admin operations, and private supplier profitability data.

## Stack

- Next.js 16 App Router
- TypeScript + React 19
- Tailwind CSS
- Supabase (database, auth, RLS)
- Stripe Checkout-ready API route
- Resend-ready transactional email helper
- Lucide icons

## Features

- Premium homepage with strong brand identity
- Configurable mega-menu by brand/platform
- Vehicle finder with local garage persistence
- Shop filters by brand, vehicle, category, material, badge and sort
- Detailed product pages with fitment verification and related products
- Build pages for installed-product merchandising
- Cart drawer with local persistence
- Stripe-ready checkout session endpoint
- Account garage / wishlist dashboard
- Admin dashboard, product management preview and supplier order workflow
- Order tracking lookup
- Support, returns and wholesale intake forms
- Sitemap, robots, OpenGraph and product JSON-LD
- Supabase migration with RLS policy foundation
- Demo seed script structure

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Required Environment Variables

See `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Supabase Setup

1. Create a Supabase project.
2. Apply `supabase/migrations/0001_initial.sql`.
3. Create at least one `profiles` row with `role = 'admin'` tied to an auth user.
4. Run the demo seed script once env vars are configured:

```bash
npm run seed:demo
```

## Stripe Checkout

The app uses `app/api/checkout/route.ts` to create a Stripe Checkout session. If Stripe keys are not configured, the route falls back to a demo redirect so the interface still works during local design and QA.

## Auth Notes

- Customer and admin authentication are structured around Supabase Auth.
- Account and admin routes are compatible with Supabase SSR session refresh through `proxy.ts`.
- Admin dashboards only unlock for profiles whose role is `admin`.

## Demo Data

The storefront ships with realistic placeholder catalog content and custom SVG imagery so the app remains legally safe and self-contained during development.

## Validation

Run:

```bash
npm run lint
npm run build
```
