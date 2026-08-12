import { AuthSignInForm } from "@/components/auth-signin-form";
import { PageHero } from "@/components/page-hero";

export default async function SignInPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams;
  const redirectTo = typeof searchParams.redirect === 'string' ? searchParams.redirect : '/account';
  return <div><PageHero eyebrow="Auth" title="AeroHaus Account Access" description="Customer sign-in, admin sign-in, and saved-garage persistence all route through Supabase Auth." image="/assets/page-auth.svg" /><div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8"><AuthSignInForm redirectTo={redirectTo} /></div></div>;
}
