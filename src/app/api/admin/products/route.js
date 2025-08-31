export const runtime = "nodejs";
import { getAdminClient, writeAudit } from "@/lib/admin";

// GET: list products
export async function GET(request) {
  try {
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = Math.max(
      1,
      Math.min(100, Number(url.searchParams.get("pageSize") || "10"))
    );
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await admin
      .from("products")
      .select(
        "id, title, description, price, category, status, stock, images",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw error;
    return new Response(
      JSON.stringify({ items: data || [], total: count || 0, page, pageSize }),
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

// POST: create product
export async function POST(request) {
  try {
    const body = await request.json();
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });
    const toSlug = (s = "") =>
      String(s)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const payload = {
      id: toSlug(body.id || body.title || crypto.randomUUID()),
      title: body.title,
      description: body.description || "",
      price: Number(body.price) || 0,
      category: body.category || "",
      status: body.status || "active",
      stock: Math.max(0, Number(body.stock) || 0),
      images: body.images || [],
    };
    const { data, error } = await admin
      .from("products")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;
    await writeAudit({
      action: "create",
      entity: "product",
      entityId: data.id,
      data: payload,
    });
    return new Response(JSON.stringify({ item: data }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
