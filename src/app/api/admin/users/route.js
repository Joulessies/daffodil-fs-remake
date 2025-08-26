export const runtime = "nodejs";
import { getAdminClient } from "@/lib/admin";

export async function GET() {
  try {
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });
    // Expect a "users" table with email, is_admin, suspended
    const { data, error } = await admin
      .from("users")
      .select("id, email, is_admin, suspended")
      .order("email");
    if (error) throw error;
    return new Response(JSON.stringify({ items: data || [] }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
