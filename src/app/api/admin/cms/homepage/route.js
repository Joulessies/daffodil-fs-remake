import { getAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });

    const { data, error } = await admin
      .from("cms_homepage_sections")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;

    return new Response(JSON.stringify({ items: data || [] }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching homepage sections:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to fetch homepage sections",
      }),
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });

    const body = await req.json();
    const sections = body.sections || [];

    const updates = sections.map(async (section) => {
      const {
        id,
        section_title,
        content,
        content_type,
        display_order,
        is_active,
      } = section;

      const updateData = {
        section_title: section_title || null,
        content,
        content_type: content_type || "text",
        display_order: display_order || 0,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await admin
        .from("cms_homepage_sections")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return data;
    });

    const results = await Promise.all(updates);

    return new Response(JSON.stringify({ items: results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating homepage sections:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to update homepage sections",
      }),
      { status: 500 }
    );
  }
}
