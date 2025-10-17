export const runtime = "nodejs";
import { getAdminClient, writeAudit } from "@/lib/admin";

// POST /api/admin/products/restock
// Body options:
// - { ids: ["id1","id2"], amount: 5 }                -> increment stock by amount for specific ids
// - { ids: ["id1"], setTo: 10 }                         -> set stock to value if lower
// - { threshold: 5, target: 10 }                          -> for all products with stock <= threshold, set to target
// - { threshold: 5, increment: 5 }                         -> for all <= threshold, increment by amount
export async function POST(request) {
  try {
    const admin = getAdminClient();
    if (!admin) {
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });
    }

    const body = await request.json();
    const {
      ids = null,
      amount = null,
      setTo = null,
      threshold = null,
      target = null,
      increment = null,
    } = body || {};

    let updated = 0;

    if (Array.isArray(ids) && ids.length > 0) {
      if (amount != null) {
        const { data, error } = await admin
          .rpc("increment_product_stock", {
            p_ids: ids,
            p_amount: Number(amount),
          })
          .select();
        if (error) throw error;
        updated = data?.updated || 0;
      } else if (setTo != null) {
        const { data, error } = await admin
          .from("products")
          .update({}) // dummy to satisfy builder; the update is done in SQL below
          .select("id")
          .limit(0);
        // fallback to plain SQL when RPC not present
        const { error: sqlErr } = await admin.rpc("execute_sql", {
          sql: `update products set stock = greatest(stock, $1) where id = any($2::text[])`,
          params: [Number(setTo), ids],
        });
        if (sqlErr) {
          // fallback using query builder in batches
          const { error: upErr } = await admin
            .from("products")
            .update({ stock: Number(setTo) })
            .in("id", ids)
            .lt("stock", Number(setTo));
          if (upErr) throw upErr;
        }
        // we won't know exact count; return -1 to indicate unknown
        updated = -1;
      }
    } else if (threshold != null && (target != null || increment != null)) {
      if (target != null) {
        const { error } = await admin
          .from("products")
          .update({ stock: Number(target) })
          .lte("stock", Number(threshold));
        if (error) throw error;
        updated = -1;
      } else if (increment != null) {
        // No arithmetic updates via query builder; fetch then update
        const { data: rows, error } = await admin
          .from("products")
          .select("id, stock")
          .lte("stock", Number(threshold));
        if (error) throw error;
        const inc = Number(increment);
        for (const r of rows || []) {
          const { error: upErr } = await admin
            .from("products")
            .update({ stock: Number(r.stock || 0) + inc })
            .eq("id", r.id);
          if (upErr) throw upErr;
          updated++;
        }
      }
    } else {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
      });
    }

    await writeAudit({
      action: "restock_products",
      entity: "products",
      data: { ids, amount, setTo, threshold, target, increment, updated },
    });

    return new Response(JSON.stringify({ ok: true, updated }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
