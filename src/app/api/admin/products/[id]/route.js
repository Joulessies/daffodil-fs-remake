export const runtime = "nodejs";
import { getAdminClient, writeAudit } from "@/lib/admin";

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });
    const updates = {};
    [
      "title",
      "description",
      "price",
      "category",
      "status",
      "stock",
      "images",
    ].forEach((k) => {
      if (body[k] !== undefined) updates[k] = body[k];
    });
    if (updates.price != null) updates.price = Number(updates.price) || 0;
    if (updates.stock != null)
      updates.stock = Math.max(0, Number(updates.stock) || 0);
    const { data, error } = await admin
      .from("products")
      .update(updates)
      .eq("id", params.id)
      .select("*")
      .single();
    if (error) throw error;
    await writeAudit({
      action: "update",
      entity: "product",
      entityId: params.id,
      data: updates,
    });
    return new Response(JSON.stringify({ item: data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });
    const { error } = await admin.from("products").delete().eq("id", params.id);
    if (error) throw error;
    await writeAudit({
      action: "delete",
      entity: "product",
      entityId: params.id,
    });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
