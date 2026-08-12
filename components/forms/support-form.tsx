"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { SupportCategory } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  orderNumber: z.string().optional(),
  businessName: z.string().optional(),
  website: z.string().optional(),
  message: z.string().min(10, "Add more detail to help our team"),
  category: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function SupportForm({ title, description, categoryOptions, submitLabel = "Submit" }: { title: string; description: string; categoryOptions?: SupportCategory[]; submitLabel?: string; }) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { name: "", email: "", phone: "", orderNumber: "", businessName: "", website: "", message: "", category: categoryOptions?.[0] ?? "" } });
  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    toast.success(`${title} received`, { description: `Demo submission captured for ${values.email}. Connect Supabase storage/email to make this live.` });
    form.reset();
    setSubmitting(false);
  });
  return (
    <div className="border border-white/10 bg-zinc-950/80 p-6 sm:p-8"><div className="max-w-2xl"><h2 className="text-3xl font-black uppercase tracking-[0.12em] text-white">{title}</h2><p className="mt-4 text-sm leading-7 text-zinc-400">{description}</p></div><form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}><div><Input placeholder="Name" {...form.register("name")} /><p className="mt-2 text-xs text-rose-300">{form.formState.errors.name?.message}</p></div><div><Input placeholder="Email" {...form.register("email")} /><p className="mt-2 text-xs text-rose-300">{form.formState.errors.email?.message}</p></div><Input placeholder="Phone" {...form.register("phone")} /><Input placeholder="Order Number" {...form.register("orderNumber")} /><Input placeholder="Business Name (optional)" {...form.register("businessName")} /><Input placeholder="Website / Instagram (optional)" {...form.register("website")} />{categoryOptions ? <div className="md:col-span-2"><Select {...form.register("category")}>{categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}</Select></div> : null}<div className="md:col-span-2"><Textarea placeholder="How can we help?" {...form.register("message")} /><p className="mt-2 text-xs text-rose-300">{form.formState.errors.message?.message}</p></div><div className="md:col-span-2"><Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : submitLabel}</Button></div></form></div>
  );
}
