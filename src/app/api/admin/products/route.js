export const runtime = "nodejs";
import { getAdminClient, writeAudit } from "@/lib/admin";

// GET: list products
export async function GET() {
  try {
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });
    const { data, error } = await admin
      .from("products")
      .select("id, title, description, price, category, status, stock, images")
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

// POST: create product
export async function POST(request) {
  try {
    const body = await request.json();
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });
    const payload = {
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
