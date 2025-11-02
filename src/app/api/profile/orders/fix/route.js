export const runtime = "nodejs";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const { email, orderNumber, customerName } = await request.json();

    if (!email || !orderNumber) {
      return new Response(
        JSON.stringify({ error: "Email and order number required" }),
        {
          status: 400,
        }
      );
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE
    ) {
      return new Response(
        JSON.stringify({ error: "Database not configured" }),
        {
          status: 500,
        }
      );
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE
    );

    // Find orders without customer_email or with different email
    const { data: orders, error } = await admin
      .from("orders")
      .select("*")
      .or(`customer_email.is.null,customer_email.neq.${email}`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Update orders that match the order number or customer name
    let updatedCount = 0;
    for (const order of orders || []) {
      if (
        order.order_number === orderNumber ||
        (customerName && order.customer_name === customerName)
      ) {
        const { error: updateError } = await admin
          .from("orders")
          .update({ customer_email: email })
          .eq("id", order.id);

        if (!updateError) {
          updatedCount++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: `Updated ${updatedCount} orders with email ${email}`,
        totalOrders: orders?.length || 0,
        updatedCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
