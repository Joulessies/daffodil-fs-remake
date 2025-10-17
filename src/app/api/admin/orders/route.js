export const runtime = "nodejs";
import { getAdminClient, writeAudit } from "@/lib/admin";

export async function GET() {
  try {
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });
    const { data, error } = await admin
      .from("orders")
      .select(
        "id, order_number, total, status, created_at, customer_email, customer_name, customer_phone, shipping_address, payment_method, payment_status"
      )
      .order("created_at", { ascending: false });
    if (error) throw error;
    return new Response(JSON.stringify({ items: data || [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export async function POST(req) {
  try {
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });

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
    } = body;

    // Validate required fields
    if (!customer_email || !total) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: customer_email, total",
        }),
        { status: 400 }
      );
    }

    // Generate order number if not provided
    const orderNum = order_number || `ORD-${Date.now()}`;

    // Prepare order data
    const orderData = {
      order_number: orderNum,
      customer_email,
      customer_name: customer_name || null,
      customer_phone: customer_phone || null,
      shipping_address: shipping_address || null,
      total: Number(total),
      status,
      notes: notes || null,
      items: [],
      payment_status: "pending",
      payment_method: "manual",
    };

    // Create order
    const { data, error } = await admin
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      // Provide helpful error message for schema issues
      if (error.message?.includes("column") || error.code === "42703") {
        return new Response(
          JSON.stringify({
            error:
              "Database schema error. Please ensure the 'orders' table has all required columns. Check database-schema-orders.sql file.",
            details: error.message,
          }),
          { status: 500 }
        );
      }
      throw error;
    }

    // Write audit log
    await writeAudit({
      action: "create_order",
      entity: "orders",
      entityId: data.id,
      data: { order_number: orderNum, total },
    });

    return new Response(JSON.stringify({ order: data }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Order creation error:", err);
    return new Response(
      JSON.stringify({
        error: err.message || "Failed to create order",
        hint: "Check server logs and database schema",
      }),
      { status: 500 }
    );
  }
}
