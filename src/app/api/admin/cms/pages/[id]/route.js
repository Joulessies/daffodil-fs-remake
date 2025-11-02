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
      .from("cms_pages")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching CMS page:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch page" }),
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
      slug,
      title,
      content,
      image_url,
      philosophy_data,
      team_data,
      testimonials_data,
      values_data,
      meta_title,
      meta_description,
      status,
    } = body;

    // Validate required fields
    if (!slug || !title || !content) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: slug, title, content",
        }),
        { status: 400 }
      );
    }

    // Check if slug already exists (excluding current page)
    const { data: existing } = await admin
      .from("cms_pages")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "Page with this slug already exists" }),
        { status: 409 }
      );
    }

    const updateData = {
      slug,
      title,
      content,
      image_url: image_url || null,
      philosophy_data: philosophy_data || null,
      team_data: team_data || null,
      testimonials_data: testimonials_data || null,
      values_data: values_data || null,
      meta_title: meta_title || null,
      meta_description: meta_description || null,
      status: status || "published",
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await admin
      .from("cms_pages")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating CMS page:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to update page" }),
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

    const { error } = await admin.from("cms_pages").delete().eq("id", id);

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: "Page deleted successfully" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting CMS page:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to delete page" }),
      { status: 500 }
    );
  }
}
