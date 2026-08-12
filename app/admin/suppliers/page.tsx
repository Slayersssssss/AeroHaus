import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthContext } from "@/lib/supabase/auth";
import { saveSupplierAction } from "@/app/admin/suppliers/actions";

export default async function SuppliersPage() {
  const auth = await getAuthContext();
  if (!auth.user || auth.profile?.role !== "admin") notFound();
  const supabase = createSupabaseAdminClient();
  const { data: suppliers } = await supabase.from("suppliers").select("*").order("name");

  return (
    <div>
      <PageHero
        eyebrow="Admin Suppliers"
        title="Suppliers"
        description="Create suppliers, store confidential contact details, and manage the private supplier-side catalog relationships that power imports."
        image="/assets/page-admin-products.svg"
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <form action={saveSupplierAction} className="mb-8 grid gap-4 border border-white/10 bg-zinc-950/80 p-6 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-zinc-300">Name<input name="name" required className="h-11 border border-white/10 bg-black/30 px-3 text-white" /></label>
          <label className="grid gap-2 text-sm text-zinc-300">Contact Name<input name="contactName" className="h-11 border border-white/10 bg-black/30 px-3 text-white" /></label>
          <label className="grid gap-2 text-sm text-zinc-300">Email<input name="email" className="h-11 border border-white/10 bg-black/30 px-3 text-white" /></label>
          <label className="grid gap-2 text-sm text-zinc-300">Phone<input name="phone" className="h-11 border border-white/10 bg-black/30 px-3 text-white" /></label>
          <label className="grid gap-2 text-sm text-zinc-300">WhatsApp<input name="whatsapp" className="h-11 border border-white/10 bg-black/30 px-3 text-white" /></label>
          <label className="grid gap-2 text-sm text-zinc-300">Website<input name="website" className="h-11 border border-white/10 bg-black/30 px-3 text-white" /></label>
          <label className="grid gap-2 text-sm text-zinc-300">Store URL<input name="alibabaStoreUrl" className="h-11 border border-white/10 bg-black/30 px-3 text-white" /></label>
          <label className="grid gap-2 text-sm text-zinc-300">Country<input name="country" className="h-11 border border-white/10 bg-black/30 px-3 text-white" /></label>
          <label className="grid gap-2 text-sm text-zinc-300">Currency<input name="currency" defaultValue="USD" className="h-11 border border-white/10 bg-black/30 px-3 text-white" /></label>
          <label className="grid gap-2 text-sm text-zinc-300">Default Processing Days<input name="defaultProcessingDays" type="number" className="h-11 border border-white/10 bg-black/30 px-3 text-white" /></label>
          <label className="grid gap-2 text-sm text-zinc-300 md:col-span-2">Notes<textarea name="notes" className="min-h-28 border border-white/10 bg-black/30 px-3 py-3 text-white" /></label>
          <div className="md:col-span-2"><Button type="submit">Create Supplier</Button></div>
        </form>

        <div className="grid gap-4">
          {(suppliers ?? []).map((supplier) => (
            <form key={supplier.id} action={saveSupplierAction} className="grid gap-4 border border-white/10 bg-zinc-950/80 p-6 md:grid-cols-2">
              <input type="hidden" name="id" value={supplier.id} />
              <label className="grid gap-2 text-sm text-zinc-300">Name<input name="name" defaultValue={supplier.name ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-white" /></label>
              <label className="grid gap-2 text-sm text-zinc-300">Contact Name<input name="contactName" defaultValue={supplier.contact_name ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-white" /></label>
              <label className="grid gap-2 text-sm text-zinc-300">Email<input name="email" defaultValue={supplier.contact_email ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-white" /></label>
              <label className="grid gap-2 text-sm text-zinc-300">Phone<input name="phone" defaultValue={supplier.phone ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-white" /></label>
              <label className="grid gap-2 text-sm text-zinc-300">WhatsApp<input name="whatsapp" defaultValue={supplier.whatsapp ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-white" /></label>
              <label className="grid gap-2 text-sm text-zinc-300">Website<input name="website" defaultValue={supplier.website ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-white" /></label>
              <label className="grid gap-2 text-sm text-zinc-300">Store URL<input name="alibabaStoreUrl" defaultValue={supplier.alibaba_store_url ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-white" /></label>
              <label className="grid gap-2 text-sm text-zinc-300">Country<input name="country" defaultValue={supplier.country ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-white" /></label>
              <label className="grid gap-2 text-sm text-zinc-300">Currency<input name="currency" defaultValue={supplier.currency ?? "USD"} className="h-11 border border-white/10 bg-black/30 px-3 text-white" /></label>
              <label className="grid gap-2 text-sm text-zinc-300">Default Processing Days<input name="defaultProcessingDays" type="number" defaultValue={supplier.default_processing_days ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-white" /></label>
              <label className="grid gap-2 text-sm text-zinc-300 md:col-span-2">Notes<textarea name="notes" defaultValue={supplier.notes ?? ""} className="min-h-28 border border-white/10 bg-black/30 px-3 py-3 text-white" /></label>
              <div className="flex flex-wrap gap-3 md:col-span-2">
                <Button type="submit">Save Supplier</Button>
                <Link href="/admin/import" className="inline-flex items-center border border-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-300">View Imported Catalogs</Link>
              </div>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
