"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTrackableOrder } from "@/lib/store";

export function OrderTracker() {
  const [orderNumber, setOrderNumber] = useState('AH-100241');
  const [email, setEmail] = useState('demo@aerohaus.dev');
  const [submitted, setSubmitted] = useState(false);
  const order = submitted ? getTrackableOrder(orderNumber, email) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="border border-white/10 bg-zinc-950/80 p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Order Tracking</p>
        <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.12em] text-white">Track Your Shipment</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-400">Enter your order number and checkout email to view your order timeline, tracking number, and current delivery status.</p>
        <div className="mt-8 grid gap-4">
          <Input value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="Order Number" />
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <Button onClick={() => setSubmitted(true)}><Search className="h-4 w-4" /> Track Order</Button>
        </div>
      </section>
      <section className="border border-white/10 bg-zinc-950/80 p-6 sm:p-8">
        {submitted && order ? (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.28em] text-lime-300">{order.orderNumber}</p><h2 className="mt-2 text-2xl font-black uppercase tracking-[0.12em] text-white">{order.status}</h2></div><div className="text-sm text-zinc-300">{order.carrier} · {order.trackingNumber}</div></div>
            <div className="mt-8 space-y-4">{order.timeline.map((event) => <div key={event.status} className="flex gap-4 border-l border-white/10 pl-5"><div className={`mt-1 h-3 w-3 -translate-x-[1.9rem] rounded-full ${event.complete ? 'bg-lime-300' : 'bg-zinc-700'}`} /><div><div className="text-sm font-semibold text-white">{event.label}</div><div className="text-sm text-zinc-400">{event.date}</div></div></div>)}</div>
          </div>
        ) : submitted ? <div className="text-sm text-zinc-400">We couldn&apos;t find an order matching those details.</div> : <div className="text-sm text-zinc-400">Use the demo order pre-filled here or replace it with live order data once Supabase orders are connected.</div>}
      </section>
    </div>
  );
}
