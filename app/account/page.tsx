import { AccountDashboard } from "@/components/account-dashboard";
import { PageHero } from "@/components/page-hero";
import { getAuthContext } from "@/lib/supabase/auth";
import { getAccountOrders } from "@/lib/storefront-server";
import { formatCurrency } from "@/lib/utils";

export default async function AccountPage() {
  const auth = await getAuthContext();
  const orders = auth.user ? await getAccountOrders(auth.user.id) : [];
  return (
    <div>
      <PageHero eyebrow="Account" title="My Garage & Orders" description="Profile, order history, tracking, saved vehicles, wishlist, addresses, support requests and returns all route through this account surface." image="/assets/page-account.svg" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {!auth.user ? <div className="mb-8 border border-white/10 bg-zinc-950/80 p-6 text-sm text-zinc-400">Sign in with Supabase Auth to persist orders, addresses, returns, support requests and wishlist data. The local garage and cart still work for guest browsing.</div> : null}
        {auth.user ? (
          <section className="mb-8 border border-white/10 bg-zinc-950/80 p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Order History</p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.12em] text-white">Recent Orders</h2>
            <div className="mt-6 grid gap-4">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <article key={order.id} className="border border-white/10 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-white">{order.order_number}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-500">
                          {order.status} · {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-lime-300">
                        {formatCurrency(Number(order.subtotal ?? 0))}
                      </div>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-zinc-400">
                      {(order.order_items ?? []).map((item: { product_title: string; quantity: number; unit_price: number }) => (
                        <div key={`${item.product_title}-${item.quantity}`}>
                          {item.product_title} · Qty {item.quantity} · {formatCurrency(Number(item.unit_price))}
                        </div>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <div className="border border-white/10 p-4 text-sm text-zinc-400">
                  No orders yet for this account.
                </div>
              )}
            </div>
          </section>
        ) : null}
        <AccountDashboard />
      </div>
    </div>
  );
}
