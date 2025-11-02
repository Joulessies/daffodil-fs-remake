import { getAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });

    const { data, error } = await admin
      .from("cms_pages")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify({ items: data || [] }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching CMS pages:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch pages" }),
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

    // Check if slug already exists
    const { data: existing } = await admin
      .from("cms_pages")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "Page with this slug already exists" }),
        { status: 409 }
      );
    }

    const pageData = {
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
    };

    const { data, error } = await admin
      .from("cms_pages")
      .insert(pageData)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating CMS page:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create page" }),
      { status: 500 }
    );
  }
}
