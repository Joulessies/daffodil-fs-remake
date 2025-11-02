import { getAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });

    const { data, error } = await admin
      .from("cms_promotions")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify({ items: data || [] }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch promotions" }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });

    const body = await req.json();
    const {
      title,
      description,
      image_url,
      link_url,
      position,
      priority,
      start_date,
      end_date,
      is_active,
    } = body;

    // Validate required fields
    if (!title || !position) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: title, position",
        }),
        { status: 400 }
      );
    }

    const promotionData = {
      title,
      description: description || null,
      image_url: image_url || null,
      link_url: link_url || null,
      position,
      priority: priority || 0,
      start_date: start_date || null,
      end_date: end_date || null,
      is_active: is_active !== undefined ? is_active : true,
    };

    const { data, error } = await admin
      .from("cms_promotions")
      .insert(promotionData)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating promotion:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create promotion",
      }),
      { status: 500 }
    );
  }
}
