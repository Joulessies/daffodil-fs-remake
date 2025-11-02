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

    // Initialize Supabase admin client if envs are present
    let admin = null;
    let draft = null;
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE
    ) {
      admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE
      );
      
      // Load draft order FIRST to get initial data
      try {
        const { data: draftRow } = await admin
          .from("orders")
          .select("*")
          .eq("order_number", session_id)
          .maybeSingle();
        draft = draftRow || null;
      } catch {}
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

    // Use customer email from session if available, otherwise fallback to draft
    const customerEmail =
      session.customer_details?.email || session.customer_email || draft?.customer_email || null;

    const orderPayload = {
      order_number: session.id,
      total: (session.amount_total || 0) / 100,
      status:
        session.payment_status === "paid"
          ? "Paid"
          : session.status || "Pending",
      tracking_url: null,
      items,
      customer_email: customerEmail,
    };
    if (user_id) orderPayload.user_id = user_id;

    // Persist to Supabase (and decrement stock) if envs present
    let saved = null;
    let dbError = null;
    if (admin) {

      // Use draft items (with product ids) when available; else fall back to Stripe names
      const itemsForStock =
        Array.isArray(draft?.items) && draft.items.length ? draft.items : items;

      // Avoid double-decrement if already paid
      const shouldDecrement = !(
        draft && String(draft.status || "").toLowerCase() === "paid"
      );

      if (shouldDecrement) {
        for (const it of itemsForStock) {
          const qty = Math.max(1, Number(it.quantity) || 1);
          let productId = it.id;
          try {
            if (!productId && it.title) {
              const { data: prodByTitle } = await admin
                .from("products")
                .select("id, stock")
                .eq("title", it.title)
                .maybeSingle();
              if (prodByTitle) productId = prodByTitle.id;
            }
            if (productId) {
              let moved = false;
              try {
                const { error: rpcErr } = await admin.rpc(
                  "create_stock_movement_safe",
                  {
                    p_product_id: productId,
                    p_qty_delta: -qty,
                    p_reason: "sale",
                    p_note: `stripe:${session.id}`,
                    p_actor_email: session.customer_details?.email || null,
                  }
                );
                if (!rpcErr) moved = true;
              } catch {}
              if (!moved) {
                // Fallback: direct decrement
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
          } catch {}
        }
      }

      // Upsert order: update existing draft or insert new
      try {
        if (draft) {
          const { data, error } = await admin
            .from("orders")
            .update({
              status: orderPayload.status,
              total: orderPayload.total,
              items: draft.items && draft.items.length ? draft.items : items,
              customer_email: orderPayload.customer_email,
            })
            .eq("order_number", session.id)
            .select("*")
            .single();
          if (!error) saved = data;
          else dbError = error.message;
        } else {
          const { data, error } = await admin
            .from("orders")
            .insert(orderPayload)
            .select("*")
            .single();
          if (!error) saved = data;
          else dbError = error.message;
        }
      } catch (e) {
        dbError = e?.message || String(e);
      }
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
        name: session.customer_details?.name || draft?.customer_name || null,
        email: customerEmail || null,
        shipping: session.shipping_details?.address || draft?.shipping_address || null,
        billing:
          session.customer_details?.address ||
          session.shipping_details?.address ||
          null,
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
