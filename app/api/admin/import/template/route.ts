import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthContext } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth.user || auth.profile?.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const supplierId = typeof body.supplierId === "string" ? body.supplierId : "";
  const name = typeof body.name === "string" ? body.name : "";
  const mapping = body.mapping ?? {};
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("supplier_mapping_templates")
    .insert({
      supplier_id: supplierId,
      name,
      mapping,
      created_by: auth.user.id,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ template: data });
}
