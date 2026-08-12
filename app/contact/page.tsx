import { SupportForm } from "@/components/forms/support-form";
import { PageHero } from "@/components/page-hero";

export default function ContactPage() {
  return <div><PageHero eyebrow="Support" title="Contact AeroHaus" description="Order status, fitment questions, returns, damage claims, wholesale inquiries and product support all flow through a structured intake form." image="/assets/page-contact.svg" /><div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8"><SupportForm title="Customer Support" description="Upload-ready support workflows can connect to Supabase storage and Resend transactional email notifications." categoryOptions={["Order Status", "Fitment Question", "Product Question", "Return", "Damage Claim", "Wholesale", "Other"]} submitLabel="Send Request" /></div></div>;
}
