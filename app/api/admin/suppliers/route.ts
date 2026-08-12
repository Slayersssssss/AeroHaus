import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthContext } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth.user || auth.profile?.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Supplier name is required." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("suppliers")
    .insert({
      name,
      website: typeof body.website === "string" ? body.website.trim() || null : null,
      alibaba_store_url:
        typeof body.alibabaStoreUrl === "string" ? body.alibabaStoreUrl.trim() || null : null,
      currency: typeof body.currency === "string" ? body.currency.trim() || "USD" : "USD",
      notes: typeof body.notes === "string" ? body.notes.trim() || null : null,
    })
    .select("id, name")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Could not create supplier." }, { status: 500 });
  }

  return NextResponse.json({ supplier: data });
}
