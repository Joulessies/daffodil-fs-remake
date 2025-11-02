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
      items = [],
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
      items: items,
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

    // Handle stock reduction if items are provided and status is paid/confirmed
    let stockError = null;
    if (
      items &&
      items.length > 0 &&
      (status === "paid" || status === "confirmed")
    ) {
      try {
        // Reduce stock for each item
        for (const item of items) {
          const qty = Math.max(1, Number(item.quantity) || 1);
          let productId = item.id;

          // Try to find product by ID first, then by title
          if (!productId && item.title) {
            const { data: prodByTitle } = await admin
              .from("products")
              .select("id, stock")
              .eq("title", item.title)
              .maybeSingle();
            if (prodByTitle) productId = prodByTitle.id;
          }

          if (productId) {
            // Try to use the stock movement function first
            let moved = false;
            try {
              const { error: rpcErr } = await admin.rpc(
                "create_stock_movement_safe",
                {
                  p_product_id: productId,
                  p_qty_delta: -qty,
                  p_reason: "sale",
                  p_note: `admin_order:${orderNum}`,
                  p_actor_email: customer_email,
                }
              );
              if (!rpcErr) moved = true;
            } catch {}

            // Fallback: direct decrement
            if (!moved) {
              const { data: prod } = await admin
                .from("products")
                .select("stock")
                .eq("id", productId)
                .maybeSingle();
              const current = Number(prod?.stock) || 0;
              const newStock = Math.max(0, current - qty);
              await admin
                .from("products")
                .update({ stock: newStock })
                .eq("id", productId);
            }
          }
        }
      } catch (err) {
        stockError = err.message;
        console.error("Stock reduction error:", err);
      }
    }

    // Write audit log
    await writeAudit({
      action: "create_order",
      entity: "orders",
      entityId: data.id,
      data: { order_number: orderNum, total },
    });

    return new Response(
      JSON.stringify({
        order: data,
        stockReduced: !stockError,
        stockError: stockError || null,
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
        hint: "Check server logs and database schema",
      }),
      { status: 500 }
    );
  }
}
