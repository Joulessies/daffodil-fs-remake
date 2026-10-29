export const runtime = "nodejs";
import { getAdminClient, writeAudit } from "@/lib/admin";

if (!globalThis.DAFFODIL_ORDERS_STORE) {
  globalThis.DAFFODIL_ORDERS_STORE = [];
}

export async function GET() {
  let cloudItems = [];

  try {
    const admin = getAdminClient();
    if (admin) {
      const { data, error } = await admin
        .from("orders")
        .select(
          "id, order_number, total, status, created_at, customer_email, customer_name, customer_phone, shipping_address, payment_method, payment_status, items"
        )
        .order("created_at", { ascending: false });
      if (!error && Array.isArray(data)) {
        cloudItems = data;
      }
    }
  } catch (err) {}

  const mergedMap = new Map();
  globalThis.DAFFODIL_ORDERS_STORE.forEach((o) => {
    mergedMap.set(o.id || o.order_number, o);
  });
  cloudItems.forEach((o) => {
    mergedMap.set(o.id || o.order_number, o);
  });

  const allItems = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );

  return new Response(JSON.stringify({ items: allItems }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      customer_email,
      customer_name,
      customer_phone,
      shipping_address,
      total,
      notes,
      status = "pending",
      order_number,
      items = [],
      payment_method = "manual",
    } = body;

    if (!customer_email || total === undefined) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: customer_email, total",
        }),
        { status: 400 }
      );
    }

    const orderNum = order_number || `ORD-${Date.now()}`;
    const orderRecord = {
      id: orderNum,
      order_number: orderNum,
      customer_email,
      customer_name: customer_name || null,
      customer_phone: customer_phone || null,
      shipping_address: shipping_address || null,
      total: Number(total),
      status,
      notes: notes || null,
      items: items,
      payment_status: "pending",
      payment_method,
      created_at: new Date().toISOString(),
    };

    globalThis.DAFFODIL_ORDERS_STORE.unshift(orderRecord);

    try {
      const admin = getAdminClient();
      if (admin) {
        const { data: dbData } = await admin
          .from("orders")
          .insert(orderRecord)
          .select()
          .maybeSingle();
        if (dbData?.id) {
          orderRecord.id = dbData.id;
        }
      }
    } catch (dbErr) {
      console.warn("Could not write order to cloud database, kept in server memory:", dbErr.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        order: orderRecord,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Order creation error:", err);
    return new Response(
      JSON.stringify({
        error: err.message || "Failed to create order",
      }),
      { status: 500 }
    );
  }
}
