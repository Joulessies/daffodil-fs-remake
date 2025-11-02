import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const position = searchParams.get("position");

    let query = supabase
      .from("cms_promotions")
      .select("*")
      .eq("is_active", true)
      .lte("start_date", new Date().toISOString())
      .gte("end_date", new Date().toISOString())
      .order("priority", { ascending: false });

    // Filter by position if provided
    if (position) {
      query = query.eq("position", position);
    }

    const { data, error } = await query;

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
