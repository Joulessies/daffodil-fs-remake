export const runtime = "nodejs";
import { getAdminClient, writeAudit } from "@/lib/admin";
import { PRODUCTS } from "@/lib/products";

export async function POST() {
  try {
    const admin = getAdminClient();
    if (!admin) {
      const urlPresent = !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.SUPABASE_URL ||
        process.env.NEXT_SUPABASE_URL
      );
      const keyPresent = !!(
        process.env.SUPABASE_SERVICE_ROLE ||
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_KEY
      );
      return new Response(
        JSON.stringify({
          error: "Missing admin key",
          diagnostics: {
            urlPresent,
            keyPresent,
            expected: [
              "NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL",
              "SUPABASE_SERVICE_ROLE (service role key)",
            ],
          },
        }),
        { status: 500 }
      );
    }

    // Transform static catalog to DB rows
    const mapTopLevelCategory = (raw = "") => {
      const c = String(raw || "").toLowerCase();
      if (
        ["bouquets", "arrangements", "wedding", "sympathy"].some((k) =>
          c.includes(k)
        )
      )
        return "floral";
      if (
        ["seasonal", "spring", "summer", "autumn", "winter"].some((k) =>
          c.includes(k)
        )
      )
        return "seasonal";
      if (
        ["gifts", "gift", "for her", "for him", "special"].some((k) =>
          c.includes(k)
        )
      )
        return "gifts";
      return "floral";
    };

    const rows = (PRODUCTS || []).map((p) => ({
      id: p.id, // use slug id so public pages can link consistently
      title: p.title,
      description: p.description || "",
      price: Number(p.price) || 0,
      category: mapTopLevelCategory(p.category || ""),
      status: "active",
      stock: Number.isFinite(p.price) && Number(p.price) > 0 ? 20 : 0,
      images: Array.isArray(p.images) ? p.images : [],
    }));

    // Upsert by id
    const { data, error } = await admin
      .from("products")
      .upsert(rows, { onConflict: "id" })
      .select("id");
    if (error) throw error;

    await writeAudit({
      action: "import",
      entity: "product",
      data: { count: rows.length },
    });

    return new Response(JSON.stringify({ imported: data?.length || 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
