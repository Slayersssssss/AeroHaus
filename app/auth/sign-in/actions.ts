"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInAction(formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const redirectTo = String(formData.get('redirectTo') ?? '/account');
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(
      `/auth/sign-in?error=supabase-not-configured&redirect=${encodeURIComponent(redirectTo)}` as never
    );
  }

  await supabase.auth.signInWithPassword({ email, password });
  redirect(redirectTo as never);
}
