import { AccountDashboard } from "@/components/account-dashboard";
import { PageHero } from "@/components/page-hero";
import { getAuthContext } from "@/lib/supabase/auth";

export default async function AccountPage() {
  const auth = await getAuthContext();
  return (
    <div>
      <PageHero eyebrow="Account" title="My Garage & Orders" description="Profile, order history, tracking, saved vehicles, wishlist, addresses, support requests and returns all route through this account surface." image="/assets/page-account.svg" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {!auth.user ? <div className="mb-8 border border-white/10 bg-zinc-950/80 p-6 text-sm text-zinc-400">Sign in with Supabase Auth to persist orders, addresses, returns, support requests and wishlist data. The local garage and cart still work for guest browsing.</div> : null}
        <AccountDashboard />
      </div>
    </div>
  );
}
