"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { defaultPricingSettings } from "@/lib/importer";

export async function savePricingSettingsAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const name = String(formData.get("name") ?? "Default Pricing Rules");
  const rules = JSON.parse(
    String(formData.get("rules") ?? JSON.stringify(defaultPricingSettings.rules))
  );
  const minimumGrossMargin = Number(formData.get("minimumGrossMargin") ?? 55);
  const roundingMode = String(formData.get("roundingMode") ?? "nearest-9");

  await supabase.from("pricing_settings").upsert(
    {
      id: String(formData.get("id") ?? "") || undefined,
      name,
      rules,
      minimum_gross_margin: minimumGrossMargin,
      rounding_mode: roundingMode,
    },
    { onConflict: "id" }
  );

  revalidatePath("/admin/settings/pricing");
  revalidatePath("/admin/import");
}
