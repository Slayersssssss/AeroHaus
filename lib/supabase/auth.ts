import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAuthContext() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      user: null,
      profile: null,
      isConfigured: false,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      isConfigured: true,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, email")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile,
    isConfigured: true,
  };
}

export async function requireAdmin() {
  const auth = await getAuthContext();
  if (!auth.user || auth.profile?.role !== "admin") {
    redirect("/auth/sign-in?redirect=/admin");
  }

  return auth;
}
