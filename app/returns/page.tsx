import { SupportForm } from "@/components/forms/support-form";
import { PageHero } from "@/components/page-hero";

export default function ReturnsPage() {
  return <div><PageHero eyebrow="Returns" title="Return Requests & Damage Claims" description="Customers can identify the order, select the issue type, and submit photo-backed requests for review." image="/assets/page-returns.svg" /><div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8"><SupportForm title="Start a Return Request" description="Use this workflow for changed-mind, wrong item, fitment issue, damaged product, defective product and other cases. Damage claims for large body or carbon items can require packaging photos, product photos, shipping label images and detail images within a configurable claim window." categoryOptions={["Return", "Damage Claim", "Other"]} submitLabel="Submit Claim" /></div></div>;
}
