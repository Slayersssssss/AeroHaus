"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function saveSupplierAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const payload = {
    id: String(formData.get("id") ?? "") || undefined,
    name: String(formData.get("name") ?? "").trim(),
    contact_name: String(formData.get("contactName") ?? "").trim() || null,
    contact_email: String(formData.get("email") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
    website: String(formData.get("website") ?? "").trim() || null,
    alibaba_store_url: String(formData.get("alibabaStoreUrl") ?? "").trim() || null,
    country: String(formData.get("country") ?? "").trim() || null,
    currency: String(formData.get("currency") ?? "USD").trim() || "USD",
    default_processing_days:
      Number(formData.get("defaultProcessingDays") ?? 0) || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  };

  await supabase.from("suppliers").upsert(payload, { onConflict: "id" });
  revalidatePath("/admin/suppliers");
  revalidatePath("/admin/import");
}
