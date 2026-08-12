import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { defaultPricingSettings } from "@/lib/importer";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthContext } from "@/lib/supabase/auth";
import { savePricingSettingsAction } from "@/app/admin/settings/pricing/actions";

export default async function PricingSettingsPage() {
  const auth = await getAuthContext();
  if (!auth.user || auth.profile?.role !== "admin") notFound();
  const supabase = createSupabaseAdminClient();
  const { data: settings } = await supabase
    .from("pricing_settings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (
    <div>
      <PageHero
        eyebrow="Admin Settings"
        title="Pricing Engine"
        description="Configure landed-cost markup tiers, minimum gross margin, and rounding behavior for supplier imports."
        image="/assets/page-admin.svg"
      />
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <form action={savePricingSettingsAction} className="grid gap-5 border border-white/10 bg-zinc-950/80 p-6">
          <input type="hidden" name="id" defaultValue={settings?.id ?? ""} />
          <label className="grid gap-2 text-sm text-zinc-300">
            Settings Name
            <input name="name" defaultValue={settings?.name ?? "Default Pricing Rules"} className="h-11 border border-white/10 bg-black/30 px-3 text-white" />
          </label>
          <label className="grid gap-2 text-sm text-zinc-300">
            Pricing Rules JSON
            <textarea name="rules" defaultValue={JSON.stringify(settings?.rules ?? defaultPricingSettings.rules, null, 2)} className="min-h-48 border border-white/10 bg-black/30 px-3 py-3 font-mono text-sm text-white" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-zinc-300">
              Minimum Gross Margin %
              <input name="minimumGrossMargin" type="number" step="0.01" defaultValue={settings?.minimum_gross_margin ?? defaultPricingSettings.minimumGrossMargin} className="h-11 border border-white/10 bg-black/30 px-3 text-white" />
            </label>
            <label className="grid gap-2 text-sm text-zinc-300">
              Rounding Mode
              <select name="roundingMode" defaultValue={settings?.rounding_mode ?? defaultPricingSettings.roundingMode} className="h-11 border border-white/10 bg-black/30 px-3 text-white">
                <option value="nearest-9">Nearest $9</option>
                <option value="nearest-99">Nearest $.99</option>
              </select>
            </label>
          </div>
          <Button type="submit">Save Pricing Settings</Button>
        </form>
      </div>
    </div>
  );
}
