import { PageHero } from "@/components/page-hero";
import { CheckoutPanel } from "@/components/checkout-panel";

export default function CheckoutPage() {
  return <div><PageHero eyebrow="Checkout" title="Finish Your Build" description="Stripe-ready checkout flow with shipping capture, protected payments, and Supabase order orchestration." image="/assets/page-checkout.svg" /><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><CheckoutPanel /></div></div>;
}
