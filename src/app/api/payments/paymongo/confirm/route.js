export const runtime = "nodejs";

import { createClient } from "@supabase/supabase-js";

function basicAuth(secretKey) {
  return "Basic " + Buffer.from(`${secretKey}:`).toString("base64");
}

export async function POST(request) {
  try {
    const { session_id, reference, user_id } = (await request.json()) || {};

    if (!process.env.PAYMONGO_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing PAYMONGO_SECRET_KEY env" }),
        { status: 500 }
      );
    }

    if (!session_id && !reference) {
      return new Response(
        JSON.stringify({ error: "Provide session_id or reference" }),
        { status: 400 }
      );
    }

    let session = null;
    let pmRef = reference || null;
    let items = [];

    // Try to fetch Checkout Session from PayMongo when session_id is provided
    if (session_id) {
      const res = await fetch(
        `https://api.paymongo.com/v1/checkout_sessions/${encodeURIComponent(
          session_id
        )}`,
        {
          headers: {
            Authorization: basicAuth(process.env.PAYMONGO_SECRET_KEY),
            Accept: "application/json",
          },
        }
      );
      const json = await res.json();
      if (res.ok && json?.data) {
        session = json.data;
        const attr = session.attributes || {};
        pmRef = pmRef || attr.reference_number || null;
        const line = Array.isArray(attr.line_items) ? attr.line_items : [];
        items = line.map((li) => ({
          title: li.name || "Item",
          quantity: Math.max(1, Number(li.quantity) || 1),
          price: (Number(li.amount) || 0) / 100 || 0,
        }));
      }
    }

    // Compute totals based on cart assumptions (12% tax + 150 shipping when subtotal>0)
    const subtotal = items.reduce(
      (sum, it) => sum + (Number(it.price) || 0) * (it.quantity || 1),
      0
    );
    const taxes = subtotal * 0.12;
    const shipping = subtotal > 0 ? 150 : 0;
    const total = subtotal + taxes + shipping;

    // Determine status: if PayMongo session contains any paid payment, mark Paid; else Pending
    let status = "Pending";
    try {
      const payments = session?.attributes?.payments || [];
      if (
        Array.isArray(payments) &&
        payments.some((p) => {
          const s = (p?.attributes?.status || p?.status || "").toLowerCase();
          return s === "paid" || s === "succeeded" || s === "paid_out";
        })
      ) {
        status = "Paid";
      }
    } catch {}

    // Persist to Supabase (and decrement stock) if envs present
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

      // Load draft order by reference (preferred) or session_id
      let draft = null;
      try {
        const { data: draftRow } = await admin
          .from("orders")
          .select("id, items, status")
          .in("order_number", [pmRef, session_id].filter(Boolean))
          .maybeSingle();
        draft = draftRow || null;
      } catch {}

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
                    p_note: `paymongo:${pmRef || session_id}`,
                    p_actor_email: session?.attributes?.billing?.email || null,
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
      const orderPayload = {
        order_number: pmRef || session_id,
        total: total,
        status: status,
        items: itemsForStock,
      };
      if (user_id) orderPayload.user_id = user_id;

      try {
        if (draft) {
          const { data, error } = await admin
            .from("orders")
            .update({
              status: orderPayload.status,
              total: orderPayload.total,
              items: orderPayload.items,
            })
            .eq("order_number", draft.order_number || orderPayload.order_number)
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
      orderNumber: pmRef || session_id || "",
      date: new Date().toISOString(),
      items,
      totals: {
        subtotal,
        taxes,
        shipping,
        total,
      },
      customer: {
        name: null,
        email: session?.attributes?.billing?.email || null,
        shipping: null,
        billing: null,
      },
      payment: { method: "paymongo", status },
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
