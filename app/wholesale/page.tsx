import { SupportForm } from "@/components/forms/support-form";
import { PageHero } from "@/components/page-hero";

export default function WholesalePage() {
  return <div><PageHero eyebrow="Wholesale" title="Trade & Installer Accounts" description="Built for body shops, performance shops, detail studios, installers and dealership groups looking for curated Euro styling supply." image="/assets/page-wholesale.svg" /><div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8"><SupportForm title="Wholesale Application" description="Submit your business details, website or Instagram, location and expected monthly order volume to start a wholesale review." submitLabel="Apply for Wholesale" /></div></div>;
}
