import { PageHero } from "@/components/page-hero";
import { OrderTracker } from "@/components/order-tracker";

export default function TrackOrderPage() {
  return <div><PageHero eyebrow="Tracking" title="Track Your AeroHaus Order" description="Customer order lookup surfaces status, supplier progress, shipment milestone history and tracking reference data." image="/assets/page-track.svg" /><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><OrderTracker /></div></div>;
}
