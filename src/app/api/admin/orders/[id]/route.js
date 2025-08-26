export const runtime = "nodejs";
import { getAdminClient, writeAudit } from "@/lib/admin";

export async function GET(_req, { params }) {
  try {
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });
    const { data, error } = await admin
      .from("orders")
      .select("*, items")
      .eq("id", params.id)
      .single();
    if (error) throw error;
    return new Response(JSON.stringify({ order: data }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });
    const updates = {};
    if (body.status) updates.status = body.status;
    if (body.tracking_url !== undefined)
      updates.tracking_url = body.tracking_url;
    const { data, error } = await admin
      .from("orders")
      .update(updates)
      .eq("id", params.id)
      .select("*")
      .single();
    if (error) throw error;
    await writeAudit({
      action: "update",
      entity: "order",
      entityId: params.id,
      data: updates,
    });
    return new Response(JSON.stringify({ order: data }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
