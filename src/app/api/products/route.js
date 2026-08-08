export const runtime = "nodejs";
import { getAdminClient } from "@/lib/admin";
import { PRODUCTS } from "@/lib/products";

export async function GET(request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");

  try {
    const admin = getAdminClient();
    if (admin) {
      const { data, error } = await admin
        .from("products")
        .select(
          "id, title, description, price, category, status, stock, images, created_at"
        )
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const filtered = category
          ? data.filter((p) => String(p.category || "") === String(category))
          : data;
        return new Response(JSON.stringify({ items: filtered }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        });
      }
    }
  } catch (err) {}

  // Fallback to in-memory product catalog
  const filtered = category
    ? PRODUCTS.filter((p) => String(p.category || "") === String(category))
    : PRODUCTS;

  return new Response(JSON.stringify({ items: filtered }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
