import { NextResponse } from "next/server";
import Stripe from "stripe";
import { env, isStripeConfigured } from "@/lib/env";
import { getProductBySlug } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json();
  const cartItems = Array.isArray(body.cartItems) ? body.cartItems : [];

  if (!isStripeConfigured) {
    return NextResponse.json({ url: '/checkout?demo=1' });
  }

  const stripe = new Stripe(env.stripeSecretKey!);
  const lineItems = cartItems.map((line: { productSlug: string; variantId: string; quantity: number }) => {
    const product = getProductBySlug(line.productSlug);
    const variant = product?.variants.find((item) => item.id === line.variantId);
    if (!product || !variant) return null;
    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.title,
          description: variant.optionLabel,
        },
        unit_amount: Math.round(variant.price * 100),
      },
      quantity: line.quantity,
    };
  }).filter(Boolean) as Stripe.Checkout.SessionCreateParams.LineItem[];

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: `${env.siteUrl}/account?checkout=success`,
    cancel_url: `${env.siteUrl}/checkout?checkout=cancelled`,
    phone_number_collection: { enabled: true },
    billing_address_collection: 'required',
    shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'DE', 'FR', 'NL', 'AE', 'AU'] },
  });

  return NextResponse.json({ url: session.url });
}
