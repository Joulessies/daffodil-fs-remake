import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Public client for CMS content
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req, { params }) {
  try {
    const { slug } = params;

    const { data, error } = await supabase
      .from("cms_pages")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return new Response(JSON.stringify({ error: "Page not found" }), {
          status: 404,
        });
      }
      throw error;
    }

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
