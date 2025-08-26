export const runtime = "nodejs";
import { getAdminClient } from "@/lib/admin";

export async function GET() {
  try {
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });
    const { data, error } = await admin
      .from("orders")
      .select("id, order_number, total, status, created_at, customer_email")
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
