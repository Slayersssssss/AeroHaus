import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInAction } from "@/app/auth/sign-in/actions";

export function AuthSignInForm({ redirectTo }: { redirectTo?: string }) {
  return (
    <form action={signInAction} className="border border-white/10 bg-zinc-950/80 p-6 sm:p-8">
      <input type="hidden" name="redirectTo" value={redirectTo ?? '/account'} />
      <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Customer & Admin Access</p>
      <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.12em] text-white">Sign In</h1>
      <p className="mt-4 text-sm leading-7 text-zinc-400">Supabase Auth is configured for customer accounts and admin roles. Use your production Supabase project keys to enable live authentication.</p>
      <div className="mt-8 grid gap-4">
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="password" type="password" placeholder="Password" required />
        <Button type="submit">Sign In</Button>
      </div>
    </form>
  );
}
