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
    if (body.is_admin !== undefined) updates.is_admin = !!body.is_admin;
    if (body.suspended !== undefined) updates.suspended = !!body.suspended;
    const { data, error } = await admin
      .from("users")
      .update(updates)
      .eq("id", params.id)
      .select("*")
      .single();
    if (error) throw error;
    await writeAudit({
      action: "update",
      entity: "user",
      entityId: params.id,
      data: updates,
    });
    return new Response(JSON.stringify({ user: data }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
