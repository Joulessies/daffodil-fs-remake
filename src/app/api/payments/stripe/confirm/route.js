export const runtime = "nodejs";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const { session_id, user_id } = await request.json();
    if (!session_id) {
      return new Response(JSON.stringify({ error: "Missing session_id" }), {
        status: 400,
      });
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }),
        { status: 500 }
      );
    }

    // Use account default API version for maximum compatibility
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Only expand line_items; other fields are included by default
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items"],
    });
    if (!session) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
      });
    }

    const line = session.line_items?.data || [];
    const items = line.map((li) => ({
      title: li.description,
      quantity: li.quantity || 1,
      price: (li.price?.unit_amount || 0) / 100,
    }));

    const orderPayload = {
      order_number: session.id,
      total: (session.amount_total || 0) / 100,
      status:
        session.payment_status === "paid"
          ? "Paid"
          : session.status || "Pending",
      tracking_url: null,
      items,
    };
    if (user_id) orderPayload.user_id = user_id;

    // Persist to Supabase if envs present
    let saved = null;
    let dbError = null;
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE
    ) {
      const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE
      );
      const { data, error } = await admin
        .from("orders")
        .insert(orderPayload)
        .select("*")
        .single();
      if (!error) saved = data;
      else dbError = error.message;
    } else {
      dbError =
        "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE env; order not persisted.";
    }

    const order = {
      orderNumber: session.id,
      date: session.created
        ? new Date(session.created * 1000).toISOString()
        : new Date().toISOString(),
      items,
      totals: {
        subtotal: (session.amount_subtotal || 0) / 100,
        taxes:
          ((session.total_details && session.total_details.amount_tax) || 0) /
          100,
        shipping:
          ((session.total_details && session.total_details.amount_shipping) ||
            0) / 100,
        total: (session.amount_total || 0) / 100,
      },
      customer: {
        name: session.customer_details ? session.customer_details.name : null,
        email: session.customer_details ? session.customer_details.email : null,
        shipping: session.shipping_details
          ? session.shipping_details.address
          : null,
        billing:
          session.customer_details && session.customer_details.address
            ? session.customer_details.address
            : session.shipping_details
            ? session.shipping_details.address
            : null,
      },
      payment: { method: "card", status: session.payment_status || "paid" },
      trackingUrl: null,
      savedId: saved?.id || null,
    };

    return new Response(
      JSON.stringify({ order, savedId: saved?.id || null, dbError }),
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
