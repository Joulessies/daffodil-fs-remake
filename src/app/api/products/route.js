export const runtime = "nodejs";
import { getAdminClient } from "@/lib/admin";

export async function GET(request) {
  try {
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });

    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const { data, error } = await admin
      .from("products")
      .select(
        "id, title, description, price, category, status, stock, images, created_at"
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const items = Array.isArray(data) ? data : [];
    const filtered = category
      ? items.filter((p) => String(p.category || "") === String(category))
      : items;
    return new Response(JSON.stringify({ items: filtered }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
