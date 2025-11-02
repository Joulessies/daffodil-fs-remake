import { getAdminClient } from "@/lib/supabase-admin";

export async function GET(req, { params }) {
  try {
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });

    const { id } = params;

    const { data, error } = await admin
      .from("cms_promotions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching promotion:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch promotion" }),
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });

    const { id } = params;
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

    const updateData = {
      title,
      description: description || null,
      image_url: image_url || null,
      link_url: link_url || null,
      position,
      priority: priority || 0,
      start_date: start_date || null,
      end_date: end_date || null,
      is_active: is_active !== undefined ? is_active : true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await admin
      .from("cms_promotions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating promotion:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to update promotion",
      }),
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });

    const { id } = params;

    const { error } = await admin.from("cms_promotions").delete().eq("id", id);

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: "Promotion deleted successfully" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting promotion:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to delete promotion",
      }),
      { status: 500 }
    );
  }
}
