"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function revalidateOrder(orderNumber: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath("/account");
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!orderId || !status) {
    throw new Error("Missing order id or status.");
  }

  await supabase.from("orders").update({ status }).eq("id", orderId);
  revalidateOrder(orderNumber);
}

export async function updateShipmentAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  const shippingCarrier = String(formData.get("shippingCarrier") ?? "").trim();
  const supplierOrderNumber = String(formData.get("supplierOrderNumber") ?? "").trim();
  const estimatedDelivery = String(formData.get("estimatedDelivery") ?? "").trim();
  const status = String(formData.get("shipmentStatus") ?? "Shipped").trim();

  if (!orderId) {
    throw new Error("Missing order id.");
  }

  const { data: existingShipment } = await supabase
    .from("shipments")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  let shipmentId = existingShipment?.id ?? null;

  if (shipmentId) {
    await supabase
      .from("shipments")
      .update({
        tracking_number: trackingNumber || null,
        shipping_carrier: shippingCarrier || null,
        supplier_order_number: supplierOrderNumber || null,
        estimated_delivery: estimatedDelivery || null,
      })
      .eq("id", shipmentId);
  } else {
    const { data: insertedShipment, error } = await supabase
      .from("shipments")
      .insert({
        order_id: orderId,
        tracking_number: trackingNumber || null,
        shipping_carrier: shippingCarrier || null,
        supplier_order_number: supplierOrderNumber || null,
        estimated_delivery: estimatedDelivery || null,
      })
      .select("id")
      .single();

    if (error || !insertedShipment) {
      throw error ?? new Error("Could not create shipment.");
    }

    shipmentId = insertedShipment.id;
  }

  await supabase.from("orders").update({ status }).eq("id", orderId);

  if (shipmentId && trackingNumber) {
    await supabase.from("tracking_events").insert({
      shipment_id: shipmentId,
      status,
      event_time: new Date().toISOString(),
      details: `${shippingCarrier || "Carrier"} tracking added: ${trackingNumber}`,
    });
  }

  revalidateOrder(orderNumber);
}
